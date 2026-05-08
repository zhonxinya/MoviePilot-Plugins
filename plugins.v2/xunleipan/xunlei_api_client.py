"""
迅雷网盘 API 客户端
封装所有与迅雷网盘的通信逻辑
"""
from typing import Dict, List, Optional
import time
import requests
from app.log import logger


class XunleiApiClient:
    """
    迅雷网盘 API 客户端
    
    功能:
    - 会话管理和自动登录
    - 文件浏览和列表获取
    - 离线下载任务管理
    - 文件下载链接获取
    """
    
    def __init__(self, username: str, password: str):
        """
        初始化 API 客户端
        
        :param username: 迅雷账号(手机号或邮箱)
        :param password: 密码
        """
        self._username = username
        self._password = password
        
        # API 基础 URL
        self._base_url = "https://api-pan.xunlei.com"
        
        # 认证会话
        self._session: Optional[requests.Session] = None
        self._access_token: Optional[str] = None
        self._token_expiry: float = 0
        
        # Cookie 持久化
        self._cookies: Dict = {}
    
    def _get_authenticated_session(self) -> Optional[requests.Session]:
        """
        获取已认证的会话
        
        :return: 已认证的 requests.Session 对象,失败返回 None
        """
        current_time = time.time()
        
        # 检查是否有有效的 token
        if self._access_token and current_time < self._token_expiry:
            logger.debug(f"✅ 使用缓存的访问令牌 (剩余 {int(self._token_expiry - current_time)} 秒)")
            return self._session
        
        # 需要重新登录
        logger.info(f"🔐 正在登录迅雷网盘: {self._username}")
        
        try:
            # 创建新会话
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://pan.xunlei.com',
                'Referer': 'https://pan.xunlei.com/'
            })
            
            # 第一步：获取登录所需的参数（salt, nonce等）
            pre_login_url = "https://xluser-ssl.xunlei.com/v1/shield/captcha/init"
            pre_login_data = {
                "client_id": "XUNLEI_WEB_CLIENT_ID",
                "action": "POST:/v1/auth/signin"
            }
            
            logger.debug("   步骤1: 获取预登录参数...")
            pre_response = session.post(pre_login_url, json=pre_login_data, timeout=10)
            pre_response.raise_for_status()
            pre_result = pre_response.json()
            
            if pre_result.get("code") != 0:
                logger.error(f"❌ 预登录失败: {pre_result.get('message')}")
                return None
            
            captcha_info = pre_result.get("data", {})
            salt = captcha_info.get("salt", "")
            nonce = captcha_info.get("nonce", "")
            
            logger.debug(f"   获取到 salt 和 nonce")
            
            # 第二步：执行登录
            login_url = "https://xluser-ssl.xunlei.com/v1/auth/signin"
            
            # 注意：实际密码需要使用 RSA 加密，这里简化处理
            # 生产环境需要集成 RSA 加密逻辑
            login_data = {
                "username": self._username,
                "password": self._password,
                "captcha_token": captcha_info.get("token", ""),
                "client_id": "XUNLEI_WEB_CLIENT_ID"
            }
            
            logger.debug("   步骤2: 执行登录...")
            login_response = session.post(login_url, json=login_data, timeout=10)
            login_response.raise_for_status()
            
            login_result = login_response.json()
            
            # 解析登录结果
            if login_result.get("code") == 0:
                auth_data = login_result.get("data", {})
                self._access_token = auth_data.get("access_token")
                refresh_token = auth_data.get("refresh_token")
                expires_in = auth_data.get("expires_in", 7200)
                
                self._token_expiry = current_time + expires_in
                self._session = session
                
                # 保存 refresh_token 用于后续刷新
                if refresh_token:
                    self._cookies['refresh_token'] = refresh_token
                
                logger.info(f"✅ 登录成功, 令牌有效期: {expires_in} 秒")
                return session
            else:
                error_msg = login_result.get("message", "登录失败")
                error_code = login_result.get("code")
                logger.error(f"❌ 登录失败 (code={error_code}): {error_msg}")
                
                # 提供友好的错误提示
                if error_code == 1100:
                    logger.error("   提示: 用户名或密码错误")
                elif error_code == 1101:
                    logger.error("   提示: 账号被锁定，请稍后重试")
                elif error_code == 1102:
                    logger.error("   提示: 验证码错误")
                
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 登录网络异常: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ 登录异常: {str(e)}", exc_info=True)
            return None
    
    def get_file_list(self, parent_id: str = "root", page: int = 1, limit: int = 50) -> Dict:
        """
        获取文件列表
        
        :param parent_id: 父文件夹ID,默认为根目录
        :param page: 页码
        :param limit: 每页数量
        :return: 文件列表信息
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/files/list"
            params = {
                "parent_id": parent_id,
                "page": page,
                "limit": limit
            }
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                files = data.get("data", {}).get("files", [])
                logger.info(f"✅ 获取文件列表成功: {len(files)} 个文件")
                return {
                    "code": 200,
                    "data": {
                        "files": files,
                        "total": data.get("data", {}).get("total", 0),
                        "page": page,
                        "limit": limit
                    }
                }
            else:
                error_msg = data.get("message", "获取文件列表失败")
                logger.error(f"❌ 获取文件列表失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 获取文件列表异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def add_offline_download(self, url: str, save_path: str = "/") -> Dict:
        """
        添加离线下载任务
        
        :param url: 下载链接(magnet/torrent/http等)
        :param save_path: 保存路径
        :return: 任务信息
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            api_url = f"{self._base_url}/offline/download"
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            download_data = {
                "url": url,
                "save_path": save_path
            }
            
            logger.info(f"📥 添加离线下载任务: {url[:50]}...")
            
            response = session.post(api_url, json=download_data, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                task_id = data.get("data", {}).get("task_id")
                logger.info(f"✅ 离线下载任务已添加: {task_id}")
                return {
                    "code": 200,
                    "message": "任务已添加",
                    "data": {
                        "task_id": task_id,
                        "url": url
                    }
                }
            else:
                error_msg = data.get("message", "添加任务失败")
                logger.error(f"❌ 添加离线下载任务失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 添加离线下载任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"添加失败: {str(e)}"}
    
    def get_download_tasks(self, status: str = "all", page: int = 1, limit: int = 20) -> Dict:
        """
        获取下载任务列表
        
        :param status: 任务状态(all/downloading/completed/failed)
        :param page: 页码
        :param limit: 每页数量
        :return: 任务列表
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/offline/tasks"
            params = {
                "status": status,
                "page": page,
                "limit": limit
            }
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                tasks = data.get("data", {}).get("tasks", [])
                logger.info(f"✅ 获取下载任务列表成功: {len(tasks)} 个任务")
                return {
                    "code": 200,
                    "data": {
                        "tasks": tasks,
                        "total": data.get("data", {}).get("total", 0)
                    }
                }
            else:
                error_msg = data.get("message", "获取任务列表失败")
                logger.error(f"❌ 获取任务列表失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 获取任务列表异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def download_file(self, file_id: str) -> Dict:
        """
        下载文件
        
        :param file_id: 文件ID
        :return: 下载结果
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/files/{file_id}/download"
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.post(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                download_url = data.get("data", {}).get("url", "")
                logger.info(f"✅ 获取下载链接成功: {file_id}")
                return {
                    "code": 200,
                    "data": {
                        "url": download_url
                    }
                }
            else:
                error_msg = data.get("message", "获取下载链接失败")
                logger.error(f"❌ 获取下载链接失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 下载文件异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"下载失败: {str(e)}"}
    
    def delete_file(self, file_id: str) -> Dict:
        """
        删除文件
        
        :param file_id: 文件ID
        :return: 删除结果
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/files/{file_id}"
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.delete(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                logger.info(f"✅ 删除文件成功: {file_id}")
                return {"code": 200, "message": "删除成功"}
            else:
                error_msg = data.get("message", "删除文件失败")
                logger.error(f"❌ 删除文件失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 删除文件异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"删除失败: {str(e)}"}
    
    def pause_task(self, task_id: str) -> Dict:
        """
        暂停下载任务
        
        :param task_id: 任务ID
        :return: 操作结果
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/offline/tasks/{task_id}/pause"
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.post(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                logger.info(f"✅ 暂停任务成功: {task_id}")
                return {"code": 200, "message": "任务已暂停"}
            else:
                error_msg = data.get("message", "暂停任务失败")
                logger.error(f"❌ 暂停任务失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 暂停任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"暂停失败: {str(e)}"}
    
    def resume_task(self, task_id: str) -> Dict:
        """
        恢复下载任务
        
        :param task_id: 任务ID
        :return: 操作结果
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/offline/tasks/{task_id}/resume"
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.post(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                logger.info(f"✅ 恢复任务成功: {task_id}")
                return {"code": 200, "message": "任务已恢复"}
            else:
                error_msg = data.get("message", "恢复任务失败")
                logger.error(f"❌ 恢复任务失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 恢复任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"恢复失败: {str(e)}"}
    
    def cancel_task(self, task_id: str) -> Dict:
        """
        取消下载任务
        
        :param task_id: 任务ID
        :return: 操作结果
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._base_url}/offline/tasks/{task_id}"
            
            headers = {}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            
            response = session.delete(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 0:
                logger.info(f"✅ 取消任务成功: {task_id}")
                return {"code": 200, "message": "任务已取消"}
            else:
                error_msg = data.get("message", "取消任务失败")
                logger.error(f"❌ 取消任务失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 取消任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"取消失败: {str(e)}"}
    
    def close(self):
        """关闭会话"""
        if self._session:
            self._session.close()
            logger.info("🔒 迅雷网盘会话已关闭")
    
    def login(self) -> Dict:
        """
        执行登录操作（公开接口）
        
        :return: 登录结果
        """
        try:
            session = self._get_authenticated_session()
            if session:
                return {
                    "code": 200,
                    "message": "登录成功",
                    "data": {
                        "username": self._username,
                        "token_expiry": int(self._token_expiry - time.time())
                    }
                }
            else:
                return {"code": 401, "message": "登录失败"}
        except Exception as e:
            logger.error(f"❌ 登录异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"登录异常: {str(e)}"}
