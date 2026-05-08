"""
Talebook 电子书管理插件
支持连接 Talebook 服务器进行电子书搜索、扫描和批量导入
"""
from typing import Dict, List, Optional, Tuple, Any
from app.plugins import _PluginBase
from app.log import logger
from app.schemas.types import EventType
from app.core.cache import cached
from .talebook_api_client import TalebookApiClient


class Talebook(_PluginBase):
    """
    Talebook 电子书管理插件
    
    功能:
    - 搜索电子书(浏览 Talebook 书库)
    - 扫描本地目录发现小说文件
    - 批量导入小说到 Talebook 书库
    - 与 Sonovel 联动(Sonovel 下载,Talebook 导入)
    """
    
    # 插件元数据
    plugin_name = "Talebook"
    plugin_desc = "Talebook 本地书库管理，支持扫描目录批量导入小说（与 Sonovel 联动）"
    plugin_icon = "Calibre_B.png"
    plugin_version = "1.0.4"
    plugin_author = "trient"
    author_url = "https://github.com/zhonxinya/MoviePilot-Plugins"
    plugin_config_prefix = "talebook_"
    plugin_order = 0
    auth_level = 1
    
    def __init__(self):
        super().__init__()
        self._enabled = False
        self._server_url = ""
        self._username = ""
        self._password = ""
        self._verify_ssl = True  # SSL 验证开关
        
        # API 客户端实例
        self._api_client: Optional[TalebookApiClient] = None
    
    def __del__(self):
        """
        析构函数：确保资源被清理
        
        作为 stop_service() 的兜底，防止插件异常退出时资源泄漏
        """
        try:
            if self._api_client:
                self._api_client.close()
                logger.debug("Talebook 插件析构：API 客户端已清理")
        except Exception:
            pass  # 析构函数中不应抛出异常
        
    def init_plugin(self, config: dict = None):
        """
        初始化插件
        
        优化策略:
        1. 如果 config 为 None，主动从数据库读取最新配置
        2. 确保每次初始化都基于最新配置，避免 stale data
        3. 安全关闭旧客户端后再创建新客户端
        """
        logger.info(f"Talebook 插件 init_plugin 被调用, config={config is not None}")
        
        # 如果 config 为 None，从数据库读取最新配置
        if config is None:
            config = self.get_config() or {}
            logger.info(f"从数据库读取配置: enabled={bool(config.get('enabled', False))}, server_url={'✓' if config.get('server_url') else '✗'}")
        
        # 提取配置项
        self._enabled = bool(config.get("enabled", False))
        self._server_url = config.get("server_url", "").rstrip("/")
        self._username = config.get("username", "")
        self._password = config.get("password", "")
        self._verify_ssl = config.get("verify_ssl", True)  # 默认启用 SSL 验证
        
        logger.info(
            f"Talebook 配置: enabled={self._enabled}, "
            f"server_url={'✓' if self._server_url else '✗'}, "
            f"username={'✓' if self._username else '✗'}, "
            f"password={'✓' if self._password else '✗'}, "
            f"verify_ssl={self._verify_ssl}"
        )
        
        # 初始化图片缓存(TTL 24小时,最大 1000 张图片)
        from app.core.cache import TTLCache
        self._image_cache = TTLCache(region="talebook_images", maxsize=1000, ttl=86400)
        logger.info(f"✅ 图片缓存已初始化: region=talebook_images, maxsize=1000, ttl=24h")
        
        # 安全关闭旧的 API 客户端
        if self._api_client:
            try:
                self._api_client.close()
                logger.debug("已关闭旧的 API 客户端")
            except Exception as e:
                logger.warning(f"关闭旧 API 客户端异常: {str(e)}")
            finally:
                self._api_client = None
        
        # 创建新的 API 客户端（仅在配置完整且启用时）
        if self._enabled and self._server_url and self._username and self._password:
            self._api_client = TalebookApiClient(
                server_url=self._server_url,
                username=self._username,
                password=self._password,
                verify_ssl=self._verify_ssl
            )
            logger.info(f"✅ Talebook API 客户端已创建: server={self._server_url}")
        else:
            self._api_client = None
            if not self._enabled:
                logger.info("Talebook 插件已禁用")
            else:
                missing = []
                if not self._server_url:
                    missing.append("server_url")
                if not self._username:
                    missing.append("username")
                if not self._password:
                    missing.append("password")
                logger.warning(f"❌ Talebook 插件配置不完整,缺失: {', '.join(missing)}")
    
    def get_state(self) -> bool:
        """
        获取插件状态
        """
        return self._enabled
    
    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        """
        定义插件命令
        """
        return [
            {
                "cmd": "/tb-search",
                "event": EventType.PluginAction,
                "desc": "搜索电子书",
                "category": "Talebook",
                "data": {
                    "action": "search"
                }
            },
            {
                "cmd": "/tb-download",
                "event": EventType.PluginAction,
                "desc": "下载电子书",
                "category": "Talebook",
                "data": {
                    "action": "download"
                }
            }
        ]
    
    def get_api(self) -> List[Dict[str, Any]]:
        """
        注册插件 API
        """
        return [
            {
                "path": "/book/detail/{book_id}",
                "endpoint": self.get_book_detail,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取书籍详情",
                "description": "根据书籍 ID 获取详细信息",
            },
            {
                "path": "/recent",
                "endpoint": self.api_get_recent_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取最近添加的书籍",
                "description": "获取最近添加的电子书列表",
            },
            {
                "path": "/hot",
                "endpoint": self.api_get_hot_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取热门书籍",
                "description": "获取热门电子书列表",
            },
            {
                "path": "/search",
                "endpoint": self.api_search_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "搜索电子书",
                "description": "根据关键词搜索电子书",
            },
            {
                "path": "/scan",
                "endpoint": self.api_scan_and_import,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "扫描并导入本地小说",
                "description": "扫描配置的本地目录,批量导入小说到 Talebook 书库",
            },
            {
                "path": "/import",
                "endpoint": self.api_import_single_book,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "导入单个小说文件",
                "description": "将指定的本地小说文件导入到 Talebook 书库",
            },
            # API Key 认证端点(用于自动化测试和外部系统集成)
            {
                "path": "/api/recent",
                "endpoint": self.api_get_recent_books,
                "methods": ["GET"],
                "auth": "apikey",
                "summary": "获取最近添加的书籍(API Key)",
                "description": "使用 API Key 认证获取最近添加的电子书列表",
            },
            {
                "path": "/api/hot",
                "endpoint": self.api_get_hot_books,
                "methods": ["GET"],
                "auth": "apikey",
                "summary": "获取热门书籍(API Key)",
                "description": "使用 API Key 认证获取热门电子书列表",
            },
            {
                "path": "/api/search",
                "endpoint": self.api_search_books,
                "methods": ["GET"],
                "auth": "apikey",
                "summary": "搜索电子书(API Key)",
                "description": "使用 API Key 认证搜索电子书",
            },
            {
                "path": "/api/book/detail/{book_id}",
                "endpoint": self.get_book_detail,
                "methods": ["GET"],
                "auth": "apikey",
                "summary": "获取书籍详情(API Key)",
                "description": "使用 API Key 认证获取书籍详细信息",
            },
            {
                "path": "/api/scan",
                "endpoint": self.api_scan_and_import,
                "methods": ["POST"],
                "auth": "apikey",
                "summary": "扫描并导入本地小说(API Key)",
                "description": "使用 API Key 认证扫描并导入本地小说",
            },
            {
                "path": "/api/import",
                "endpoint": self.api_import_single_book,
                "methods": ["POST"],
                "auth": "apikey",
                "summary": "导入单个小说文件(API Key)",
                "description": "使用 API Key 认证导入单个小说文件",
            },
            {
                "path": "/action",
                "endpoint": self.handle_action,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "处理前端操作",
                "description": "处理前端的导入、查看详情等操作",
            },
            {
                "path": "/api/user/info",
                "endpoint": self.api_get_user_info,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取当前用户信息",
                "description": "获取 Talebook 当前登录用户的详细信息",
            },
            # 收藏和阅读状态 API
            {
                "path": "/book/favorite/{book_id}",
                "endpoint": self.api_add_favorite,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "收藏书籍",
                "description": "将指定书籍添加到收藏",
            },
            {
                "path": "/book/unfavorite/{book_id}",
                "endpoint": self.api_remove_favorite,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "取消收藏",
                "description": "从收藏中移除指定书籍",
            },
            {
                "path": "/book/readstate/{book_id}",
                "endpoint": self.api_set_book_read_state,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "设置书籍阅读状态",
                "description": "设置书籍为未读/在读/已读 (0/1/2)",
            },
            {
                "path": "/reading/list",
                "endpoint": self.api_get_reading_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取正在阅读的书籍列表",
                "description": "获取当前用户正在阅读的书籍",
            },
            {
                "path": "/favorites/list",
                "endpoint": self.api_get_favorite_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取收藏的书籍列表",
                "description": "获取当前用户收藏的书籍",
            },
            # 元数据相关 API
            {
                "path": "/book/{book_id}/refer",
                "endpoint": self.api_get_book_refer_meta,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取书籍外部元数据",
                "description": "从豆瓣等外部源搜索书籍元数据",
            },
            {
                "path": "/book/{book_id}/refer/apply",
                "endpoint": self.api_apply_book_refer_meta,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "应用外部元数据",
                "description": "将选中的外部元数据应用到书籍",
            },
            {
                "path": "/book/{book_id}/related",
                "endpoint": self.api_get_related_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取相关书籍",
                "description": "根据作者、标签等获取相似书籍",
            },
            # 通用书籍列表 API
            {
                "path": "/books",
                "endpoint": self.api_get_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取书籍列表",
                "description": "分页获取书籍列表,支持搜索和筛选",
            },
            # 元数据分类 API
            {
                "path": "/meta/{meta_type}",
                "endpoint": self.api_get_meta_list,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取元数据列表",
                "description": "获取标签/作者/丛书/评分/出版社/语言列表",
            },
            {
                "path": "/meta/{meta_type}/{name}",
                "endpoint": self.api_get_meta_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取指定元数据的书籍",
                "description": "获取包含指定标签/作者等的书籍列表",
            },
            {
                "path": "/config",
                "endpoint": self.api_get_config,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取插件配置",
                "description": "获取当前插件的配置信息",
            },
            {
                "path": "/config",
                "endpoint": self.api_save_config,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "保存插件配置",
                "description": "保存插件配置并重新初始化",
            },
            # 通用图片代理 API (需要认证)
            {
                "path": "/image/proxy",
                "endpoint": self.api_proxy_image,
                "methods": ["GET"],
                "auth": "bear",  # 需要认证
                "summary": "通用图片代理",
                "description": "通过插件代理下载任意图片 URL(解决 CORS 问题)",
            },
        ]
    
    def _check_plugin_ready(self) -> Optional[Dict[str, Any]]:
        """
        检查插件是否就绪（通用配置检查）
        
        统一的配置检查逻辑，避免在每个 API 方法中重复编写
        
        Returns:
            None: 插件就绪，可以继续执行
            Dict: 错误响应，包含 code 和 message
        """
        if not self._enabled:
            logger.warning("Talebook 插件未启用")
            return {"code": 400, "message": "插件未启用"}
        
        if not self._ensure_api_client():
            config = self.get_config() or {}
            enabled = bool(config.get("enabled", False))
            server_url = config.get("server_url", "")
            username = config.get("username", "")
            password = config.get("password", "")
            
            missing_fields = []
            if not enabled:
                missing_fields.append("插件未启用")
            if not server_url:
                missing_fields.append("服务器地址")
            if not username:
                missing_fields.append("用户名")
            if not password:
                missing_fields.append("密码")
            
            error_msg = f"API 客户端未初始化。缺失配置: {', '.join(missing_fields)}"
            logger.error(error_msg)
            logger.error(f"当前配置状态: enabled={enabled}, server_url={'✓' if server_url else '✗'}, username={'✓' if username else '✗'}, password={'✓' if password else '✗'}")
            
            return {"code": 500, "message": error_msg}
        
        return None
    
    def _ensure_api_client(self) -> bool:
        """
        确保 API 客户端已正确初始化
        
        如果 API 客户端未初始化但配置完整，尝试重新初始化
        用于处理插件重载后配置不一致的情况
        
        Returns:
            True: API 客户端可用
            False: API 客户端不可用
        """
        if self._api_client:
            return True
        
        # API 客户端不存在，检查配置是否完整
        config = self.get_config() or {}
        enabled = bool(config.get("enabled", False))
        server_url = config.get("server_url", "").rstrip("/")
        username = config.get("username", "")
        password = config.get("password", "")
        verify_ssl = config.get("verify_ssl", True)
        
        if not enabled:
            logger.warning("Talebook 插件未启用")
            return False
        
        if not all([server_url, username, password]):
            missing = []
            if not server_url:
                missing.append("server_url")
            if not username:
                missing.append("username")
            if not password:
                missing.append("password")
            logger.error(f"Talebook 配置不完整，缺失: {', '.join(missing)}")
            return False
        
        # 配置完整，尝试重新初始化
        logger.info("检测到 API 客户端未初始化，尝试从数据库配置重新初始化...")
        try:
            self.init_plugin(config)
            if self._api_client:
                logger.info("✅ API 客户端重新初始化成功")
                return True
            else:
                logger.error("❌ API 客户端重新初始化失败")
                return False
        except Exception as e:
            logger.error(f"重新初始化 API 客户端异常: {str(e)}")
            return False
    
    def get_book_detail(self, book_id: int) -> Dict[str, Any]:
        """
        获取书籍详细信息
        
        :param book_id: 书籍 ID
        :return: 书籍详细信息
        """
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        # 确保 API 客户端已正确初始化
        if not self._ensure_api_client():
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            # 使用带缓存的方法获取详情
            result = self._cached_get_book_detail(book_id)
            
            # _cached_get_book_detail 已经返回 {"code": xxx, "data": ...} 格式
            # 直接返回,不要再次包装
            return result
        except Exception as e:
            logger.error(f"获取书籍详情异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    @cached(
        region="talebook_book_detail",
        maxsize=512,
        ttl=86400,  # 24小时(书籍详情变化较少)
        skip_none=True
    )
    def _cached_get_book_detail(self, book_id: int):
        """
        获取书籍详细信息(带缓存)
        
        缓存策略:
        - 缓存时间: 24小时
        - 最大缓存数: 512条
        - 跳过 None 值(不缓存失败的请求)
        
        :param book_id: 书籍 ID
        :return: 书籍详细信息字典
        """
        # 双重检查: 确保 API 客户端存在
        if not self._api_client:
            logger.error("API 客户端在缓存方法中为 None")
            return None
        
        logger.debug(f"从 API 获取书籍详情: book_id={book_id}")
        return self._api_client.get_book_detail(book_id)
    
    def api_get_recent_books(self, limit: int = 20) -> Dict[str, Any]:
        """
        API: 获取最近添加的书籍
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            # 使用带缓存的方法
            books = self._cached_get_recent_books(limit)
            return {"code": 200, "data": books}
        except Exception as e:
            logger.error(f"获取最近书籍异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    @cached(
        region="talebook_recent",
        maxsize=100,
        ttl=1800,  # 30分钟(最近添加更新较频繁)
        skip_none=True,
        skip_empty=True
    )
    def _cached_get_recent_books(self, limit: int = 20):
        """
        获取最近添加的书籍(带缓存)
        
        缓存策略:
        - 缓存时间: 30分钟
        - 最大缓存数: 100条
        - 跳过 None 和空结果
        
        :param limit: 返回数量限制
        :return: 书籍列表
        """
        # 双重检查: 确保 API 客户端存在
        if not self._api_client:
            logger.error("API 客户端在缓存方法中为 None")
            return None
        
        logger.debug(f"从 API 获取最近书籍: limit={limit}")
        return self._api_client.get_recent_books(limit)
    
    def api_get_hot_books(self, limit: int = 20) -> Dict[str, Any]:
        """
        API: 获取热门书籍
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            # 使用带缓存的方法
            books = self._cached_get_hot_books(limit)
            return {"code": 200, "data": books}
        except Exception as e:
            logger.error(f"获取热门书籍异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    @cached(
        region="talebook_hot",
        maxsize=100,
        ttl=3600,  # 1小时(热门榜单每小时更新)
        skip_none=True,
        skip_empty=True
    )
    def _cached_get_hot_books(self, limit: int = 20):
        """
        获取热门书籍(带缓存)
        
        缓存策略:
        - 缓存时间: 1小时
        - 最大缓存数: 100条
        - 跳过 None 和空结果
        
        :param limit: 返回数量限制
        :return: 书籍列表
        """
        # 双重检查: 确保 API 客户端存在
        if not self._api_client:
            logger.error("API 客户端在缓存方法中为 None")
            return None
        
        logger.debug(f"从 API 获取热门书籍: limit={limit}")
        return self._api_client.get_hot_books(limit)
    
    def api_search_books(self, keyword: str = "") -> Dict[str, Any]:
        """
        API: 搜索电子书
        """
        if not keyword:
            logger.warning("搜索关键词为空")
            return {"code": 400, "message": "请提供搜索关键词"}
        
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            logger.info(f"开始搜索书籍: keyword={keyword}")
            # 使用带缓存的搜索方法
            books = self._cached_search_books(keyword)
            logger.info(f"搜索完成: 找到 {len(books)} 本书")
            return {"code": 200, "data": books}
        except Exception as e:
            logger.error(f"搜索书籍异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"搜索失败: {str(e)}"}
    
    @cached(
        region="talebook_search",
        maxsize=256,
        ttl=3600,  # 1小时(搜索结果可能频繁变化)
        skip_none=True,
        skip_empty=True  # 不缓存空结果
    )
    def _cached_search_books(self, keyword: str):
        """
        搜索电子书(带缓存)
        
        缓存策略:
        - 缓存时间: 1小时
        - 最大缓存数: 256条
        - 跳过 None 和空结果
        
        :param keyword: 搜索关键词
        :return: 书籍列表
        """
        # 双重检查: 确保 API 客户端存在
        if not self._api_client:
            logger.error("API 客户端在缓存方法中为 None")
            return None
        
        logger.debug(f"从 API 搜索书籍: keyword={keyword}")
        return self._api_client.search_books(keyword)
    
    def api_scan_and_import(self) -> Dict[str, Any]:
        """
        API: 扫描本地目录并批量导入小说
        
        采用两阶段流程:
        1. 扫描阶段: 扫描配置的目录,发现新的电子书文件
        2. 导入阶段: 将扫描到的文件批量导入到 Talebook 书库
        
        :return: 扫描和导入结果
        """
        import time as time_module
        api_start_time = time_module.time()
        
        logger.info("=" * 80)
        logger.info("📥 [API] 收到扫描导入请求")
        logger.info(f"   插件状态: enabled={self._enabled}")
        logger.info(f"   服务器配置: server_url={'✓' if self._server_url else '✗'}")
        logger.info(f"   用户配置: username={'✓' if self._username else '✗'}, password={'✓' if self._password else '✗'}")
        logger.info("=" * 80)
        
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            # 使用 API 客户端执行远端扫描和导入
            logger.info("🚀 开始执行远端扫描导入...")
            result = self._api_client.scan_and_import_remote()
            
            api_elapsed = time_module.time() - api_start_time
            logger.info(f"\n{'=' * 80}")
            logger.info(f"🏁 [API] 扫描导入完成 (总耗时: {api_elapsed:.2f}秒)")
            logger.info(f"   返回码: {result.get('code')}")
            logger.info(f"   消息: {result.get('message', 'N/A')}")
            if result.get('data'):
                data = result['data']
                logger.info(f"   数据: total_files={data.get('total_files', 0)}, "
                           f"new_files={data.get('new_files', 0)}, "
                           f"exist_files={data.get('exist_files', 0)}, "
                           f"imported_count={data.get('imported_count', 0)}")
            logger.info(f"{'=' * 80}\n")
            
            return result
        except Exception as e:
            api_elapsed = time_module.time() - api_start_time
            logger.error(f"❌ [API] 扫描导入异常 (耗时: {api_elapsed:.2f}秒): {str(e)}")
            import traceback
            logger.error(f"堆栈跟踪:\n{traceback.format_exc()}")
            return {"code": 500, "message": f"扫描失败: {str(e)}"}
    
    def api_import_single_book(self, file_path: str) -> Dict[str, Any]:
        """
        API: 导入单个小说文件
        
        :param file_path: 本地小说文件路径
        :return: 导入结果
        """
        if not file_path:
            return {"code": 400, "message": "请提供文件路径"}
        
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            success = self._api_client.import_book_to_talebook(file_path)
            if success:
                return {"code": 200, "message": "导入成功", "data": {"file": file_path}}
            else:
                return {"code": 500, "message": "导入失败,请查看日志"}
        except Exception as e:
            logger.error(f"导入书籍异常: {str(e)}")
            return {"code": 500, "message": f"导入失败: {str(e)}"}
    
    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        """
        获取插件配置表单
        
        Vue 联邦模式下返回 None + 当前配置模型
        配置页面由 Config.vue 组件负责渲染
        
        注意: 这不是 staticmethod，需要从数据库读取最新配置
        """
        # 从数据库读取当前配置
        config = self.get_config() or {}
        
        logger.debug(f"get_form 返回配置: enabled={bool(config.get('enabled', False))}, server_url={'✓' if config.get('server_url') else '✗'}")
        
        return None, {
            "enabled": bool(config.get("enabled", False)),
            "server_url": config.get("server_url", ""),
            "username": config.get("username", ""),
            "password": config.get("password", ""),
            "verify_ssl": config.get("verify_ssl", True)
        }
    
    def get_render_mode(self) -> Tuple[str, str]:
        """
        获取插件渲染模式
        
        详情页使用 Vue 联邦模式,支持复杂的搜索、下载等交互逻辑。
        
        Returns:
            1. 渲染模式: vue(联邦模式)
            2. 组件路径: dist/assets(构建产物位置)
        """
        return "vue", "dist/assets"
    
    def get_page(self) -> List[dict]:
        """
        获取插件页面 - 使用 Vue 联邦模式展示电子书库
        
        支持复杂的搜索、下载、实时进度等交互逻辑。
        """
        # 从数据库获取最新配置,确保前端拿到最新的 server_url
        config = self.get_config() or {}
        server_url = config.get("server_url", "").rstrip("/")
        enabled = bool(config.get("enabled", False))
        username = config.get("username", "")
        verify_ssl = config.get("verify_ssl", True)
        
        logger.info(f"📄 get_page 被调用")
        logger.info(f"   配置状态: enabled={enabled}")
        logger.info(f"   server_url={'✓' if server_url else '✗'} ({server_url})")
        logger.info(f"   username={'✓' if username else '✗'}")
        logger.info(f"   verify_ssl={verify_ssl}")
        
        # 构建传递给前端的 model
        model_data = {
            'server_url': server_url,
            'enabled': enabled,
            'username': username,
            'verify_ssl': verify_ssl
        }
        
        logger.info(f"   传递给前端的 model: {model_data}")
        
        return [
            {
                'component': 'PluginVueApp',
                'props': {
                    'plugin_id': self.__class__.__name__,
                    'page_name': 'Page',
                    # 传递配置给前端,用于构建图片URL
                    # 注意:不传递 password(安全考虑)
                    'model': model_data
                }
            }
        ]
    
    def get_agent_tools(self):
        """
        注册智能体工具
        
        为 MoviePilot AI 智能体提供电子书管理功能:
        - 搜索电子书
        - 获取书籍详情
        - 收藏/取消收藏
        - 设置阅读状态
        - 查看收藏和阅读列表
        """
        from .agent_tools import get_talebook_tools
        return get_talebook_tools()
    
    def stop_service(self):
        """
        停止插件服务时清理资源
        """
        # 关闭 API 客户端
        if self._api_client:
            try:
                self._api_client.close()
            except Exception:
                pass
            self._api_client = None
        
        # 清理图片缓存
        if hasattr(self, '_image_cache'):
            try:
                self._image_cache.clear()
                logger.info("✅ 图片缓存已清理")
            except Exception as e:
                logger.warning(f"清理图片缓存异常: {str(e)}")
        
        logger.info("Talebook 插件服务已停止,API 客户端已清理")
    
    def api_get_user_info(self) -> Dict[str, Any]:
        """
        API: 获取当前用户信息
        
        :return: 用户信息
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            return self._api_client.get_user_info()
        except Exception as e:
            logger.error(f"获取用户信息异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_get_book_refer_meta(self, book_id: int) -> Dict[str, Any]:
        """
        API: 获取书籍的外部元数据
        
        :param book_id: 书籍 ID
        :return: 外部元数据列表
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            return self._api_client.get_book_refer_meta(book_id)
        except Exception as e:
            logger.error(f"获取外部元数据异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_apply_book_refer_meta(self, book_id: int, provider_key: str = "", 
                                  provider_value: str = "", only_meta: bool = False, 
                                  only_cover: bool = False) -> Dict[str, Any]:
        """
        API: 应用外部元数据到书籍
        
        :param book_id: 书籍 ID
        :param provider_key: 元数据来源 (如 "douban")
        :param provider_value: 元数据值 (如豆瓣 ID)
        :param only_meta: 仅应用元数据
        :param only_cover: 仅应用封面
        :return: 操作结果
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            return self._api_client.apply_book_refer_meta(
                book_id, provider_key, provider_value, only_meta, only_cover
            )
        except Exception as e:
            logger.error(f"应用外部元数据异常: {str(e)}")
            return {"code": 500, "message": f"应用失败: {str(e)}"}
    
    def api_get_related_books(self, book_id: int, limit: int = 10) -> Dict[str, Any]:
        """
        API: 获取相关书籍
        
        :param book_id: 书籍 ID
        :param limit: 返回数量限制
        :return: 相关书籍列表
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            books = self._api_client.get_related_books(book_id, limit)
            return {"code": 200, "data": books}
        except Exception as e:
            logger.error(f"获取相关书籍异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_get_books(self, page: int = 1, limit: int = 20, search: str = "") -> Dict[str, Any]:
        """
        API: 获取书籍列表(分页)
        
        :param page: 页码
        :param limit: 每页数量
        :param search: 搜索关键词(可选)
        :return: 书籍列表和总数
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            # 如果有搜索关键词，使用搜索 API（更高效）
            if search:
                logger.info(f"搜索书籍: keyword={search}, page={page}, limit={limit}")
                search_result = self._api_client.search_books(search)
                
                if not search_result:
                    return {
                        "code": 200,
                        "data": {
                            "books": [],
                            "total": 0,
                            "page": page,
                            "limit": limit
                        }
                    }
                
                # 对搜索结果进行分页
                total = len(search_result)
                start = (page - 1) * limit
                end = start + limit
                paginated_books = search_result[start:end]
                
                return {
                    "code": 200,
                    "data": {
                        "books": paginated_books,
                        "total": total,
                        "page": page,
                        "limit": limit
                    }
                }
            else:
                # 无搜索关键词时，获取最近添加的书籍
                # 优化：只获取当前页所需的数据量，而不是全部
                fetch_limit = page * limit  # 获取到当前页末尾
                books = self._api_client.get_recent_books(fetch_limit)
                
                if not books:
                    return {
                        "code": 200,
                        "data": {
                            "books": [],
                            "total": 0,
                            "page": page,
                            "limit": limit
                        }
                    }
                
                total = len(books)
                
                # 分页处理
                start = (page - 1) * limit
                end = start + limit
                paginated_books = books[start:end]
                
                return {
                    "code": 200,
                    "data": {
                        "books": paginated_books,
                        "total": total,
                        "page": page,
                        "limit": limit
                    }
                }
        except Exception as e:
            logger.error(f"获取书籍列表异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_get_meta_list(self, meta_type: str, show_all: bool = False) -> Dict[str, Any]:
        """
        API: 获取元数据列表
        
        :param meta_type: 元数据类型 (tag/author/series/rating/publisher/language)
        :param show_all: 是否显示所有条目
        :return: 元数据列表
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        # 验证元数据类型
        valid_types = ['tag', 'author', 'series', 'rating', 'publisher', 'language']
        if meta_type not in valid_types:
            return {"code": 400, "message": f"无效的元数据类型: {meta_type}, 支持: {', '.join(valid_types)}"}
        
        try:
            return self._api_client.get_meta_list(meta_type, show_all)
        except Exception as e:
            logger.error(f"获取元数据列表异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_get_meta_books(self, meta_type: str, name: str, page: int = 1, num: int = 20) -> Dict[str, Any]:
        """
        API: 获取指定元数据的书籍列表
        
        :param meta_type: 元数据类型 (tag/author/series/rating/publisher/language)
        :param name: 元数据名称
        :param page: 页码
        :param num: 每页数量
        :return: 书籍列表
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        # 验证元数据类型
        valid_types = ['tag', 'author', 'series', 'rating', 'publisher', 'language']
        if meta_type not in valid_types:
            return {"code": 400, "message": f"无效的元数据类型: {meta_type}, 支持: {', '.join(valid_types)}"}
        
        try:
            return self._api_client.get_meta_books(meta_type, name, page, num)
        except Exception as e:
            logger.error(f"获取元数据书籍异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_add_favorite(self, book_id: int) -> Dict[str, Any]:
        """
        API: 收藏书籍
        
        :param book_id: 书籍 ID
        :return: 操作结果
        """
        logger.info(f"📥 [API] 收到收藏请求: book_id={book_id}")
        
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            logger.info(f"🔖 调用 API 客户端收藏书籍: book_id={book_id}")
            result = self._api_client.set_book_favorite(book_id, favorite=True)
            logger.info(f"📤 API 返回结果: code={result.get('code')}, message={result.get('message')}")
            return result
        except Exception as e:
            logger.error(f"❌ 收藏书籍异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"操作失败: {str(e)}"}
    
    def api_remove_favorite(self, book_id: int) -> Dict[str, Any]:
        """
        API: 取消收藏
        
        :param book_id: 书籍 ID
        :return: 操作结果
        """
        logger.info(f"📥 [API] 收到取消收藏请求: book_id={book_id}")
        
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            logger.info(f"❌ 调用 API 客户端取消收藏: book_id={book_id}")
            result = self._api_client.set_book_favorite(book_id, favorite=False)
            logger.info(f"📤 API 返回结果: code={result.get('code')}, message={result.get('message')}")
            return result
        except Exception as e:
            logger.error(f"❌ 取消收藏异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"操作失败: {str(e)}"}
    
    def api_set_book_read_state(self, book_id: int, read_state: int) -> Dict[str, Any]:
        """
        API: 设置书籍阅读状态
        
        :param book_id: 书籍 ID
        :param read_state: 阅读状态 (0=未读, 1=在读, 2=已读)
        :return: 操作结果
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            return self._api_client.set_book_read_state(book_id, read_state)
        except Exception as e:
            logger.error(f"设置阅读状态异常: {str(e)}")
            return {"code": 500, "message": f"操作失败: {str(e)}"}
    
    def api_get_reading_books(self, limit: int = 20) -> Dict[str, Any]:
        """
        API: 获取正在阅读的书籍列表
        
        :param limit: 返回数量限制（默认20，范围1-100）
        :return: 书籍列表
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            return self._api_client.get_reading_books(limit)
        except Exception as e:
            logger.error(f"获取在读列表异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_get_favorite_books(self, limit: int = 50) -> Dict[str, Any]:
        """
        API: 获取收藏的书籍列表
        
        :param limit: 返回数量限制（默认50，范围1-100）
        :return: 书籍列表
        """
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        try:
            return self._api_client.get_favorite_books(limit)
        except Exception as e:
            logger.error(f"获取收藏列表异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_get_config(self) -> Dict[str, Any]:
        """
        API: 获取插件配置
        
        Returns:
            当前插件配置信息
        """
        try:
            # 从数据库获取当前配置
            config = self.get_config() or {}
            
            # 检查配置完整性
            enabled = bool(config.get("enabled", False))
            server_url = config.get("server_url", "").rstrip("/")
            username = config.get("username", "")
            password = config.get("password", "")
            verify_ssl = config.get("verify_ssl", True)
            
            # 判断配置是否完整
            config_complete = enabled and server_url and username and password
            
            logger.info(f"配置状态: enabled={enabled}, server_url={'✓' if server_url else '✗'}, username={'✓' if username else '✗'}, password={'✓' if password else '✗'}, api_client={'✓' if self._api_client else '✗'}")
            
            return {
                "code": 200,
                "message": "success",
                "data": {
                    "enabled": enabled,
                    "server_url": server_url,
                    "username": username,
                    "password": "*" * len(password) if password else "",  # 隐藏密码
                    "verify_ssl": verify_ssl,
                    "config_complete": config_complete,
                    "api_client_initialized": self._api_client is not None
                }
            }
        except Exception as e:
            logger.error(f'❌ 获取配置失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    

    
    def api_save_config(self, config_data: dict = None) -> Dict[str, Any]:
        """
        API: 保存插件配置
        
        Args:
            config_data: 配置数据字典
            
        Returns:
            保存结果
        """
        if not config_data:
            return {"code": 400, "message": "缺少配置数据"}
        
        try:
            # 验证必要字段
            if "enabled" not in config_data:
                return {"code": 400, "message": "缺少 enabled 字段"}
            
            # 获取当前配置
            current_config = self.get_config() or {}
            
            # 合并新配置
            new_config = {
                "enabled": bool(config_data.get("enabled", False)),
                "server_url": config_data.get("server_url", current_config.get("server_url", "")).rstrip("/"),
                "username": config_data.get("username", current_config.get("username", "")),
                "password": config_data.get("password", current_config.get("password", "")),
                "verify_ssl": config_data.get("verify_ssl", current_config.get("verify_ssl", True))
            }
            
            # 保存配置到数据库
            self.update_config(new_config)
            
            # 重新初始化插件以应用新配置 (会自动关闭旧客户端并创建新客户端)
            self.init_plugin(new_config)
            
            logger.info(f'✅ 配置已更新: enabled={new_config["enabled"]}, server={new_config["server_url"]}')
            
            return {
                "code": 200,
                "message": "配置保存成功",
                "data": new_config
            }
        except Exception as e:
            logger.error(f'❌ 保存配置失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def handle_action(self, action: str, book_id: int = None, **kwargs):
        """
        处理前端操作
        
        :param action: 操作类型 (import/detail)
        :param book_id: 书籍 ID
        :return: 操作结果
        """
        if not self._enabled:
            logger.warning("Talebook 插件未启用")
            return {"code": 400, "message": "插件未启用"}
        
        # 确保 API 客户端已正确初始化
        if not self._ensure_api_client():
            config = self.get_config() or {}
            logger.error(
                f"Talebook API 客户端未初始化。缺失配置:\n"
                f"  enabled={bool(config.get('enabled', False))}, "
                f"server_url={'✓' if config.get('server_url') else '✗'}, "
                f"username={'✓' if config.get('username') else '✗'}, "
                f"password={'✓' if config.get('password') else '✗'}"
            )
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            if action == "import":
                file_path = kwargs.get("file_path")
                if not file_path:
                    return {"code": 400, "message": "缺少文件路径"}
                
                # 导入小说到 Talebook
                success = self._api_client.import_book_to_talebook(file_path)
                if success:
                    return {
                        "code": 200,
                        "message": "导入成功",
                        "data": {"file": file_path}
                    }
                else:
                    return {"code": 500, "message": "导入失败,请查看日志"}
            
            elif action == "detail":
                if not book_id:
                    return {"code": 400, "message": "缺少书籍 ID"}
                
                # 获取书籍详情
                detail = self._api_client.get_book_detail(book_id)
                return detail
            
            else:
                return {"code": 400, "message": f"未知操作: {action}"}
        except Exception as e:
            logger.error(f"处理操作异常: action={action}, error={str(e)}")
            return {"code": 500, "message": f"操作失败: {str(e)}"}
    
    def api_proxy_image(self, url: str):
        """
        API: 通用图片代理(根据 URL 下载图片)
        
        :param url: 图片 URL
        :return: 图片二进制数据或错误响应
        """
        logger.info(f"📸 收到图片代理请求: url={url}")
        
        if not self._enabled:
            logger.warning("插件未启用")
            return {"code": 400, "message": "插件未启用"}
        
        if not self._ensure_api_client():
            logger.error("API 客户端未初始化")
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        if not url:
            logger.warning("图片 URL 为空")
            return {"code": 400, "message": "缺少图片 URL"}
        
        try:
            # 生成缓存键(URL 的 MD5 哈希)
            import hashlib
            cache_key = hashlib.md5(url.encode('utf-8')).hexdigest()
            
            # 尝试从缓存获取
            cached_data = self._image_cache.get(cache_key)
            if cached_data is not None:
                logger.info(f"   ✅ 使用缓存图片: size={len(cached_data)} bytes")
                from fastapi.responses import Response
                return Response(
                    content=cached_data,
                    media_type="image/jpeg",
                    headers={
                        "Cache-Control": "public, max-age=86400",  # 缓存 24 小时
                        "X-Cache": "HIT",  # 标记缓存命中
                    }
                )
            
            # 缓存未命中,下载图片
            logger.info(f"   🔄 缓存未命中,开始下载图片...")
            image_data = self._api_client.download_image(url)
            
            if image_data is None:
                logger.warning(f"   图片下载失败: url={url}")
                return {"code": 404, "message": "图片不存在或下载失败"}
            
            # 存入缓存(TTL 24小时)
            self._image_cache.set(cache_key, image_data, ttl=86400)
            logger.info(f"   ✅ 图片下载成功并缓存: size={len(image_data)} bytes")
            
            # 返回图片二进制数据
            from fastapi.responses import Response
            return Response(
                content=image_data,
                media_type="image/jpeg",
                headers={
                    "Cache-Control": "public, max-age=86400",  # 缓存 24 小时
                    "X-Cache": "MISS",  # 标记缓存未命中
                }
            )
        except Exception as e:
            logger.error(f"❌ 获取图片异常: url={url}, error={str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    

