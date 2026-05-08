"""
Sonovel 插件主入口
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
from app.schemas.types import EventType, NotificationType
from app.log import logger

from .client import SoNovelClient
from .models import BookFetchRequest
from .agent_tools import get_sonovel_tools

# 导入核心服务层
from .core import CacheManager, SearchService, DownloadService
from .api import SearchAPI, DownloadAPI, ConfigAPI


class Sonovel(_PluginBase):
    """SoNovel 图书搜索与下载插件"""
    
    # ===== 插件元数据 =====
    plugin_name = "Sonovel"
    plugin_desc = "SoNovel 图书搜索与下载插件，支持多书源聚合搜索和电子书下载。"
    plugin_icon = "Bookstack_A.png"
    plugin_version = "1.0.2"
    plugin_author = "trient"
    author_url = "https://github.com/trient"
    plugin_config_prefix = "sonovel_"
    plugin_order = 50
    auth_level = 1

    # ===== 类级别共享资源 =====
    _class_client_lock = threading.Lock()
    _class_client_cache = {}
    _class_client_ref_count = {}

    # ===== 实例状态 =====
    _enabled = False
    _api_url = "https://your-api-server.com"
    _default_format = "epub"
    _client: SoNovelClient = None
    
    # 核心服务实例
    _cache_manager: CacheManager = None
    _search_service: SearchService = None
    _download_service: DownloadService = None
    
    # API 端点适配器
    _search_api: SearchAPI = None
    _download_api: DownloadAPI = None
    _config_api: ConfigAPI = None

    # ==================== 生命周期管理 ====================
    
    def init_plugin(self, config: dict = None):
        """根据当前配置初始化插件。"""
        config = config or {}
        self._enabled = bool(config.get("enabled", False))
        self._api_url = config.get("api_url") or "https://your-api-server.com"
        self._default_format = config.get("default_format") or "epub"
        
        logger.info(f'🔄 初始化插件, enabled={self._enabled}, api_url={self._api_url}')
        
        # 初始化 API 客户端
        if self._enabled:
            try:
                with Sonovel._class_client_lock:
                    cache_key = self._api_url
                    if cache_key in Sonovel._class_client_cache:
                        self._client = Sonovel._class_client_cache[cache_key]
                        Sonovel._class_client_ref_count[cache_key] = \
                            Sonovel._class_client_ref_count.get(cache_key, 0) + 1
                        logger.info(f'✅ 使用缓存的客户端 (引用数: {Sonovel._class_client_ref_count[cache_key]})')
                    else:
                        self._client = SoNovelClient(base_url=self._api_url)
                        Sonovel._class_client_cache[cache_key] = self._client
                        Sonovel._class_client_ref_count[cache_key] = 1
                        logger.info(f'✅ 创建新客户端并缓存')
            except Exception as e:
                logger.error(f'❌ 初始化客户端失败: {str(e)}')
                self._client = None
        else:
            self._client = None
            logger.info('⚠️ 插件已禁用')
        
        # 初始化核心服务
        if self._enabled and self._client:
            self._initialize_services()
        else:
            self._clear_services()
    
    def __del__(self):
        """
        析构函数：确保资源被清理
        
        作为 stop_service() 的兜底，防止插件异常退出时资源泄漏
        """
        try:
            if self._client:
                self._client.close()
                logger.debug("Sonovel 插件析构：API 客户端已清理")
        except Exception:
            pass  # 析构函数中不应抛出异常

    def get_state(self) -> bool:
        """返回插件当前是否启用。"""
        return self._enabled
    
    def _initialize_services(self):
        """初始化核心服务和 API 端点"""
        try:
            # 初始化缓存管理器
            self._cache_manager = CacheManager(ttl=3600, max_cache_age=86400)
            
            # 初始化搜索服务
            self._search_service = SearchService(
                client=self._client,
                cache_manager=self._cache_manager,
                save_data_func=self.save_data,
                get_data_func=self.get_data,
                post_message_func=self.post_message
            )
            
            # 初始化下载服务
            self._download_service = DownloadService(
                client=self._client,
                save_data_func=self.save_data,
                get_data_func=self.get_data,
                post_message_func=self.post_message,
                default_format=self._default_format,
                download_timeout=300,
                max_workers=5
            )
            self._download_service.initialize()
            
            # 初始化 API 端点适配器
            self._search_api = SearchAPI(self._search_service)
            self._download_api = DownloadAPI(self._download_service)
            self._config_api = ConfigAPI(
                get_config_func=self.get_config,
                update_config_func=self.update_config
            )
            
            logger.info('✅ 核心服务和 API 端点已初始化')
        except Exception as e:
            logger.error(f'❌ 初始化服务失败: {str(e)}')
            import traceback
            logger.debug(f'堆栈跟踪:\n{traceback.format_exc()}')
    
    def _clear_services(self):
        """清理服务实例"""
        self._search_service = None
        self._download_service = None
        self._search_api = None
        self._download_api = None
        self._config_api = None

    def stop_service(self):
        """停用插件时清理资源。"""
        # 关闭服务
        if self._search_service:
            self._search_service.shutdown()
        
        if self._download_service:
            self._download_service.shutdown()
        
        # 使用引用计数机制安全地清理客户端
        if self._client and self._api_url:
            with Sonovel._class_client_lock:
                cache_key = self._api_url
                if cache_key in Sonovel._class_client_ref_count:
                    Sonovel._class_client_ref_count[cache_key] -= 1
                    logger.info(f'📉 客户端引用数减 1 (当前: {Sonovel._class_client_ref_count[cache_key]})')
                    
                    if Sonovel._class_client_ref_count[cache_key] <= 0:
                        try:
                            self._client.close()
                            logger.info('✅ 客户端已关闭 (无其他实例使用)')
                        except Exception as e:
                            logger.error(f'❌ 关闭客户端失败: {e}')
                        
                        if cache_key in Sonovel._class_client_cache:
                            del Sonovel._class_client_cache[cache_key]
                        del Sonovel._class_client_ref_count[cache_key]
                        logger.info('🗑️ 客户端已从缓存中移除')
                    else:
                        logger.info(f'⚠️ 仍有 {Sonovel._class_client_ref_count[cache_key]} 个实例在使用客户端')
        
        self._client = None
        self._clear_services()
        logger.info('🛑 插件服务已停止')

    # ==================== 辅助方法 ====================
    
    def _check_plugin_ready(self) -> Optional[Dict[str, Any]]:
        """
        检查插件是否就绪（通用配置检查）
        
        统一的配置检查逻辑，避免在每个 API 方法中重复编写
        
        Returns:
            None: 插件就绪，可以继续执行
            Dict: 错误响应，包含 code 和 message
        """
        if not self._enabled:
            logger.warning("Sonovel 插件未启用")
            return {"code": 403, "message": "插件未启用"}
        
        if not self._client:
            config = self.get_config() or {}
            enabled = bool(config.get("enabled", False))
            api_url = config.get("api_url", "")
            
            missing_fields = []
            if not enabled:
                missing_fields.append("enabled")
            if not api_url:
                missing_fields.append("api_url")
            
            error_msg = f"API 客户端未初始化，请检查配置"
            if missing_fields:
                error_msg += f" (缺失字段: {', '.join(missing_fields)})"
            
            logger.error(f"❌ {error_msg}")
            return {"code": 500, "message": error_msg}
        
        return None

    # ==================== API 路由注册 ====================
    
    def get_api(self) -> List[Dict[str, Any]]:
        """声明插件 API。"""
        return [
            {
                "path": "/search",
                "endpoint": self.api_search,
                "methods": ["GET", "POST"],
                "auth": "bear",
                "summary": "搜索图书",
                "description": "通过关键词搜索图书",
            },
            {
                "path": "/download",
                "endpoint": self.api_download,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "下载图书",
                "description": "根据书籍信息下载电子书文件",
            },
            {
                "path": "/history",
                "endpoint": self.api_get_history,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取搜索历史",
                "description": "获取最近的搜索历史记录",
            },
            {
                "path": "/cache_status",
                "endpoint": self.api_get_cache_status,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取缓存状态",
                "description": "查看当前搜索缓存的状态和统计信息",
            },
            {
                "path": "/cache/clear",
                "endpoint": self.api_clear_cache,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "清空缓存",
                "description": "清空所有搜索缓存数据",
            },
            {
                "path": "/last_results",
                "endpoint": self.api_get_last_results,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取最近搜索结果",
                "description": "获取最近一次搜索的结果，用于在页面中展示",
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
        ]

    # ==================== API 端点实现(委托给服务层) ====================
    
    def api_search(self, keyword: str = None) -> Dict[str, Any]:
        """API: 搜索图书"""
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        if not self._search_api:
            return {"code": 500, "message": "搜索服务未初始化"}
        
        return self._search_api.search(keyword)
    
    def api_download(self, book_data: dict = None) -> Dict[str, Any]:
        """API: 提交下载任务"""
        # 统一配置检查
        error_response = self._check_plugin_ready()
        if error_response:
            return error_response
        
        if not self._download_api:
            return {"code": 500, "message": "下载服务未初始化"}
        
        return self._download_api.download(book_data)
    
    def api_get_history(self) -> Dict[str, Any]:
        """API: 获取搜索历史"""
        if not self._search_api:
            return {"code": 500, "message": "搜索服务未初始化"}
        
        return self._search_api.get_history()
    
    def api_get_last_results(self) -> Dict[str, Any]:
        """API: 获取最近搜索结果"""
        if not self._search_api:
            return {"code": 500, "message": "搜索服务未初始化"}
        
        return self._search_api.get_last_results()
    
    def api_get_cache_status(self) -> Dict[str, Any]:
        """API: 获取缓存状态"""
        if not self._search_api:
            return {"code": 500, "message": "搜索服务未初始化"}
        
        return self._search_api.get_cache_status()
    
    def api_clear_cache(self) -> Dict[str, Any]:
        """API: 清空缓存"""
        if not self._search_api:
            return {"code": 500, "message": "搜索服务未初始化"}
        
        return self._search_api.clear_cache()
    
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

    # ==================== 配置与渲染 ====================
    
    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        """
        返回配置页 JSON 和默认配置模型。
        Vue 联邦模式下返回 None + 默认配置模型
        """
        return None, {
            'enabled': False,
            'api_url': 'https://your-api-server.com',
            'default_format': 'epub'
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
                "title": "图书搜索",
                "icon": "mdi-book-search",
                "section": "discovery",
                "permission": "search",
                "order": 10,
            },
            {
                "nav_key": "history",
                "title": "下载历史",
                "icon": "mdi-download-box",
                "section": "system",
                "permission": "manage",
                "order": 11,
            },
        ]

    # ==================== 命令处理 ====================
    
    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        """注册远程命令。"""
        return [
            {
                "cmd": "/sonovel_search",
                "event": EventType.PluginAction,
                "desc": "搜索图书",
                "category": "Sonovel",
                "data": {
                    "action": "sonovel_search",
                },
            }
        ]

    @eventmanager.register(EventType.PluginAction)
    def handle_command(self, event: Event):
        """处理远程命令。"""
        event_data = event.event_data or {}
        if event_data.get("action") != "sonovel_search":
            return
        
        if not self._enabled:
            self.post_message({
                "title": "Sonovel",
                "text": "插件未启用，请先在配置中启用"
            })
            return
        
        keyword = event_data.get("keyword", "")
        if not keyword:
            self.post_message({
                "title": "Sonovel",
                "text": "请提供搜索关键词，例如：/sonovel_search 三体"
            })
            return
        
        if not self._search_service:
            self.post_message({
                "title": "Sonovel",
                "text": "搜索服务未就绪，请检查配置和网络连接"
            })
            return
        
        try:
            # 执行搜索
            result = self._search_service.search(keyword)
            
            if result.get("code") != 200:
                self.post_message({
                    "title": "Sonovel",
                    "text": f"搜索失败: {result.get('message', '未知错误')}"
                })
                return
            
            results = result.get("data", [])
            
            if not results:
                self.post_message({
                    "title": "Sonovel",
                    "text": f"未找到与'{keyword}'相关的书籍"
                })
                return
            
            # 构造消息内容
            book_list = "\n".join([
                f"📚 {r['bookName']} - {r['author']}\n   书源: {r['sourceName']}"
                for r in results[:5]
            ])
            
            self.post_message({
                "title": "Sonovel 搜索结果",
                "text": f"找到 {len(results)} 本相关书籍：\n\n{book_list}\n\n更多结果请通过 API 查看"
            })
            
            logger.info(f'✅ 命令搜索完成: {keyword}, 结果数: {len(results)}')
            
        except Exception as e:
            self.post_message({
                "title": "Sonovel",
                "text": f"搜索失败: {str(e)}"
            })
            logger.error(f'❌ 命令搜索失败: {str(e)}')

    # ==================== 智能体工具 ====================
    
    def get_agent_tools(self) -> List[type]:
        """注册智能体工具"""
        return get_sonovel_tools()
