"""
搜索缓存管理器
负责搜索结果的缓存、持久化和过期管理
"""

import time
import threading
from typing import Dict, List, Optional, Any
from app.log import logger


class CacheManager:
    """搜索结果缓存管理器"""
    
    def __init__(self, ttl: int = 3600, max_cache_age: int = 86400):
        """
        初始化缓存管理器
        
        Args:
            ttl: 缓存有效期(秒),默认1小时
            max_cache_age: 缓存最大保存时间(秒),默认24小时
        """
        self._cache: Dict[str, Dict] = {}  # keyword -> {results, timestamp}
        self._ttl = ttl
        self._max_cache_age = max_cache_age
        self._lock = threading.Lock()
        self._restored = False
    
    def get(self, keyword: str) -> Optional[List]:
        """
        从缓存中获取搜索结果
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            缓存的搜索结果,如果不存在或已过期则返回 None
        """
        with self._lock:
            cache_key = keyword.lower().strip()
            if cache_key in self._cache:
                cache_entry = self._cache[cache_key]
                # 检查是否过期
                if time.time() - cache_entry['timestamp'] < self._ttl:
                    remaining = int(self._ttl - (time.time() - cache_entry["timestamp"]))
                    logger.info(f'✅ 使用缓存结果: {keyword} (剩余时间: {remaining}秒)')
                    return cache_entry['results']
                else:
                    # 已过期,删除缓存
                    logger.info(f'⚠️ 缓存已过期: {keyword}')
                    del self._cache[cache_key]
        return None
    
    def set(self, keyword: str, results: List):
        """
        保存搜索结果到缓存
        
        Args:
            keyword: 搜索关键词
            results: 搜索结果列表
        """
        with self._lock:
            cache_key = keyword.lower().strip()
            self._cache[cache_key] = {
                'results': results,
                'timestamp': time.time()
            }
            logger.info(f'💾 已缓存搜索结果: {keyword} (共{len(results)}条)')
    
    def clear(self) -> int:
        """
        清空所有缓存
        
        Returns:
            清空的缓存数量
        """
        with self._lock:
            count = len(self._cache)
            self._cache.clear()
        
        logger.info(f'🗑️ 已清空搜索缓存 ({count}条记录)')
        return count
    
    def get_status(self) -> Dict[str, Any]:
        """
        获取缓存状态信息
        
        Returns:
            缓存状态字典
        """
        with self._lock:
            cache_count = len(self._cache)
            cache_keys = list(self._cache.keys())
            
            # 计算缓存统计信息
            total_results = sum(len(entry['results']) for entry in self._cache.values())
            
            # 估算内存使用（粗略估计）
            import sys
            memory_bytes = sys.getsizeof(self._cache)
            for entry in self._cache.values():
                memory_bytes += sys.getsizeof(entry)
                if 'results' in entry:
                    memory_bytes += sys.getsizeof(entry['results'])
            
            # 转换为可读格式
            if memory_bytes < 1024:
                memory_usage = f"{memory_bytes} B"
            elif memory_bytes < 1024 * 1024:
                memory_usage = f"{memory_bytes / 1024:.2f} KB"
            else:
                memory_usage = f"{memory_bytes / (1024 * 1024):.2f} MB"
            
            # 检查每个缓存项的剩余时间
            cache_details = []
            current_time = time.time()
            for keyword, entry in self._cache.items():
                remaining_ttl = self._ttl - (current_time - entry['timestamp'])
                cache_details.append({
                    'keyword': keyword,
                    'result_count': len(entry['results']),
                    'remaining_seconds': int(remaining_ttl),
                    'is_expired': remaining_ttl <= 0
                })
        
        return {
            "cache_enabled": True,
            "cache_ttl": self._ttl,
            "cache_size": cache_count,  # 前端期望的字段名
            "memory_usage": memory_usage,  # 前端期望的字段名
            "total_cached_keywords": cache_count,
            "total_cached_results": total_results,
            "cache_restored": self._restored,
            "cached_keywords": cache_keys[:20],  # 最多显示20个关键词
            "cache_details": cache_details[:10]  # 最多显示10个详情
        }
    
    def save_to_storage(self, save_func):
        """
        保存缓存到持久化存储
        
        Args:
            save_func: 保存函数,接收 (key, data) 参数
        """
        try:
            cache_data = {
                'cache': self._cache,
                'timestamp': time.time()
            }
            save_func("search_cache", cache_data)
            logger.info(f'💾 已保存 {len(self._cache)} 条缓存记录到数据库')
        except Exception as e:
            logger.error(f'❌ 保存搜索缓存失败: {str(e)}')
    
    def restore_from_storage(self, load_func):
        """
        从持久化存储恢复缓存
        
        Args:
            load_func: 加载函数,接收 key 参数,返回数据
            
        Returns:
            恢复的缓存数量
        """
        try:
            cache_data = load_func("search_cache")
            if cache_data and isinstance(cache_data, dict):
                saved_cache = cache_data.get('cache', {})
                saved_timestamp = cache_data.get('timestamp', 0)
                
                # 检查缓存是否过期(超过24小时则不恢复)
                if time.time() - saved_timestamp > self._max_cache_age:
                    logger.info('⚠️ 缓存数据已过期(超过24小时),不予恢复')
                    return 0
                
                # 过滤已过期的缓存项
                current_time = time.time()
                valid_cache = {}
                expired_count = 0
                
                for keyword, entry in saved_cache.items():
                    if current_time - entry.get('timestamp', 0) < self._ttl:
                        valid_cache[keyword] = entry
                    else:
                        expired_count += 1
                
                with self._lock:
                    self._cache = valid_cache
                    self._restored = True
                
                logger.info(f'✅ 已恢复 {len(valid_cache)} 条有效缓存 (过期{expired_count}条)')
                return len(valid_cache)
        except Exception as e:
            logger.error(f'❌ 恢复搜索缓存失败: {str(e)}')
        
        return 0
    
    @property
    def is_restored(self) -> bool:
        """缓存是否已从存储恢复"""
        return self._restored
    
    @property
    def size(self) -> int:
        """当前缓存条目数"""
        with self._lock:
            return len(self._cache)
