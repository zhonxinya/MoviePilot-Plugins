"""
起点图书信息获取插件
重构版本 - 逻辑与功能分离架构

职责:
1. 插件生命周期管理
2. API 路由注册
3. 命令处理
4. 服务协调
"""

from typing import Any, Dict, List, Optional, Tuple
import threading

from app.plugins import _PluginBase
from app.core.event import eventmanager, Event
from app.schemas.types import EventType
from app.log import logger

# 导入核心服务层
try:
    from .core import QidianClient, SearchService, AuthService
    from .api import SearchAPI, DetailAPI, CategoryAPI, AuthAPI, ConfigAPI
except ImportError as e:
    logger.error(f'❌ 导入模块失败: {str(e)}')
    raise


class QidianBook(_PluginBase):
    """起点图书信息获取插件"""
    
    # ===== 插件元数据 =====
    plugin_name = "起点图书"
    plugin_desc = "获取起点中文网图书信息，支持搜索和详情查询。"
    plugin_icon = "Bookstack_A.png"
    plugin_version = "1.0.1"
    plugin_author = "trient"
    author_url = "https://github.com/jxxghp/MoviePilot"
    plugin_config_prefix = "qidianbook_"
    plugin_order = 50
    auth_level = 1

    # ===== 类级别共享资源 =====
    _class_client_lock = threading.Lock()
    _class_client_cache = {}
    _class_client_ref_count = {}

    # ===== 实例状态 =====
    _enabled = False
    _search_timeout = 10
    _max_results = 20
    
    # 核心服务实例
    _client: QidianClient = None
    _search_service: SearchService = None
    _auth_service: AuthService = None
    
    # API 端点适配器
    _search_api: SearchAPI = None
    _detail_api: DetailAPI = None
    _category_api: CategoryAPI = None
    _auth_api: AuthAPI = None
    _config_api: ConfigAPI = None

    def init_plugin(self, config: dict = None):
        """根据配置初始化插件"""
        config = config or {}
        self._enabled = bool(config.get("enabled", False))
        self._search_timeout = int(config.get("search_timeout", 10))
        self._max_results = int(config.get("max_results", 20))
        
        logger.info(f'🔄 初始化起点图书插件, enabled={self._enabled}, timeout={self._search_timeout}')
        
        # 初始化 HTTP 客户端（使用缓存机制）
        if self._enabled:
            try:
                with QidianBook._class_client_lock:
                    cache_key = f"timeout_{self._search_timeout}"
                    if cache_key in QidianBook._class_client_cache:
                        self._client = QidianBook._class_client_cache[cache_key]
                        QidianBook._class_client_ref_count[cache_key] = \
                            QidianBook._class_client_ref_count.get(cache_key, 0) + 1
                        logger.info(f'✅ 使用缓存的客户端 (引用数: {QidianBook._class_client_ref_count[cache_key]})')
                    else:
                        self._client = QidianClient(timeout=self._search_timeout)
                        QidianBook._class_client_cache[cache_key] = self._client
                        QidianBook._class_client_ref_count[cache_key] = 1
                        logger.info(f'✅ 创建新客户端并缓存')
            except Exception as e:
                logger.error(f'❌ 初始化客户端失败: {str(e)}')
                self._client = None
        else:
            self._client = None
            logger.info('⚠️ 插件已禁用')
        
        # 初始化配置 API（无论插件是否启用都需要）
        self._config_api = ConfigAPI(
            get_config_func=self.get_config,
            update_config_func=self.update_config
        )
        
        # 初始化核心服务
        if self._enabled and self._client:
            self._initialize_services()
        else:
            self._clear_services()
    
    def _initialize_services(self):
        """初始化核心服务和 API 端点"""
        try:
            # 初始化认证服务
            self._auth_service = AuthService(
                client=self._client,
                save_data_func=self.save_data,
                get_data_func=self.get_data
            )
            
            # 初始化搜索服务
            self._search_service = SearchService(
                client=self._client,
                save_data_func=self.save_data,
                get_data_func=self.get_data,
                max_results=self._max_results
            )
            
            # 初始化 API 端点适配器
            self._search_api = SearchAPI(self._search_service)
            self._detail_api = DetailAPI(self._search_service)
            self._category_api = CategoryAPI(self._search_service)
            self._auth_api = AuthAPI(self._auth_service)
            # _config_api 已在 init_plugin 中初始化
            
            logger.info('✅ 核心服务和 API 端点已初始化')
        except Exception as e:
            logger.error(f'❌ 初始化服务失败: {str(e)}')
            import traceback
            logger.debug(f'堆栈跟踪:\n{traceback.format_exc()}')
    
    def _clear_services(self):
        """清理服务实例"""
        if self._client:
            self._client.close()
        
        self._client = None
        self._search_service = None
        self._auth_service = None
        self._search_api = None
        self._detail_api = None
        self._category_api = None
        self._auth_api = None
        # 注意: 不清理 _config_api，因为配置API需要始终可用

    def get_state(self) -> bool:
        """返回插件运行状态"""
        return self._enabled

    def stop_service(self):
        """停用插件时清理资源。"""
        # 使用引用计数机制安全地清理客户端
        if self._client:
            with QidianBook._class_client_lock:
                # 查找当前客户端的缓存键
                cache_key = None
                for key, client in QidianBook._class_client_cache.items():
                    if client is self._client:
                        cache_key = key
                        break
                
                if cache_key and cache_key in QidianBook._class_client_ref_count:
                    QidianBook._class_client_ref_count[cache_key] -= 1
                    logger.info(f'📉 客户端引用数减 1 (当前: {QidianBook._class_client_ref_count[cache_key]})')
                    
                    if QidianBook._class_client_ref_count[cache_key] <= 0:
                        try:
                            self._client.close()
                            logger.info('✅ 客户端已关闭 (无其他实例使用)')
                        except Exception as e:
                            logger.error(f'❌ 关闭客户端失败: {e}')
                        
                        if cache_key in QidianBook._class_client_cache:
                            del QidianBook._class_client_cache[cache_key]
                        del QidianBook._class_client_ref_count[cache_key]
                        logger.info('🗑️ 客户端已从缓存中移除')
                    else:
                        logger.info(f'⚠️ 仍有 {QidianBook._class_client_ref_count[cache_key]} 个实例在使用客户端')
        
        self._client = None
        self._clear_services()
        logger.info('🛑 插件服务已停止')

    # ==================== API 路由注册 ====================
    
    def get_api(self) -> List[Dict[str, Any]]:
        """声明插件API"""
        return [
            {
                "path": "/search",
                "endpoint": self.api_search_books,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "搜索起点图书",
                "description": "根据关键词搜索起点中文网图书",
            },
            {
                "path": "/detail/{book_id}",
                "endpoint": self.api_get_book_detail,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取图书详情",
                "description": "获取指定ID的图书详细信息",
            },
            {
                "path": "/category",
                "endpoint": self.api_get_categories,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取图书分类",
                "description": "获取起点图书分类列表",
            },
            # 认证相关API
            {
                "path": "/auth/login",
                "endpoint": self.api_login,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "使用Cookie登录",
                "description": "使用起点Cookie进行登录认证",
            },
            {
                "path": "/auth/logout",
                "endpoint": self.api_logout,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "登出",
                "description": "清除登录状态",
            },
            {
                "path": "/auth/status",
                "endpoint": self.api_get_auth_status,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取认证状态",
                "description": "查询当前登录状态",
            },
            # 配置相关API
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
        ]

    # ==================== API 端点实现(委托给服务层) ====================
    
    def api_search_books(self, keyword: str = "", page: int = 1) -> Dict[str, Any]:
        """API: 搜索起点图书"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._search_api:
            return {"code": 500, "message": "搜索服务未初始化"}
        
        return self._search_api.search(keyword, page)
    
    def api_get_book_detail(self, book_id: str) -> Dict[str, Any]:
        """API: 获取图书详情"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._detail_api:
            return {"code": 500, "message": "详情服务未初始化"}
        
        return self._detail_api.get_detail(book_id)
    
    def api_get_categories(self) -> Dict[str, Any]:
        """API: 获取图书分类"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._category_api:
            return {"code": 500, "message": "分类服务未初始化"}
        
        return self._category_api.get_categories()
    
    # ==================== 认证 API 端点实现 ====================
    
    def api_login(self, cookie: str = "") -> Dict[str, Any]:
        """API: 使用Cookie登录"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._auth_api:
            return {"code": 500, "message": "认证服务未初始化"}
        
        return self._auth_api.login(cookie)
    
    def api_logout(self) -> Dict[str, Any]:
        """API: 登出"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._auth_api:
            return {"code": 500, "message": "认证服务未初始化"}
        
        return self._auth_api.logout()
    
    def api_get_auth_status(self) -> Dict[str, Any]:
        """API: 获取认证状态"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._auth_api:
            return {"code": 500, "message": "认证服务未初始化"}
        
        return self._auth_api.get_status()

    # ==================== 配置 API 端点实现 ====================
    
    def api_get_config(self) -> Dict[str, Any]:
        """API: 获取插件配置"""
        if not self._config_api:
            return {"code": 500, "message": "配置服务未初始化"}
        
        return self._config_api.get_config()
    
    def api_save_config(self, config_data: dict = None) -> Dict[str, Any]:
        """API: 保存插件配置"""
        if not self._config_api:
            return {"code": 500, "message": "配置服务未初始化"}
        
        return self._config_api.save_config(config_data)

    # ==================== 命令处理 ====================
    
    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        """
        返回配置页JSON和默认配置模型
        Vue联邦模式下返回None + 默认配置模型
        """
        return None, {
            'enabled': False,
            'search_timeout': 10,
            'max_results': 20,
        }

    def get_render_mode(self) -> Tuple[str, str]:
        """获取插件渲染模式"""
        return "vue", "dist/assets"

    def get_page(self) -> List[dict]:
        """返回详情页配置"""
        return [
            {
                'component': 'PluginVueApp',
                'props': {
                    'plugin_id': self.__class__.__name__,
                    'page_name': 'Page'
                }
            }
        ]

    def get_sidebar_nav(self) -> List[Dict[str, Any]]:
        """声明侧栏导航入口"""
        return [
            {
                "nav_key": "search",
                "title": "起点图书搜索",
                "icon": "mdi-book-search",
                "section": "discovery",
                "permission": "search",
                "order": 15,
            },
        ]

    # ==================== 命令处理 ====================
    
    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        """注册远程命令"""
        return [
            {
                "cmd": "/qidian_search",
                "event": EventType.PluginAction,
                "desc": "搜索起点图书",
                "category": "起点图书",
                "data": {
                    "action": "qidian_search",
                },
            }
        ]

    @eventmanager.register(EventType.PluginAction)
    def handle_command(self, event: Event):
        """处理远程命令"""
        event_data = event.event_data or {}
        if event_data.get("action") != "qidian_search":
            return
        
        if not self._enabled:
            self.post_message({
                "title": "起点图书",
                "text": "插件未启用，请先在配置中启用"
            })
            return
        
        keyword = event_data.get("keyword", "")
        if not keyword:
            self.post_message({
                "title": "起点图书",
                "text": "请提供搜索关键词，例如：/qidian_search 三体"
            })
            return
        
        if not self._search_service:
            self.post_message({
                "title": "起点图书",
                "text": "搜索服务未就绪，请检查配置和网络连接"
            })
            return
        
        try:
            # 执行搜索
            result = self._search_service.search(keyword)
            
            if result.get("code") != 200:
                self.post_message({
                    "title": "起点图书",
                    "text": f"搜索失败: {result.get('message', '未知错误')}"
                })
                return
            
            results = result.get("data", {}).get("books", [])
            
            if not results:
                self.post_message({
                    "title": "起点图书",
                    "text": f"未找到与'{keyword}'相关的书籍"
                })
                return
            
            # 构造消息内容
            book_list = "\n".join([
                f"📚 {r['title']} - {r['author']}\n   分类: {r['category']} | 评分: {r['rating']}"
                for r in results[:5]
            ])
            
            self.post_message({
                "title": "起点图书搜索结果",
                "text": f"找到 {len(results)} 本相关书籍：\n\n{book_list}\n\n更多结果请通过API查看"
            })
            
            logger.info(f'✅ 命令搜索完成: {keyword}, 结果数: {len(results)}')
            
        except Exception as e:
            self.post_message({
                "title": "起点图书",
                "text": f"搜索失败: {str(e)}"
            })
            logger.error(f'❌ 命令搜索失败: {str(e)}')
