"""
配置相关 API 端点
"""

from typing import Dict, Any, Callable
from app.log import logger


class ConfigAPI:
    """配置 API 端点适配器"""
    
    def __init__(
        self,
        get_config_func: Callable,
        update_config_func: Callable
    ):
        """
        初始化配置 API
        
        Args:
            get_config_func: 获取配置函数
            update_config_func: 更新配置函数
        """
        self._get_config = get_config_func
        self._update_config = update_config_func
    
    def get_config(self) -> Dict[str, Any]:
        """
        API: 获取插件配置
        
        Returns:
            当前插件配置信息
        """
        try:
            # 从数据库获取当前配置
            config = self._get_config() or {}
            
            return {
                "code": 200,
                "message": "success",
                "data": {
                    "enabled": config.get("enabled", False),
                    "api_url": config.get("api_url", "https://your-api-server.com"),
                    "default_format": config.get("default_format", "epub")
                }
            }
        except Exception as e:
            logger.error(f'❌ 获取配置失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def save_config(self, config_data: dict = None) -> Dict[str, Any]:
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
            current_config = self._get_config() or {}
            
            # 合并新配置
            new_config = {
                "enabled": bool(config_data.get("enabled", False)),
                "api_url": config_data.get("api_url", current_config.get("api_url", "https://your-api-server.com")),
                "default_format": config_data.get("default_format", current_config.get("default_format", "epub"))
            }
            
            # 保存配置到数据库
            self._update_config(new_config)
            
            # 注意: 不再手动调用 init_plugin()
            # MoviePilot 主应用会在配置更新后自动调用 init_plugin()
            # 手动调用会导致双重初始化,可能引发状态不一致
            
            logger.info(f'✅ 配置已保存到数据库: enabled={new_config["enabled"]}, api_url={new_config["api_url"]}')
            
            return {
                "code": 200,
                "message": "配置保存成功",
                "data": new_config
            }
        except Exception as e:
            logger.error(f'❌ 保存配置失败: {str(e)}')
            return {"code": 500, "message": str(e)}
