"""
搜索服务
负责图书搜索业务逻辑,包括缓存管理、历史记录等
"""

from typing import List, Dict, Any, Optional, Callable
from datetime import datetime

from app.log import logger
from app.schemas.types import NotificationType

# 支持直接运行和作为模块导入
try:
    from ..client import SoNovelClient
    from ..models import SoNovelSearchResult
    from .cache_manager import CacheManager
except ImportError:
    from app.plugins.sonovel.client import SoNovelClient
    from app.plugins.sonovel.models import SoNovelSearchResult
    from app.plugins.sonovel.core.cache_manager import CacheManager



class SearchService:
    """图书搜索服务"""
    
    def __init__(
        self,
        client: SoNovelClient,
        cache_manager: CacheManager,
        save_data_func: Callable,
        get_data_func: Callable,
        post_message_func: Callable
    ):
        """
        初始化搜索服务
        
        Args:
            client: SoNovel API 客户端
            cache_manager: 缓存管理器
            save_data_func: 保存数据函数 (key, data)
            get_data_func: 获取数据函数 (key) -> data
            post_message_func: 发送消息函数
        """
        self._client = client
        self._cache = cache_manager
        self._save_data = save_data_func
        self._get_data = get_data_func
        self._post_message = post_message_func
    
    def search(self, keyword: str) -> Dict[str, Any]:
        """
        执行搜索
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            搜索结果字典 {code, message, data}
        """
        try:
            # 首次搜索时恢复缓存(延迟加载)
            if not self._cache.is_restored:
                restored_count = self._cache.restore_from_storage(self._get_data)
                logger.info(f'📦 已恢复 {restored_count} 条缓存记录')
            
            # 尝试从缓存获取
            cached_results = self._cache.get(keyword)
            if cached_results is not None:
                results = cached_results
                logger.info(f'✅ 使用缓存结果: {keyword}')
            else:
                # 执行搜索
                logger.info(f'🔍 执行搜索: {keyword}')
                results = self._client.search_aggregated(keyword)
                
                # 保存到缓存
                if results:
                    self._cache.set(keyword, results)
            
            # 保存搜索历史
            self._save_search_history(keyword, len(results))
            
            # 发送通知
            if results:
                self._post_message(
                    mtype=NotificationType.Plugin,
                    title=f"🔍 Sonovel 搜索完成:{keyword}",
                    text=f"找到 {len(results)} 本相关书籍"
                )
            
            return {
                "code": 200,
                "message": "success",
                "data": [result.model_dump() for result in results]
            }
        except Exception as e:
            logger.error(f'❌ 搜索失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def _save_search_history(self, keyword: str, count: int):
        """
        保存搜索历史
        
        Args:
            keyword: 搜索关键词
            count: 结果数量
        """
        try:
            search_history = self._get_data("search_history") or []
            search_history.insert(0, {
                "keyword": keyword,
                "count": count,
                "timestamp": self._get_current_timestamp(),
            })
            # 只保留最近50条记录
            search_history = search_history[:50]
            self._save_data("search_history", search_history)
        except Exception as e:
            logger.error(f'❌ 保存搜索历史失败: {str(e)}')
    
    def get_history(self, limit: int = 10) -> Dict[str, Any]:
        """
        获取搜索历史
        
        Args:
            limit: 返回数量限制
            
        Returns:
            搜索历史列表
        """
        try:
            search_history = self._get_data("search_history") or []
            return {
                "code": 200,
                "message": "success",
                "data": search_history[:limit]
            }
        except Exception as e:
            return {"code": 500, "message": str(e)}
    
    def get_last_results(self) -> Dict[str, Any]:
        """
        获取最近一次搜索的结果
        
        Returns:
            最近搜索结果和关键词
        """
        try:
            # 从搜索历史中获取最近的关键词
            search_history = self._get_data("search_history") or []
            if not search_history:
                return {
                    "code": 200,
                    "message": "success",
                    "data": {
                        "keyword": None,
                        "results": []
                    }
                }
            
            last_keyword = search_history[0].get("keyword", "")
            
            # 从缓存中获取结果
            cached_results = self._cache.get(last_keyword)
            
            return {
                "code": 200,
                "message": "success",
                "data": {
                    "keyword": last_keyword,
                    "results": [result.model_dump() for result in cached_results] if cached_results else []
                }
            }
        except Exception as e:
            logger.error(f'❌ 获取最近搜索结果失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def get_cache_status(self) -> Dict[str, Any]:
        """
        获取缓存状态
        
        Returns:
            缓存状态信息
        """
        try:
            status = self._cache.get_status()
            return {
                "code": 200,
                "message": "success",
                "data": status
            }
        except Exception as e:
            logger.error(f'❌ 获取缓存状态失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def clear_cache(self) -> Dict[str, Any]:
        """
        清空搜索缓存
        
        Returns:
            操作结果
        """
        try:
            cleared_count = self._cache.clear()
            return {
                "code": 200,
                "message": "success",
                "data": {
                    "cleared_count": cleared_count
                }
            }
        except Exception as e:
            logger.error(f'❌ 清空缓存失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def shutdown(self):
        """
        关闭服务,保存缓存
        """
        # 保存搜索缓存到数据库
        self._cache.save_to_storage(self._save_data)
        
        # 清空内存中的搜索缓存
        cache_count = self._cache.size
        if cache_count > 0:
            self._cache.clear()
            logger.info(f'🗑️ 已清空内存搜索缓存 ({cache_count}条记录)')
    
    @staticmethod
    def _get_current_timestamp() -> str:
        """获取当前时间戳字符串"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
