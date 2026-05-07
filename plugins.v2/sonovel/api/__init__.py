"""
Sonovel 插件 API 端点模块
负责路由适配和参数验证
"""

from .search_api import SearchAPI
from .download_api import DownloadAPI
from .config_api import ConfigAPI

__all__ = [
    'SearchAPI',
    'DownloadAPI',
    'ConfigAPI'
]
