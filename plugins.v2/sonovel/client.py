"""
SoNovel API HTTP 客户端
基于 requests 库实现，参考 HarmonyOS SoNovelClient.ets
"""

import requests
from typing import List, Optional
from urllib.parse import urlencode, quote

from app.log import logger

from .models import SoNovelSearchResult, BookFetchRequest


class SoNovelClient:
    """SoNovel 书源服务 API 客户端"""

    def __init__(self, base_url: str = "https://your-api-server.com"):
        """
        初始化客户端
        
        Args:
            base_url: API 基础 URL
        """
        # 移除末尾斜杠
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })

    def search_aggregated(self, keyword: str) -> List[SoNovelSearchResult]:
        """
        搜索书籍（聚合搜索）
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            搜索结果列表
            
        Raises:
            Exception: 请求失败时抛出异常
        """
        url = f"{self.base_url}/search/aggregated"
        params = {'kw': keyword}
        
        logger.info(f'🔍 开始搜索: {keyword}')
        logger.info(f'📡 请求 URL: {url}?kw={quote(keyword)}')
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            logger.info(f'📨 响应状态码: {response.status_code}')
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('code') == 200:
                    results = [SoNovelSearchResult(**item) for item in data.get('data', [])]
                    logger.info(f'✅ 搜索成功, 结果数量: {len(results)}')
                    return results
                else:
                    error_msg = data.get('message', '搜索失败')
                    logger.info(f'❌ API 错误: {error_msg}')
                    raise Exception(error_msg)
            else:
                logger.info(f'❌ HTTP 错误: {response.status_code}')
                raise Exception(f'HTTP {response.status_code}')
                
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            logger.info(f'❌ 搜索请求失败: {error_msg}')
            raise Exception(f'搜索失败: {error_msg}')

    def book_fetch(self, request: BookFetchRequest) -> bool:
        """
        获取书籍（从书源抓取并转换为指定格式）
        
        Args:
            request: 书籍获取请求参数
            
        Returns:
            True 表示远程下载成功，False 表示失败
            
        Raises:
            Exception: 请求失败时抛出异常
        """
        url = f"{self.base_url}/book-fetch"
        
        # 构建查询参数 - 只传递非空参数
        params = {}
        
        # 必填参数
        if request.sourceId:
            params['sourceId'] = str(request.sourceId)
        if request.sourceName:
            params['sourceName'] = request.sourceName
        if request.url:
            params['url'] = request.url
        if request.bookName:
            params['bookName'] = request.bookName
        if request.author:
            params['author'] = request.author
        
        # 可选参数 - 只在有值时添加
        if request.category:
            params['category'] = request.category
        if request.latestChapter:
            params['latestChapter'] = request.latestChapter
        if request.lastUpdateTime:
            params['lastUpdateTime'] = request.lastUpdateTime
        if request.status:
            params['status'] = request.status
        if request.format:
            params['format'] = request.format
        if request.language:
            params['language'] = request.language
        
        logger.info(f'📚 开始获取书籍: {request.bookName}')
        logger.info('⏱️ 超时设置: 600秒 (10分钟)')
        logger.info(f'📡 请求 URL: {url}')
        logger.info('📋 参数:')
        for key, value in params.items():
            logger.info(f'   {key}: {value}')
        
        # 验证必填参数
        required_params = ['sourceId', 'sourceName', 'url', 'bookName', 'author']
        missing_params = [p for p in required_params if not params.get(p)]
        if missing_params:
            error_msg = f'缺少必填参数: {", ".join(missing_params)}'
            logger.info(f'❌ {error_msg}')
            raise Exception(error_msg)
        
        try:
            logger.info('🚀 发送请求...')
            import time
            start_time = time.time()
            response = self.session.get(url, params=params, timeout=600)
            elapsed = time.time() - start_time
            logger.info(f'📨 响应状态码: {response.status_code} (耗时: {elapsed:.2f}秒)')
            
            if response.status_code == 200:
                # 远程 API 只返回 200 状态码，文件保存在远程服务器
                # 不检查响应内容长度
                logger.info('✅ 书籍已在远程服务器下载成功')
                return True
            else:
                logger.info(f'❌ HTTP 错误: {response.status_code}')
                logger.info(f'❌ 请求 URL: {url}')
                logger.info(f'❌ 请求参数: {params}')
                logger.info(f'❌ 响应内容: {response.text[:1000]}')
                
                # 尝试解析 JSON 错误信息
                error_detail = response.text[:500]
                try:
                    error_json = response.json()
                    if isinstance(error_json, dict):
                        error_detail = error_json.get('message', error_json.get('error', str(error_json)))
                except:
                    pass
                
                raise Exception(f'远程 API 错误 {response.status_code}: {error_detail}')
                
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            logger.info(f'❌ 书籍获取请求失败: {error_msg}')
            raise Exception(f'书籍获取失败: {error_msg}')

    def update_base_url(self, new_base_url: str) -> None:
        """
        更新基础 URL
        
        Args:
            new_base_url: 新的基础 URL
        """
        self.base_url = new_base_url.rstrip('/')
        logger.info(f'🔄 基础 URL 已更新: {self.base_url}')

    def get_base_url(self) -> str:
        """获取当前基础 URL"""
        return self.base_url

    def close(self) -> None:
        """关闭会话"""
        self.session.close()
