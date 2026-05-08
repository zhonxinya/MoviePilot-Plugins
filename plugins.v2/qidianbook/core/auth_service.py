"""
认证服务层

职责：
1. 管理起点用户认证信息（Cookie）
2. 验证Cookie有效性
3. 提供认证状态查询
"""

from typing import Dict, Any, Optional
from app.log import logger


class AuthService:
    """起点认证服务"""
    
    def __init__(
        self,
        client,
        save_data_func,
        get_data_func
    ):
        """
        初始化认证服务
        
        Args:
            client: QidianClient实例
            save_data_func: 保存数据的函数
            get_data_func: 获取数据的函数
        """
        self._client = client
        self._save_data = save_data_func
        self._get_data = get_data_func
        
        # 加载已保存的认证信息
        self._auth_info = self._load_auth_info()
        
        logger.info('✅ AuthService 初始化完成')
    
    def login_with_cookie(self, cookie: str) -> Dict[str, Any]:
        """
        使用Cookie登录
        
        Args:
            cookie: Cookie字符串
            
        Returns:
            登录结果字典
        """
        if not cookie or not cookie.strip():
            return {"code": 400, "message": "Cookie不能为空"}
        
        try:
            logger.info('🔐 尝试验证Cookie...')
            
            # 设置Cookie到客户端
            self._client.set_cookie(cookie)
            
            # 验证Cookie是否有效
            is_valid = self._validate_cookie()
            
            if is_valid:
                # 保存认证信息
                self._save_auth_info(cookie)
                
                logger.info('✅ Cookie验证成功')
                return {
                    "code": 200,
                    "message": "登录成功",
                    "data": {
                        "logged_in": True,
                        "username": self._get_username_from_cookie(cookie)
                    }
                }
            else:
                logger.warning('⚠️ Cookie无效或已过期')
                return {
                    "code": 401,
                    "message": "Cookie无效或已过期，请重新获取"
                }
                
        except Exception as e:
            logger.error(f'❌ 登录失败: {str(e)}')
            return {"code": 500, "message": f"登录失败: {str(e)}"}
    
    def logout(self) -> Dict[str, Any]:
        """
        登出
        
        Returns:
            登出结果
        """
        try:
            # 清除Cookie
            self._client.clear_cookie()
            
            # 清除保存的认证信息
            self._save_data("qidian_auth", None)
            self._auth_info = None
            
            logger.info('🚪 已登出')
            return {"code": 200, "message": "登出成功"}
            
        except Exception as e:
            logger.error(f'❌ 登出失败: {str(e)}')
            return {"code": 500, "message": f"登出失败: {str(e)}"}
    
    def get_auth_status(self) -> Dict[str, Any]:
        """
        获取认证状态
        
        Returns:
            认证状态信息
        """
        if not self._auth_info:
            return {
                "code": 200,
                "data": {
                    "logged_in": False,
                    "username": None,
                    "cookie_valid": False
                }
            }
        
        # 验证Cookie是否仍然有效
        is_valid = self._validate_cookie()
        
        return {
            "code": 200,
            "data": {
                "logged_in": True,
                "username": self._auth_info.get("username"),
                "cookie_valid": is_valid,
                "last_login": self._auth_info.get("login_time")
            }
        }
    
    def is_logged_in(self) -> bool:
        """
        检查是否已登录
        
        Returns:
            是否已登录
        """
        if not self._auth_info:
            return False
        
        return self._validate_cookie()
    
    def get_cookie(self) -> Optional[str]:
        """
        获取当前Cookie
        
        Returns:
            Cookie字符串，未登录返回None
        """
        if self._auth_info:
            return self._auth_info.get("cookie")
        return None
    
    def _validate_cookie(self) -> bool:
        """
        验证Cookie是否有效
        
        Returns:
            Cookie是否有效
        """
        try:
            # 尝试访问需要认证的页面来验证Cookie
            # 这里使用一个简单的接口测试
            result = self._client.test_auth()
            return result
            
        except Exception as e:
            logger.debug(f'Cookie验证失败: {str(e)}')
            return False
    
    def _save_auth_info(self, cookie: str):
        """
        保存认证信息
        
        Args:
            cookie: Cookie字符串
        """
        from datetime import datetime
        
        auth_info = {
            "cookie": cookie,
            "username": self._get_username_from_cookie(cookie),
            "login_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self._save_data("qidian_auth", auth_info)
        self._auth_info = auth_info
        
        logger.info('💾 认证信息已保存')
    
    def _load_auth_info(self) -> Optional[Dict]:
        """
        加载已保存的认证信息
        
        Returns:
            认证信息字典，不存在返回None
        """
        try:
            auth_info = self._get_data("qidian_auth")
            if auth_info:
                logger.info('📂 已加载保存的认证信息')
                # 恢复Cookie到客户端
                self._client.set_cookie(auth_info.get("cookie", ""))
            return auth_info
        except Exception as e:
            logger.warning(f'⚠️ 加载认证信息失败: {str(e)}')
            return None
    
    def _get_username_from_cookie(self, cookie: str) -> str:
        """
        从Cookie中提取用户名（简化版）
        
        Args:
            cookie: Cookie字符串
            
        Returns:
            用户名
        """
        # 实际需要从Cookie中解析，这里简化处理
        # 起点Cookie中可能包含e1字段表示用户ID
        if "e1=" in cookie:
            parts = cookie.split("e1=")
            if len(parts) > 1:
                user_id = parts[1].split(";")[0]
                return f"用户{user_id[:6]}"
        
        return "起点用户"
