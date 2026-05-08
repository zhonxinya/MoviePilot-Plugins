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
                    "search_timeout": config.get("search_timeout", 10),
                    "max_results": config.get("max_results", 20)
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
            
            # 合并新配置并验证
            new_config = {
                "enabled": bool(config_data.get("enabled", False)),
                "search_timeout": int(config_data.get("search_timeout", current_config.get("search_timeout", 10))),
                "max_results": int(config_data.get("max_results", current_config.get("max_results", 20)))
            }
            
            # 验证范围
            if new_config["search_timeout"] < 5 or new_config["search_timeout"] > 60:
                return {"code": 400, "message": "搜索超时时间必须在 5-60 秒之间"}
            
            if new_config["max_results"] < 1 or new_config["max_results"] > 100:
                return {"code": 400, "message": "最大结果数必须在 1-100 之间"}
            
            # 保存配置到数据库
            self._update_config(new_config)
            
            # 注意: 不再手动调用 init_plugin()
            # MoviePilot 主应用会在配置更新后自动调用 init_plugin()
            # 手动调用会导致双重初始化,可能引发状态不一致
            
            logger.info(f'✅ 配置已保存到数据库: enabled={new_config["enabled"]}, timeout={new_config["search_timeout"]}, max_results={new_config["max_results"]}')
            
            return {
                "code": 200,
                "message": "配置保存成功",
                "data": new_config
            }
        except Exception as e:
            logger.error(f'❌ 保存配置失败: {str(e)}')
            return {"code": 500, "message": str(e)}
