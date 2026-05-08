"""
分类API端点适配器

职责：将SearchService的分类方法适配为FastAPI端点格式
"""

from typing import Dict, Any


class CategoryAPI:
    """分类API端点"""
    
    def __init__(self, search_service):
        """
        初始化分类API
        
        Args:
            search_service: SearchService实例
        """
        self._service = search_service
    
    def get_categories(self) -> Dict[str, Any]:
        """
        API: 获取图书分类
        
        Returns:
            分类列表字典
        """
        return self._service.get_categories()
