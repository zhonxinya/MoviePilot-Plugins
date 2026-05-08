"""
API端点模块
"""

from .search_api import SearchAPI
from .detail_api import DetailAPI
from .category_api import CategoryAPI
from .auth_api import AuthAPI
from .config_api import ConfigAPI

__all__ = ['SearchAPI', 'DetailAPI', 'CategoryAPI', 'AuthAPI', 'ConfigAPI']
