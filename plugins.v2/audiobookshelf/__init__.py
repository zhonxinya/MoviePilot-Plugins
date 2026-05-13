"""
Audiobookshelf 有声书和播客管理插件
支持连接 Audiobookshelf 服务器进行库管理、作者管理、播客管理等
"""
from typing import Dict, List, Optional, Any
from app.plugins import _PluginBase
from app.log import logger
from app.schemas.types import EventType
from .audiobookshelf_api_client import AudiobookshelfApiClient


class Audiobookshelf(_PluginBase):
    """
    Audiobookshelf 有声书和播客管理插件
    
    功能:
    - 库管理(创建/更新/删除/查询)
    - 作者管理(查询/更新/匹配/图片管理)
    - 系列管理(查询/更新)
    - 播客管理(创建/下载剧集/元数据匹配)
    - 邮件设置(配置电子阅读器推送)
    - 通知管理(Apprise 通知配置)
    """
    
    # 插件元数据
    plugin_name = "Audiobookshelf"
    plugin_desc = "Audiobookshelf 有声书和播客管理，支持库管理、作者管理、播客下载等功能"
    plugin_icon = "Audiobookshelf.png"
    plugin_version = "1.0.0"
    plugin_author = "MoviePilot Team"
    author_url = "https://github.com/jxxghp/MoviePilot-Plugins"
    plugin_config_prefix = "audiobookshelf_"
    plugin_order = 0
    auth_level = 1
    
    def __init__(self):
        super().__init__()
        self._enabled = False
        self._server_url = ""
        self._api_key = ""
        self._verify_ssl = True
        
        # API 客户端实例
        self._api_client: Optional[AudiobookshelfApiClient] = None
    
    def __del__(self):
        """析构函数：确保资源被清理"""
        try:
            if self._api_client:
                self._api_client.close()
                logger.debug("Audiobookshelf 插件析构：API 客户端已清理")
        except Exception:
            pass
    
    def init_plugin(self, config: dict = None):
        """
        初始化插件
        
        Args:
            config: 配置字典
        """
        logger.info(f"Audiobookshelf 插件 init_plugin 被调用")
        
        # 如果 config 为 None，从数据库读取最新配置
        if config is None:
            config = self.get_config() or {}
            logger.info(f"从数据库读取配置")
        
        # 提取配置项
        self._enabled = bool(config.get("enabled", False))
        self._server_url = config.get("server_url", "").rstrip("/")
        self._api_key = config.get("api_key", "")
        self._verify_ssl = config.get("verify_ssl", True)
        
        logger.info(
            f"Audiobookshelf 配置: enabled={self._enabled}, "
            f"server_url={'✓' if self._server_url else '✗'}, "
            f"api_key={'✓' if self._api_key else '✗'}, "
            f"verify_ssl={self._verify_ssl}"
        )
        
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
        if self._enabled and self._server_url and self._api_key:
            self._api_client = AudiobookshelfApiClient(
                server_url=self._server_url,
                api_key=self._api_key,
                verify_ssl=self._verify_ssl
            )
            logger.info(f"✅ Audiobookshelf API 客户端已创建: server={self._server_url}")
        else:
            self._api_client = None
            if not self._enabled:
                logger.info("Audiobookshelf 插件已禁用")
            else:
                missing = []
                if not self._server_url:
                    missing.append("server_url")
                if not self._api_key:
                    missing.append("api_key")
                logger.warning(f"❌ Audiobookshelf 插件配置不完整,缺失: {', '.join(missing)}")
    
    def get_state(self) -> bool:
        """获取插件状态"""
        return self._enabled
    
    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        """定义插件命令"""
        return [
            {
                "cmd": "/abs-libraries",
                "event": EventType.PluginAction,
                "desc": "获取 Audiobookshelf 库列表",
                "category": "Audiobookshelf",
                "data": {"action": "libraries"}
            },
            {
                "cmd": "/abs-authors",
                "event": EventType.PluginAction,
                "desc": "获取库中的作者列表",
                "category": "Audiobookshelf",
                "data": {"action": "authors"}
            },
            {
                "cmd": "/abs-podcasts",
                "event": EventType.PluginAction,
                "desc": "检查播客新剧集",
                "category": "Audiobookshelf",
                "data": {"action": "podcasts"}
            }
        ]
    
    @staticmethod
    def get_api_endpoints() -> List[Dict[str, Any]]:
        """注册插件 API 端点"""
        return [
            {
                "path": "/api/v1/plugin/Audiobookshelf/libraries",
                "endpoint": "api_get_libraries",
                "methods": ["GET"],
                "summary": "获取所有库列表"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/library/{library_id}",
                "endpoint": "api_get_library_by_id",
                "methods": ["GET"],
                "summary": "获取单个库详情"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/library/{library_id}/items",
                "endpoint": "api_get_library_items",
                "methods": ["GET"],
                "summary": "获取库项目列表"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/authors",
                "endpoint": "api_get_library_authors",
                "methods": ["GET"],
                "summary": "获取库作者列表"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/author/{author_id}",
                "endpoint": "api_get_author_by_id",
                "methods": ["GET"],
                "summary": "获取作者详情"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/series/{series_id}",
                "endpoint": "api_get_series",
                "methods": ["GET"],
                "summary": "获取系列详情"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/podcast/{podcast_id}/checknew",
                "endpoint": "api_check_new_episodes",
                "methods": ["GET"],
                "summary": "检查播客新剧集"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/email/settings",
                "endpoint": "api_get_email_settings",
                "methods": ["GET"],
                "summary": "获取邮件设置"
            },
            {
                "path": "/api/v1/plugin/Audiobookshelf/notifications",
                "endpoint": "api_get_notifications",
                "methods": ["GET"],
                "summary": "获取通知设置"
            }
        ]
    
    def get_form(self) -> Dict[str, Any]:
        """获取配置表单"""
        return {
            "title": "Audiobookshelf 配置",
            "fields": [
                {
                    "component": "switch",
                    "text": "启用插件",
                    "prop": "enabled"
                },
                {
                    "component": "textfield",
                    "label": "服务器地址",
                    "prop": "server_url",
                    "placeholder": "http://localhost:3000"
                },
                {
                    "component": "textfield",
                    "label": "API 密钥",
                    "prop": "api_key",
                    "placeholder": "在 Audiobookshelf 设置中获取"
                },
                {
                    "component": "switch",
                    "text": "验证 SSL 证书",
                    "prop": "verify_ssl"
                }
            ]
        }
    
    def get_page(self) -> List[Dict[str, Any]]:
        """获取插件页面"""
        return [
            {
                "component": "VRow",
                "content": [
                    {
                        "component": "VCol",
                        "props": {"cols": 12},
                        "content": [
                            {
                                "component": "VAlert",
                                "props": {
                                    "type": "info",
                                    "variant": "tonal"
                                },
                                "text": "Audiobookshelf 插件提供有声书和播客管理功能。请先配置服务器地址和 API 密钥。"
                            }
                        ]
                    }
                ]
            }
        ]
    
    def stop_service(self):
        """停止服务"""
        logger.info("Audiobookshelf 插件服务已停止")
        if self._api_client:
            self._api_client.close()
            self._api_client = None
    
    # ==================== API 处理方法 ====================
    
    def api_get_libraries(self) -> Dict[str, Any]:
        """获取所有库列表"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_libraries()
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取库列表异常: {str(e)}")
            return {"code": 500, "message": f"获取库列表失败: {str(e)}"}
    
    def api_get_library_by_id(self, library_id: str) -> Dict[str, Any]:
        """获取单个库详情"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_library_by_id(library_id)
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取库详情异常: {str(e)}")
            return {"code": 500, "message": f"获取库详情失败: {str(e)}"}
    
    def api_get_library_items(self, library_id: str, limit: int = 0, page: int = 0,
                             sort: str = "name", desc: bool = False,
                             filter: Optional[str] = None) -> Dict[str, Any]:
        """获取库项目列表"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_library_items(
                library_id=library_id,
                limit=limit,
                page=page,
                sort=sort,
                desc=desc,
                filter=filter
            )
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取库项目列表异常: {str(e)}")
            return {"code": 500, "message": f"获取库项目列表失败: {str(e)}"}
    
    def api_get_library_authors(self, library_id: str) -> Dict[str, Any]:
        """获取库作者列表"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_library_authors(library_id)
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取作者列表异常: {str(e)}")
            return {"code": 500, "message": f"获取作者列表失败: {str(e)}"}
    
    def api_get_author_by_id(self, author_id: str, include: Optional[str] = None) -> Dict[str, Any]:
        """获取作者详情"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_author_by_id(author_id, include=include)
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取作者详情异常: {str(e)}")
            return {"code": 500, "message": f"获取作者详情失败: {str(e)}"}
    
    def api_get_series(self, series_id: str, include: Optional[str] = None) -> Dict[str, Any]:
        """获取系列详情"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_series(series_id, include=include)
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取系列详情异常: {str(e)}")
            return {"code": 500, "message": f"获取系列详情失败: {str(e)}"}
    
    def api_check_new_episodes(self, podcast_id: str, limit: Optional[int] = None) -> Dict[str, Any]:
        """检查播客新剧集"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.check_new_episodes(podcast_id, limit=limit)
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"检查新剧集异常: {str(e)}")
            return {"code": 500, "message": f"检查新剧集失败: {str(e)}"}
    
    def api_get_email_settings(self) -> Dict[str, Any]:
        """获取邮件设置"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_email_settings()
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取邮件设置异常: {str(e)}")
            return {"code": 500, "message": f"获取邮件设置失败: {str(e)}"}
    
    def api_get_notifications(self) -> Dict[str, Any]:
        """获取通知设置"""
        if not self._enabled:
            return {"code": 400, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            result = self._api_client.get_notifications()
            return {"code": 200, "data": result}
        except Exception as e:
            logger.error(f"获取通知设置异常: {str(e)}")
            return {"code": 500, "message": f"获取通知设置失败: {str(e)}"}
    
    def handle_action(self, action: str, **kwargs) -> Dict[str, Any]:
        """
        处理插件动作
        
        Args:
            action: 动作名称
            **kwargs: 额外参数
            
        Returns:
            处理结果
        """
        if not self._enabled:
            return {"success": False, "message": "插件未启用"}
        
        if not self._api_client:
            return {"success": False, "message": "API 客户端未初始化"}
        
        try:
            if action == "libraries":
                result = self._api_client.get_libraries()
                return {"success": True, "data": result}
            elif action == "authors":
                library_id = kwargs.get("library_id")
                if not library_id:
                    return {"success": False, "message": "缺少 library_id 参数"}
                result = self._api_client.get_library_authors(library_id)
                return {"success": True, "data": result}
            elif action == "podcasts":
                podcast_id = kwargs.get("podcast_id")
                if not podcast_id:
                    return {"success": False, "message": "缺少 podcast_id 参数"}
                limit = kwargs.get("limit")
                result = self._api_client.check_new_episodes(podcast_id, limit=limit)
                return {"success": True, "data": result}
            else:
                return {"success": False, "message": f"未知动作: {action}"}
        except Exception as e:
            logger.error(f"处理动作 {action} 异常: {str(e)}")
            return {"success": False, "message": f"处理失败: {str(e)}"}
