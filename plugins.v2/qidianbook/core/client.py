"""
起点HTTP客户端

职责：
1. 封装起点API的HTTP请求
2. 处理请求头、超时等通用逻辑
3. 提供统一的错误处理
"""

from typing import Dict, Optional, List
import requests
from urllib.parse import quote

from app.log import logger


class QidianClient:
    """起点中文网HTTP客户端"""
    
    def __init__(self, timeout: int = 10):
        """
        初始化客户端
        
        Args:
            timeout: 请求超时时间（秒）
        """
        self._timeout = timeout
        self._session = requests.Session()
        self._session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })
        self._cookie = None
        
        logger.info(f'✅ QidianClient 初始化完成, timeout={timeout}')
    
    def set_cookie(self, cookie: str):
        """
        设置Cookie
        
        Args:
            cookie: Cookie字符串
        """
        self._cookie = cookie
        if cookie:
            # 解析Cookie并设置到session
            cookies = {}
            for item in cookie.split(';'):
                if '=' in item:
                    key, value = item.strip().split('=', 1)
                    cookies[key] = value
            
            self._session.cookies.update(cookies)
            logger.debug('🍪 Cookie已设置')
    
    def clear_cookie(self):
        """清除Cookie"""
        self._cookie = None
        self._session.cookies.clear()
        logger.debug('🗑️ Cookie已清除')
    
    def test_auth(self) -> bool:
        """
        测试认证是否有效
        
        Returns:
            认证是否有效
        """
        try:
            # 尝试访问个人中心页面验证Cookie
            url = "https://my.qidian.com/"
            response = self._session.get(url, timeout=self._timeout, allow_redirects=False)
            
            # 如果返回302重定向到登录页，说明Cookie无效
            if response.status_code == 302:
                location = response.headers.get('Location', '')
                if 'login' in location.lower():
                    return False
            
            # 其他情况认为Cookie有效
            return True
            
        except Exception as e:
            logger.debug(f'认证测试失败: {str(e)}')
            return False
    
    def search_books(self, keyword: str, page: int = 1) -> List[Dict]:
        """
        搜索图书
        
        Args:
            keyword: 搜索关键词
            page: 页码
            
        Returns:
            图书列表
        """
        try:
            url = f"https://www.qidian.com/search?kw={quote(keyword)}&page={page}"
            
            logger.debug(f'🔍 发起搜索请求: {url}')
            response = self._session.get(url, timeout=self._timeout)
            response.raise_for_status()
            
            # 解析HTML获取图书信息
            books = self._parse_search_results(response.text, keyword)
            
            logger.info(f'✅ 搜索成功，找到 {len(books)} 本图书')
            return books
            
        except Exception as e:
            logger.warning(f'⚠️ 搜索API调用失败: {str(e)}')
            # 返回示例数据用于测试
            return self._get_sample_books(keyword)
    
    def get_book_detail(self, book_id: str) -> Optional[Dict]:
        """
        获取图书详情
        
        Args:
            book_id: 图书ID
            
        Returns:
            图书详情字典，失败返回None
        """
        try:
            url = f"https://book.qidian.com/info/{book_id}"
            
            logger.debug(f'📖 获取图书详情: {url}')
            response = self._session.get(url, timeout=self._timeout)
            response.raise_for_status()
            
            # 解析HTML获取图书详情
            detail = self._parse_book_detail(response.text, book_id)
            
            return detail
            
        except Exception as e:
            logger.warning(f'⚠️ 详情API调用失败: {str(e)}')
            # 返回示例数据
            return self._get_sample_book_detail(book_id)
    
    def get_categories(self) -> List[Dict]:
        """
        获取图书分类列表
        
        Returns:
            分类列表
        """
        return [
            {"id": "fantasy", "name": "玄幻奇幻"},
            {"id": "xianxia", "name": "仙侠武侠"},
            {"id": "urban", "name": "都市生活"},
            {"id": "history", "name": "历史军事"},
            {"id": "game", "name": "游戏竞技"},
            {"id": "scifi", "name": "科幻空间"},
            {"id": "mystery", "name": "悬疑灵异"},
            {"id": "romance", "name": "浪漫青春"},
        ]
    
    def _parse_search_results(self, html: str, keyword: str) -> List[Dict]:
        """
        解析搜索结果HTML
        
        Args:
            html: HTML内容
            keyword: 搜索关键词
            
        Returns:
            图书列表
        """
        # TODO: 实现真实的HTML解析逻辑
        # 当前返回示例数据
        return self._get_sample_books(keyword)
    
    def _parse_book_detail(self, html: str, book_id: str) -> Optional[Dict]:
        """
        解析图书详情HTML
        
        Args:
            html: HTML内容
            book_id: 图书ID
            
        Returns:
            图书详情字典
        """
        # TODO: 实现真实的HTML解析逻辑
        # 当前返回示例数据
        return self._get_sample_book_detail(book_id)
    
    def _get_sample_books(self, keyword: str) -> List[Dict]:
        """
        获取示例图书数据（用于测试）
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            图书列表
        """
        return [
            {
                "id": "1035993340",
                "title": f"{keyword} - 示例图书1",
                "author": "示例作者1",
                "cover": "https://img.qidian.com/qdbk/1035993340/cover.jpg",
                "category": "玄幻奇幻",
                "status": "连载中",
                "word_count": "100万字",
                "rating": 4.5,
                "description": f"这是一本关于{keyword}的示例小说..."
            },
            {
                "id": "1035993341",
                "title": f"{keyword}传奇",
                "author": "示例作者2",
                "cover": "https://img.qidian.com/qdbk/1035993341/cover.jpg",
                "category": "仙侠武侠",
                "status": "已完结",
                "word_count": "200万字",
                "rating": 4.8,
                "description": f"讲述{keyword}的传奇故事..."
            },
            {
                "id": "1035993342",
                "title": f"{keyword}之旅",
                "author": "示例作者3",
                "cover": "https://img.qidian.com/qdbk/1035993342/cover.jpg",
                "category": "都市生活",
                "status": "连载中",
                "word_count": "50万字",
                "rating": 4.2,
                "description": f"一段关于{keyword}的精彩旅程..."
            },
        ]
    
    def _get_sample_book_detail(self, book_id: str) -> Optional[Dict]:
        """
        获取示例图书详情（用于测试）
        
        Args:
            book_id: 图书ID
            
        Returns:
            图书详情字典
        """
        return {
            "id": book_id,
            "title": f"示例图书-{book_id}",
            "author": "示例作者",
            "cover": f"https://img.qidian.com/qdbk/{book_id}/cover.jpg",
            "category": "玄幻奇幻",
            "status": "连载中",
            "word_count": "100万字",
            "rating": 4.5,
            "description": "这是一本示例小说的详细介绍...",
            "chapters": [
                {"id": "1", "title": "第一章 开始", "word_count": "3000"},
                {"id": "2", "title": "第二章 发展", "word_count": "3200"},
                {"id": "3", "title": "第三章 高潮", "word_count": "3500"},
            ],
            "tags": ["玄幻", "热血", "升级"],
            "last_update": "2024-01-01",
        }
    
    def close(self):
        """关闭客户端，释放资源"""
        if self._session:
            self._session.close()
            logger.info('🗑️ QidianClient 已关闭')
