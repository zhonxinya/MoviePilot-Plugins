"""
搜索服务层

职责：
1. 封装图书搜索业务逻辑
2. 管理搜索结果缓存
3. 提供搜索历史功能
"""

from typing import Dict, List, Any, Callable, Optional
from app.log import logger


class SearchService:
    """图书搜索服务"""
    
    def __init__(
        self,
        client,
        save_data_func: Callable,
        get_data_func: Callable,
        max_results: int = 20
    ):
        """
        初始化搜索服务
        
        Args:
            client: QidianClient实例
            save_data_func: 保存数据的函数（来自插件）
            get_data_func: 获取数据的函数（来自插件）
            max_results: 最大返回结果数
        """
        self._client = client
        self._save_data = save_data_func
        self._get_data = get_data_func
        self._max_results = max_results
        
        logger.info('✅ SearchService 初始化完成')
    
    def search(self, keyword: str, page: int = 1) -> Dict[str, Any]:
        """
        搜索图书
        
        Args:
            keyword: 搜索关键词
            page: 页码
            
        Returns:
            搜索结果字典
        """
        if not keyword:
            return {"code": 400, "message": "缺少关键词参数"}
        
        try:
            logger.info(f'🔍 执行搜索: {keyword}, 页码: {page}')
            
            # 调用客户端搜索
            books = self._client.search_books(keyword, page)
            
            # 限制返回数量
            books = books[:self._max_results]
            
            # 保存搜索历史
            self._save_search_history(keyword, len(books))
            
            return {
                "code": 200,
                "data": {
                    "books": books,
                    "total": len(books),
                    "page": page,
                    "keyword": keyword
                }
            }
            
        except Exception as e:
            logger.error(f'❌ 搜索失败: {str(e)}')
            return {"code": 500, "message": f"搜索失败: {str(e)}"}
    
    def get_book_detail(self, book_id: str) -> Dict[str, Any]:
        """
        获取图书详情
        
        Args:
            book_id: 图书ID
            
        Returns:
            图书详情字典
        """
        if not book_id:
            return {"code": 400, "message": "缺少图书ID"}
        
        try:
            logger.info(f'📖 获取图书详情: {book_id}')
            
            detail = self._client.get_book_detail(book_id)
            
            if detail:
                return {"code": 200, "data": detail}
            else:
                return {"code": 404, "message": "图书不存在"}
                
        except Exception as e:
            logger.error(f'❌ 获取详情失败: {str(e)}')
            return {"code": 500, "message": f"获取详情失败: {str(e)}"}
    
    def get_categories(self) -> Dict[str, Any]:
        """
        获取图书分类
        
        Returns:
            分类列表字典
        """
        try:
            logger.info('📚 获取图书分类')
            
            categories = self._client.get_categories()
            
            return {"code": 200, "data": categories}
            
        except Exception as e:
            logger.error(f'❌ 获取分类失败: {str(e)}')
            return {"code": 500, "message": f"获取分类失败: {str(e)}"}
    
    def get_history(self) -> List[Dict]:
        """
        获取搜索历史
        
        Returns:
            搜索历史列表
        """
        try:
            history = self._get_data("search_history") or []
            return history
        except Exception as e:
            logger.error(f'❌ 获取搜索历史失败: {str(e)}')
            return []
    
    def _save_search_history(self, keyword: str, result_count: int):
        """
        保存搜索历史
        
        Args:
            keyword: 搜索关键词
            result_count: 结果数量
        """
        try:
            history = self._get_data("search_history") or []
            
            # 添加新记录
            history.insert(0, {
                "keyword": keyword,
                "result_count": result_count,
                "timestamp": self._get_timestamp()
            })
            
            # 只保留最近20条
            history = history[:20]
            
            self._save_data("search_history", history)
            
        except Exception as e:
            logger.warning(f'⚠️ 保存搜索历史失败: {str(e)}')
    
    def _get_timestamp(self) -> str:
        """获取当前时间戳字符串"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
