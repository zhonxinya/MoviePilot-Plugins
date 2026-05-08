"""
详情API端点适配器

职责：将SearchService的详情方法适配为FastAPI端点格式
"""

from typing import Dict, Any


class DetailAPI:
    """详情API端点"""
    
    def __init__(self, search_service):
        """
        初始化详情API
        
        Args:
            search_service: SearchService实例
        """
        self._service = search_service
    
    def get_detail(self, book_id: str) -> Dict[str, Any]:
        """
        API: 获取图书详情
        
        Args:
            book_id: 图书ID
            
        Returns:
            图书详情字典
        """
        if not book_id:
            return {"code": 400, "message": "请提供图书ID"}
        
        return self._service.get_book_detail(book_id)
