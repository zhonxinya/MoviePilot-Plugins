"""
迅雷网盘插件
支持文件浏览和离线下载功能
"""
from typing import Dict, List, Optional, Tuple, Any
from app.plugins import _PluginBase
from app.log import logger
from app.core.security import verify_password, get_password_hash
from .xunlei_api_client import XunleiApiClient


class XunleiPan(_PluginBase):
    """
    迅雷网盘插件
    
    功能:
    - 浏览迅雷网盘文件
    - 添加离线下载任务
    - 查看下载任务状态
    """
    
    # 插件元数据
    plugin_name = "迅雷网盘"
    plugin_desc = "迅雷网盘文件浏览和离线下载管理"
    plugin_icon = "Thunder_A.png"
    plugin_version = "1.0.0"
    plugin_author = "trient"
    author_url = "https://github.com/jxxghp/MoviePilot-Plugins"
    plugin_config_prefix = "xunleipan_"
    plugin_order = 0
    auth_level = 1
    
    def __init__(self):
        super().__init__()
        self._enabled = False
        self._username = ""
        self._password = ""
        
        # API 客户端实例
        self._api_client: Optional[XunleiApiClient] = None
    
    def __del__(self):
        """析构函数：确保资源被清理"""
        try:
            if self._api_client:
                self._api_client.close()
                logger.debug("迅雷网盘插件析构：API 客户端已清理")
        except Exception:
            pass
    
    def init_plugin(self, config: dict = None):
        """初始化插件"""
        config = config or {}
        
        # 如果 config 为 None，从数据库读取最新配置
        if not config:
            config = self.get_config() or {}
        
        self._enabled = bool(config.get("enabled", False))
        self._username = config.get("username", "")
        
        # 解密密码（如果是哈希值则直接使用，否则可能是明文）
        password = config.get("password", "")
        self._password = password
        
        if self._enabled:
            logger.info(f"✅ 正在启用迅雷网盘插件...")
        else:
            logger.info(f"⏸️ 迅雷网盘插件已禁用")
        
        # 关闭旧的 API 客户端
        if self._api_client:
            try:
                self._api_client.close()
                logger.debug("已关闭旧的 API 客户端")
            except Exception as e:
                logger.warning(f"关闭旧 API 客户端异常: {str(e)}")
            finally:
                self._api_client = None
        
        # 创建新的 API 客户端
        if self._enabled and self._username and self._password:
            self._api_client = XunleiApiClient(
                username=self._username,
                password=self._password
            )
            logger.info(f"✅ 迅雷网盘插件已启用，API 客户端已创建")
        else:
            missing = []
            if not self._enabled:
                missing.append("enabled")
            if not self._username:
                missing.append("username")
            if not self._password:
                missing.append("password")
            
            if missing:
                logger.warning(f"⚠️ 迅雷网盘插件配置不完整，缺失: {', '.join(missing)}")
    
    def get_state(self) -> bool:
        """返回插件运行状态"""
        return self._enabled
    
    def stop_service(self):
        """停用插件时清理资源"""
        logger.info("🛑 正在停止迅雷网盘插件服务...")
        
        if self._api_client:
            try:
                self._api_client.close()
                logger.info("✅ 迅雷网盘 API 客户端已关闭")
            except Exception as e:
                logger.error(f"❌ 关闭 API 客户端失败: {e}")
        
        self._api_client = None
        logger.info("✅ 迅雷网盘插件服务已停止")
    
    def get_api(self) -> List[Dict[str, Any]]:
        """声明插件 API"""
        return [
            # 文件浏览相关
            {
                "path": "/files",
                "endpoint": self.api_get_file_list,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取文件列表",
                "description": "浏览迅雷网盘指定目录的文件"
            },
            {
                "path": "/download/{file_id}",
                "endpoint": self.api_download_file,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "下载文件",
                "description": "从迅雷网盘下载文件"
            },
            {
                "path": "/delete/{file_id}",
                "endpoint": self.api_delete_file,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "删除文件",
                "description": "删除迅雷网盘中的文件"
            },
            # 离线下载相关
            {
                "path": "/offline_download",
                "endpoint": self.api_add_offline_download,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "添加离线下载",
                "description": "添加磁力链接或种子到离线下载"
            },
            {
                "path": "/tasks",
                "endpoint": self.api_get_download_tasks,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取下载任务列表",
                "description": "查看离线下载任务状态"
            },
            {
                "path": "/task/{task_id}/pause",
                "endpoint": self.api_pause_task,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "暂停任务",
                "description": "暂停指定的下载任务"
            },
            {
                "path": "/task/{task_id}/resume",
                "endpoint": self.api_resume_task,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "恢复任务",
                "description": "恢复已暂停的下载任务"
            },
            {
                "path": "/task/{task_id}/cancel",
                "endpoint": self.api_cancel_task,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "取消任务",
                "description": "取消指定的下载任务"
            },
            # 配置管理
            {
                "path": "/config",
                "endpoint": self.api_get_config,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取配置",
                "description": "获取插件配置信息"
            },
            {
                "path": "/config",
                "endpoint": self.api_save_config,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "保存配置",
                "description": "保存插件配置信息"
            },
            {
                "path": "/test_connection",
                "endpoint": self.api_test_connection,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "测试连接",
                "description": "测试迅雷账号连接是否正常"
            }
        ]
    
    def api_get_file_list(self, parent_id: str = "root", page: int = 1, limit: int = 50) -> Dict[str, Any]:
        """API: 获取文件列表"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"📂 获取文件列表: parent_id={parent_id}, page={page}")
            result = self._api_client.get_file_list(parent_id, page, limit)
            # 适配前端格式
            return {
                "code": 200,
                "data": {
                    "files": result.get("data", {}).get("items", [])
                }
            }
        except Exception as e:
            logger.error(f"❌ 获取文件列表异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_download_file(self, file_id: str) -> Dict[str, Any]:
        """API: 下载文件"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"⬇️ 下载文件: file_id={file_id}")
            result = self._api_client.download_file(file_id)
            return result
        except Exception as e:
            logger.error(f"❌ 下载文件异常: {str(e)}")
            return {"code": 500, "message": f"下载失败: {str(e)}"}
    
    def api_delete_file(self, file_id: str) -> Dict[str, Any]:
        """API: 删除文件"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"🗑️ 删除文件: file_id={file_id}")
            result = self._api_client.delete_file(file_id)
            return result
        except Exception as e:
            logger.error(f"❌ 删除文件异常: {str(e)}")
            return {"code": 500, "message": f"删除失败: {str(e)}"}
    
    def api_add_offline_download(self, url: str = "", save_path: str = "/") -> Dict[str, Any]:
        """API: 添加离线下载"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        if not url:
            return {"code": 400, "message": "请提供下载链接"}
        
        try:
            logger.info(f"📥 添加离线下载: url={url[:50]}...")
            result = self._api_client.add_offline_download(url, save_path)
            return result
        except Exception as e:
            logger.error(f"❌ 添加离线下载异常: {str(e)}")
            return {"code": 500, "message": f"添加失败: {str(e)}"}
    
    def api_get_download_tasks(self, status: str = "all", page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """API: 获取下载任务列表"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"📋 获取下载任务: status={status}, page={page}")
            result = self._api_client.get_download_tasks(status, page, limit)
            # 适配前端格式
            return {
                "code": 200,
                "data": {
                    "tasks": result.get("data", {}).get("tasks", [])
                }
            }
        except Exception as e:
            logger.error(f"❌ 获取任务列表异常: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def api_pause_task(self, task_id: str) -> Dict[str, Any]:
        """API: 暂停任务"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"⏸️ 暂停任务: task_id={task_id}")
            result = self._api_client.pause_task(task_id)
            return result
        except Exception as e:
            logger.error(f"❌ 暂停任务异常: {str(e)}")
            return {"code": 500, "message": f"暂停失败: {str(e)}"}
    
    def api_resume_task(self, task_id: str) -> Dict[str, Any]:
        """API: 恢复任务"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"▶️ 恢复任务: task_id={task_id}")
            result = self._api_client.resume_task(task_id)
            return result
        except Exception as e:
            logger.error(f"❌ 恢复任务异常: {str(e)}")
            return {"code": 500, "message": f"恢复失败: {str(e)}"}
    
    def api_cancel_task(self, task_id: str) -> Dict[str, Any]:
        """API: 取消任务"""
        if not self._enabled:
            return {"code": 403, "message": "插件未启用"}
        
        if not self._api_client:
            return {"code": 500, "message": "API 客户端未初始化,请检查配置"}
        
        try:
            logger.info(f"❌ 取消任务: task_id={task_id}")
            result = self._api_client.cancel_task(task_id)
            return result
        except Exception as e:
            logger.error(f"❌ 取消任务异常: {str(e)}")
            return {"code": 500, "message": f"取消失败: {str(e)}"}
    
    def api_get_config(self) -> Dict[str, Any]:
        """API: 获取配置"""
        config = self.get_config() or {}
        return {
            "code": 200,
            "data": {
                "username": config.get("username", ""),
                "timeout": config.get("timeout", 10),
                "max_retries": config.get("max_retries", 3),
                "auto_refresh": config.get("auto_refresh", False)
            }
        }
    
    def api_save_config(self, config_data: dict = None) -> Dict[str, Any]:
        """API: 保存配置"""
        if not config_data:
            return {"code": 400, "message": "缺少配置数据"}
        
        try:
            config = self.get_config() or {}
            
            # 如果密码被修改，则进行哈希加密
            if "password" in config_data and config_data["password"]:
                # 检查密码是否已经是哈希值（bcrypt 哈希以 $2b$ 开头）
                if not config_data["password"].startswith("$2b$"):
                    config_data["password"] = get_password_hash(config_data["password"])
                    logger.info("🔒 密码已加密存储")
            
            config.update(config_data)
            self.update_config(config)
            
            # 重新初始化插件以应用新配置
            self.init_plugin(config)
            
            logger.info("✅ 配置已保存")
            return {"code": 200, "message": "配置保存成功"}
        except Exception as e:
            logger.error(f"❌ 保存配置异常: {str(e)}")
            return {"code": 500, "message": f"保存失败: {str(e)}"}
    
    def api_test_connection(self, username: str = "", password: str = "") -> Dict[str, Any]:
        """API: 测试连接"""
        if not username or not password:
            return {"code": 400, "message": "请提供账号和密码"}
        
        try:
            logger.info(f"🔍 测试连接: username={username}")
            test_client = XunleiApiClient(username=username, password=password)
            login_result = test_client.login()
            test_client.close()
            
            if login_result.get("code") == 200:
                return {"code": 200, "message": "连接测试成功"}
            else:
                return {"code": 401, "message": login_result.get("message", "登录失败")}
        except Exception as e:
            logger.error(f"❌ 连接测试异常: {str(e)}")
            return {"code": 500, "message": f"测试失败: {str(e)}"}
    
    def get_render_mode(self) -> Tuple[str, str]:
        """使用 Vue 联邦渲染模式"""
        return "vue", "dist/assets"
    
    def get_sidebar_nav(self) -> List[Dict[str, Any]]:
        """声明侧栏导航入口"""
        return [
            {
                "nav_key": "files",
                "title": "文件浏览",
                "icon": "mdi-folder-open",
                "section": "discovery",
                "permission": "manage",
                "order": 10,
            },
            {
                "nav_key": "download",
                "title": "离线下载",
                "icon": "mdi-download",
                "section": "discovery",
                "permission": "manage",
                "order": 11,
            },
        ]
    
    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        """
        返回配置页 JSON 和默认配置模型。
        Vue 联邦模式下返回 None + 默认配置模型
        """
        return None, {
            'enabled': False,
            'username': '',
            'password': ''
        }
    
    def get_page(self) -> List[dict]:
        """返回详情页配置(Vue 模式)"""
        return [
            {
                'component': 'PluginVueApp',
                'props': {
                    'plugin_id': self.__class__.__name__,
                    'page_name': 'Page'
                }
            }
        ]
