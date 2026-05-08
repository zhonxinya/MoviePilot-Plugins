"""
搜索API端点适配器

职责：将SearchService的方法适配为FastAPI端点格式
"""

from typing import Dict, Any


class SearchAPI:
    """搜索API端点"""
    
    def __init__(self, search_service):
        """
        初始化搜索API
        
        Args:
            search_service: SearchService实例
        """
        self._service = search_service
    
    def search(self, keyword: str = "", page: int = 1) -> Dict[str, Any]:
        """
        API: 搜索图书
        
        Args:
            keyword: 搜索关键词
            page: 页码
            
        Returns:
            搜索结果字典
        """
        if not keyword:
            return {"code": 400, "message": "请提供搜索关键词"}
        
        return self._service.search(keyword, page)
    
    def get_history(self) -> Dict[str, Any]:
        """
        API: 获取搜索历史
        
        Returns:
            搜索历史列表
        """
        history = self._service.get_history()
        return {"code": 200, "data": history}
