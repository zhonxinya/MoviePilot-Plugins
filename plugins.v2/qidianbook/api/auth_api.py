"""
认证API端点适配器

职责：将AuthService的方法适配为FastAPI端点格式
"""

from typing import Dict, Any


class AuthAPI:
    """认证API端点"""
    
    def __init__(self, auth_service):
        """
        初始化认证API
        
        Args:
            auth_service: AuthService实例
        """
        self._service = auth_service
    
    def login(self, cookie: str) -> Dict[str, Any]:
        """
        API: 使用Cookie登录
        
        Args:
            cookie: Cookie字符串
            
        Returns:
            登录结果
        """
        return self._service.login_with_cookie(cookie)
    
    def logout(self) -> Dict[str, Any]:
        """
        API: 登出
        
        Returns:
            登出结果
        """
        return self._service.logout()
    
    def get_status(self) -> Dict[str, Any]:
        """
        API: 获取认证状态
        
        Returns:
            认证状态信息
        """
        return self._service.get_auth_status()
