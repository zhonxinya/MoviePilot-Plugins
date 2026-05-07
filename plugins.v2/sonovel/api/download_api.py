"""
下载相关 API 端点
"""

from typing import Dict, Any
from app.log import logger

# 支持直接运行和作为模块导入
try:
    from ..core.download_service import DownloadService
except ImportError:
    from app.plugins.sonovel.core.download_service import DownloadService


class DownloadAPI:
    """下载 API 端点适配器"""
    
    def __init__(self, download_service: DownloadService):
        """
        初始化下载 API
        
        Args:
            download_service: 下载服务实例
        """
        self._service = download_service
    
    def download(self, book_data: dict = None) -> Dict[str, Any]:
        """
        API: 提交下载任务到后台执行
        
        Args:
            book_data: 书籍信息字典
            
        Returns:
            任务ID和状态
        """
        return self._service.submit_download(book_data)
    
    def get_tasks(self) -> Dict[str, Any]:
        """
        API: 获取所有下载任务状态
        
        Returns:
            下载任务列表
        """
        return self._service.get_all_tasks()
    
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """
        API: 获取单个下载任务状态
        
        Args:
            task_id: 任务ID
            
        Returns:
            任务状态
        """
        return self._service.get_task(task_id)
