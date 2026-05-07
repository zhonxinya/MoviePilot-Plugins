"""
搜索相关 API 端点
"""

from typing import Dict, Any
from app.log import logger

# 支持直接运行和作为模块导入
try:
    from ..core.search_service import SearchService
except ImportError:
    from app.plugins.sonovel.core.search_service import SearchService


class SearchAPI:
    """搜索 API 端点适配器"""
    
    def __init__(self, search_service: SearchService):
        """
        初始化搜索 API
        
        Args:
            search_service: 搜索服务实例
        """
        self._service = search_service
    
    def search(self, keyword: str = None) -> Dict[str, Any]:
        """
        API: 搜索图书
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            搜索结果字典
        """
        if not keyword:
            return {"code": 400, "message": "缺少关键词参数"}
        
        logger.info(f'🔍 API 搜索请求: {keyword}')
        return self._service.search(keyword)
    
    def get_history(self) -> Dict[str, Any]:
        """
        API: 获取搜索历史
        
        Returns:
            搜索历史列表
        """
        return self._service.get_history()
    
    def get_last_results(self) -> Dict[str, Any]:
        """
        API: 获取最近一次搜索的结果
        
        Returns:
            最近搜索结果和关键词
        """
        return self._service.get_last_results()
    
    def get_cache_status(self) -> Dict[str, Any]:
        """
        API: 获取缓存状态
        
        Returns:
            缓存状态信息
        """
        return self._service.get_cache_status()
    
    def clear_cache(self) -> Dict[str, Any]:
        """
        API: 清空搜索缓存
        
        Returns:
            操作结果
        """
        return self._service.clear_cache()
