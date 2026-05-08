"""
Talebook API 客户端
封装所有与 Talebook 服务器的通信逻辑
"""
from typing import Dict, List, Optional
import time
import requests
from app.log import logger
from app.core.cache import TTLCache


class TalebookApiClient:
    """
    Talebook API 客户端
    
    功能:
    - 会话管理和自动登录
    - 书籍搜索、获取详情
    - 文件上传导入
    - 用户信息获取
    - 远端扫描触发和状态轮询
    """
    
    def __init__(self, server_url: str, username: str, password: str, verify_ssl: bool = True):
        """
        初始化 API 客户端
        
        :param server_url: Talebook 服务器地址
        :param username: 用户名
        :param password: 密码
        :param verify_ssl: 是否验证 SSL 证书
        """
        self._server_url = server_url.rstrip("/")
        self._username = username
        self._password = password
        self._verify_ssl = verify_ssl
        
        # 认证会话缓存（内存）
        self._session: Optional[requests.Session] = None
        self._session_expiry: float = 0
        self._session_timeout = 30 * 60  # 30 分钟
        
        # Cookie 持久化缓存（用于快速恢复会话）
        # 缓存键格式: talebook_session:{server_url}:{username}
        cache_key = f"talebook_session:{self._server_url}:{self._username}"
        self._session_cache = TTLCache(
            region="talebook_auth",
            maxsize=10,
            ttl=24 * 3600  # 24小时
        )
        
        # 尝试从缓存恢复会话
        self._restore_session_from_cache(cache_key)
    
    def _restore_session_from_cache(self, cache_key: str):
        """
        从缓存恢复会话（如果存在且有效）
        
        :param cache_key: 缓存键
        """
        try:
            cached_data = self._session_cache.get(cache_key)
            if cached_data:
                cookies = cached_data.get('cookies', {})
                expiry = cached_data.get('expiry', 0)
                current_time = time.time()
                
                # 检查缓存是否过期
                if current_time < expiry and cookies:
                    logger.info(f"🔄 从缓存恢复会话 (剩余 {int(expiry - current_time)} 秒)")
                    
                    # 创建新会话并恢复 Cookie
                    session = requests.Session()
                    session.headers.update({
                        'User-Agent': 'MoviePilot-Talebook-Plugin/1.0',
                        'Accept': 'application/json'
                    })
                    
                    # 禁用 SSL 验证(如果配置)
                    if not self._verify_ssl:
                        session.verify = False
                        import urllib3
                        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
                    
                    # 恢复 Cookie
                    for name, value in cookies.items():
                        session.cookies.set(name, value)
                    
                    # 验证会话是否仍然有效
                    if self._validate_session(session):
                        self._session = session
                        self._session_expiry = expiry
                        logger.info("✅ 缓存会话验证成功")
                        return
                    else:
                        logger.info("⚠️ 缓存会话已失效，将重新登录")
                        session.close()
        except Exception as e:
            logger.debug(f"恢复缓存会话失败: {str(e)}")
    
    def _save_session_to_cache(self, cache_key: str, session: requests.Session):
        """
        保存会话到缓存
        
        :param cache_key: 缓存键
        :param session: 会话对象
        """
        try:
            # 提取 Cookie
            cookies_dict = {}
            for cookie in session.cookies:
                cookies_dict[cookie.name] = cookie.value
            
            # 保存到缓存
            cache_data = {
                'cookies': cookies_dict,
                'expiry': self._session_expiry
            }
            self._session_cache.set(cache_key, cache_data)
            logger.debug(f"💾 会话已缓存 (有效期: {self._session_timeout} 秒)")
        except Exception as e:
            logger.warning(f"保存会话到缓存失败: {str(e)}")
    
    def _validate_session(self, session: requests.Session) -> bool:
        """
        验证会话是否仍然有效
        
        :param session: 会话对象
        :return: True 如果会话有效
        """
        try:
            # 尝试获取用户信息来验证会话
            user_info_url = f"{self._server_url}/api/user/info"
            response = session.get(user_info_url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("err") == "ok"
            return False
        except Exception:
            return False
    
    def _get_authenticated_session(self) -> Optional[requests.Session]:
        """
        获取已认证的会话 (带缓存和自动续期)
        
        :return: 已认证的 requests.Session 对象,失败返回 None
        """
        if not self._server_url:
            logger.warning("Talebook 服务器地址未配置")
            return None
        
        if not self._username or not self._password:
            logger.error("❌ 未配置用户名或密码")
            return None
        
        current_time = time.time()
        
        # 检查是否有有效的缓存会话
        if self._session and current_time < self._session_expiry:
            logger.debug(f"✅ 使用内存中的认证会话 (剩余 {int(self._session_expiry - current_time)} 秒)")
            return self._session
        else:
            if self._session:
                logger.info("⏰ 内存会话已过期,将重新登录")
                try:
                    self._session.close()
                except Exception:
                    pass
                self._session = None
                self._session_expiry = 0
        
        # 创建新会话并登录
        logger.info(f"🔐 正在登录 Talebook: {self._username}@{self._server_url}")
        
        try:
            session = requests.Session()
            
            # 设置请求头
            session.headers.update({
                'User-Agent': 'MoviePilot-Talebook-Plugin/1.0',
                'Accept': 'application/json'
                # 注意: 不设置 Content-Type,让 requests 根据请求类型自动设置
            })
            
            # 禁用 SSL 验证(如果配置)
            if not self._verify_ssl:
                logger.warning("⚠️ 已禁用 SSL 验证(仅用于自签名证书)")
                session.verify = False
                import urllib3
                urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            # 登录
            login_url = f"{self._server_url}/api/user/sign_in"
            login_data = {
                "username": self._username,
                "password": self._password
            }
            
            logger.info(f"   登录 URL: {login_url}")
            logger.info(f"   用户名: {self._username}")
            login_response = session.post(login_url, data=login_data, timeout=30)
            login_response.raise_for_status()
            
            login_result = login_response.json()
            logger.debug(f"登录响应: {login_result}")
            if login_result.get("err") != "ok":
                error_msg = login_result.get('msg', '未知错误')
                logger.error(f"❌ 登录失败: {error_msg}")
                logger.error(f"   服务器: {self._server_url}")
                logger.error(f"   用户名: {self._username}")
                session.close()
                return None
            
            # 保存会话和过期时间
            self._session = session
            self._session_expiry = current_time + self._session_timeout
            
            # 保存到持久化缓存
            cache_key = f"talebook_session:{self._server_url}:{self._username}"
            self._save_session_to_cache(cache_key, session)
            
            logger.info(f"✅ 登录成功! 会话有效期: {self._session_timeout} 秒")
            return session
            
        except requests.exceptions.Timeout:
            logger.error(f"⏰ 登录超时: {self._server_url}")
            logger.error(f"   提示: 请检查网络连接或服务器是否可访问")
            return None
        except requests.exceptions.ConnectionError as e:
            logger.error(f"🔌 连接失败: {self._server_url}")
            logger.error(f"   错误详情: {str(e)}")
            return None
        except requests.exceptions.SSLError as e:
            logger.error(f"🔒 SSL 证书错误: {self._server_url}")
            logger.error(f"   错误详情: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ 登录异常: {str(e)}", exc_info=True)
            return None
    
    def clear_session(self):
        """清除认证会话（包括内存和缓存）"""
        # 清除内存会话
        if self._session:
            try:
                self._session.close()
            except Exception:
                pass
            self._session = None
            self._session_expiry = 0
        
        # 清除持久化缓存
        try:
            cache_key = f"talebook_session:{self._server_url}:{self._username}"
            self._session_cache.delete(cache_key)
            logger.debug("🗑️ 持久化缓存已清除")
        except Exception:
            pass
        
        logger.info("🗑️ 认证会话已清除")
    
    def close(self):
        """关闭客户端,释放资源"""
        self.clear_session()
    
    def get_book_detail(self, book_id: int) -> Dict:
        """
        获取书籍详细信息
        
        :param book_id: 书籍 ID
        :return: 书籍详细信息字典
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            book_info_url = f"{self._server_url}/api/book/{book_id}"
            book_response = session.get(book_info_url, timeout=10)
            book_response.raise_for_status()
            
            data = book_response.json()
            if data.get("err") == "ok":
                book = data.get("book", {})
                logger.info(f"获取书籍详情成功: {book.get('title')}")
                return {"code": 200, "data": book}
            else:
                logger.error(f"获取书籍详情失败: {data.get('msg')}")
                return {"code": 404, "message": data.get("msg", "书籍不存在")}
                
        except Exception as e:
            logger.error(f"获取书籍详情失败: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def search_books(self, keyword: str) -> List[dict]:
        """
        搜索电子书
        
        :param keyword: 搜索关键词
        :return: 书籍列表
        """
        if not self._server_url:
            logger.warning("Talebook 服务器地址未配置")
            return []
        
        try:
            session = self._get_authenticated_session()
            if not session:
                logger.error("登录失败,无法执行搜索")
                return []
            
            url = f"{self._server_url}/api/search"
            params = {"name": keyword}
            
            response = session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                books = data.get("books", [])
                logger.info(f"搜索成功: {keyword}, 找到 {len(books)} 本书")
                return books
            else:
                logger.error(f"搜索失败: {data.get('msg')}")
                return []
                
        except Exception as e:
            logger.error(f"搜索电子书失败: {str(e)}")
            return []
    
    def get_book_refer_meta(self, book_id: int) -> Dict:
        """
        获取书籍的外部元数据(从豆瓣等源)
        
        :param book_id: 书籍 ID
        :return: 外部元数据列表
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._server_url}/api/book/{book_id}/refer"
            response = session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                books = data.get("books", [])
                logger.info(f"获取外部元数据成功: {len(books)} 条")
                return {"code": 200, "data": books}
            else:
                logger.error(f"获取外部元数据失败: {data.get('msg')}")
                return {"code": 400, "message": data.get("msg", "获取失败")}
                
        except Exception as e:
            logger.error(f"获取外部元数据失败: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def apply_book_refer_meta(self, book_id: int, provider_key: str, provider_value: str, 
                              only_meta: bool = False, only_cover: bool = False) -> Dict:
        """
        应用外部元数据到书籍
        
        :param book_id: 书籍 ID
        :param provider_key: 元数据来源 (如 "douban")
        :param provider_value: 元数据值 (如豆瓣 ID)
        :param only_meta: 仅应用元数据
        :param only_cover: 仅应用封面
        :return: 操作结果
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._server_url}/api/book/{book_id}/refer"
            payload = {
                "provider_key": provider_key,
                "provider_value": provider_value
            }
            
            if only_meta:
                payload["only_meta"] = "yes"
            if only_cover:
                payload["only_cover"] = "yes"
            
            response = session.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                logger.info(f"应用外部元数据成功: book_id={book_id}")
                return {"code": 200, "message": "应用成功"}
            else:
                logger.error(f"应用外部元数据失败: {data.get('msg')}")
                return {"code": 400, "message": data.get("msg", "应用失败")}
                
        except Exception as e:
            logger.error(f"应用外部元数据失败: {str(e)}")
            return {"code": 500, "message": f"应用失败: {str(e)}"}
    
    def get_related_books(self, book_id: int, limit: int = 10) -> List[dict]:
        """
        获取相关书籍(基于作者、标签等)
        
        :param book_id: 书籍 ID
        :param limit: 返回数量限制
        :return: 相关书籍列表
        """
        try:
            # 先获取书籍详情
            detail_result = self.get_book_detail(book_id)
            if detail_result.get("code") != 200:
                return []
            
            book = detail_result.get("data", {})
            authors = book.get("authors", [])
            tags = book.get("tags", [])
            
            if not authors and not tags:
                logger.warning(f"书籍 {book_id} 没有作者或标签信息")
                return []
            
            related_books = []
            seen_ids = {book_id}
            
            # 根据作者查找相关书籍
            for author in authors[:2]:  # 最多取前2个作者
                if author:
                    author_books = self._search_by_author(author, limit // 2)
                    for b in author_books:
                        if b.get("id") not in seen_ids:
                            related_books.append(b)
                            seen_ids.add(b.get("id"))
                    if len(related_books) >= limit:
                        break
            
            # 如果还不够,根据标签查找
            if len(related_books) < limit:
                for tag in tags[:3]:  # 最多取前3个标签
                    if tag:
                        tag_books = self._search_by_tag(tag, limit - len(related_books))
                        for b in tag_books:
                            if b.get("id") not in seen_ids:
                                related_books.append(b)
                                seen_ids.add(b.get("id"))
                        if len(related_books) >= limit:
                            break
            
            logger.info(f"获取相关书籍成功: {len(related_books)} 本")
            return related_books[:limit]
            
        except Exception as e:
            logger.error(f"获取相关书籍失败: {str(e)}")
            return []
    
    def _search_by_author(self, author: str, limit: int = 5) -> List[dict]:
        """
        根据作者搜索书籍
        
        :param author: 作者名
        :param limit: 数量限制
        :return: 书籍列表
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return []
            
            # 使用作者 API
            url = f"{self._server_url}/api/author/{author}"
            params = {"num": limit}
            
            response = session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                return data.get("books", [])
            return []
        except Exception as e:
            logger.debug(f"按作者搜索失败: {str(e)}")
            return []
    
    def _search_by_tag(self, tag: str, limit: int = 5) -> List[dict]:
        """
        根据标签搜索书籍
        
        :param tag: 标签名
        :param limit: 数量限制
        :return: 书籍列表
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return []
            
            # 使用标签 API
            url = f"{self._server_url}/api/tag/{tag}"
            params = {"num": limit}
            
            response = session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                return data.get("books", [])
            return []
        except Exception as e:
            logger.debug(f"按标签搜索失败: {str(e)}")
            return []
    
    def get_meta_list(self, meta_type: str, show_all: bool = False) -> Dict:
        """
        获取元数据列表(标签/作者/丛书等)
        
        :param meta_type: 元数据类型 (tag/author/series/rating/publisher/language)
        :param show_all: 是否显示所有条目
        :return: 元数据列表
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            url = f"{self._server_url}/api/{meta_type}"
            params = {}
            if show_all:
                params["show"] = "all"
            
            response = session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.debug(f"Talebook API 原始响应: {data}")
            
            # 判断是否成功: 有 err='ok' 或者有 items 字段
            is_success = (data.get("err") == "ok") or ("items" in data and isinstance(data.get("items"), list))
            
            if is_success:
                items = data.get("items", [])
                total = data.get("total", len(items))
                logger.info(f"获取{meta_type}列表成功: {total} 条")
                return {"code": 200, "data": items, "total": total}
            else:
                error_msg = data.get("msg") or data.get("err") or "未知错误"
                logger.error(f"获取{meta_type}列表失败: err={data.get('err')}, msg={error_msg}, 完整响应: {data}")
                return {"code": 400, "message": f"获取失败: {error_msg}"}
                
        except Exception as e:
            logger.error(f"获取{meta_type}列表失败: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def get_meta_books(self, meta_type: str, name: str, page: int = 1, num: int = 20) -> Dict:
        """
        获取指定元数据的书籍列表
        
        :param meta_type: 元数据类型 (tag/author/series/rating/publisher/language)
        :param name: 元数据名称
        :param page: 页码
        :param num: 每页数量
        :return: 书籍列表
        """
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            # URL 编码名称
            from urllib.parse import quote
            encoded_name = quote(name, safe='')
            
            url = f"{self._server_url}/api/{meta_type}/{encoded_name}"
            params = {"page": page, "num": num}
            
            response = session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.debug(f"Talebook API 原始响应: {data}")
            
            # 判断是否成功: 有 err='ok' 或者有 books 字段
            is_success = (data.get("err") == "ok") or ("books" in data and isinstance(data.get("books"), list))
            
            if is_success:
                books = data.get("books", [])
                total = data.get("total", len(books))
                title = data.get("title", "")
                logger.info(f"获取{meta_type}='{name}'的书籍成功: {total} 本")
                return {"code": 200, "data": books, "total": total, "title": title}
            else:
                error_msg = data.get("msg") or data.get("err") or "未知错误"
                logger.error(f"获取{meta_type}='{name}'的书籍失败: err={data.get('err')}, msg={error_msg}, 完整响应: {data}")
                return {"code": 400, "message": f"获取失败: {error_msg}"}
                
        except Exception as e:
            logger.error(f"获取{meta_type}='{name}'的书籍失败: {str(e)}")
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def get_recent_books(self, limit: int = 20) -> List[dict]:
        """
        获取最近添加的书籍
        
        :param limit: 数量限制
        :return: 书籍列表
        """
        if not self._server_url:
            return []
        
        try:
            session = self._get_authenticated_session()
            if not session:
                logger.error("登录失败,无法获取最近书籍")
                return []
            
            url = f"{self._server_url}/api/recent"
            response = session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                books = data.get("books", [])
                return books[:limit]
            return []
            
        except Exception as e:
            logger.error(f"获取最近书籍失败: {str(e)}")
            return []
    
    def get_hot_books(self, limit: int = 20) -> List[dict]:
        """
        获取热门书籍
        
        :param limit: 数量限制
        :return: 书籍列表
        """
        if not self._server_url:
            return []
        
        try:
            session = self._get_authenticated_session()
            if not session:
                logger.error("登录失败,无法获取热门书籍")
                return []
            
            url = f"{self._server_url}/api/hot"
            response = session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                books = data.get("books", [])
                return books[:limit]
            return []
            
        except Exception as e:
            logger.error(f"获取热门书籍失败: {str(e)}")
            return []
    
    def import_book_to_talebook(self, file_path: str) -> bool:
        """
        导入本地小说文件到 Talebook 书库
        
        :param file_path: 本地小说文件路径
        :return: 是否成功
        """
        if not self._server_url:
            logger.warning("Talebook 服务器地址未配置")
            return False
        
        try:
            from pathlib import Path
            file = Path(file_path)
            
            if not file.exists():
                logger.error(f"文件不存在: {file_path}")
                return False
            
            session = self._get_authenticated_session()
            if not session:
                logger.error("❌ 登录失败,无法导入文件")
                return False
            
            upload_url = f"{self._server_url}/api/book/upload"
            with open(file_path, 'rb') as f:
                files = {
                    'ebook': (file.name, f, self._get_mime_type(file.suffix))
                }
                response = session.post(upload_url, files=files, timeout=120)
                response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                book_id = data.get("book_id")
                logger.info(f"✅ 导入成功: {file.name} (ID: {book_id})")
                return True
            else:
                error_msg = data.get('msg', '未知错误')
                logger.error(f"❌ 导入失败: {file.name} - {error_msg}")
                return False
                
        except requests.exceptions.Timeout:
            logger.error(f"⏰ 上传超时: {file_path}")
            return False
        except requests.exceptions.ConnectionError:
            logger.error(f"🔌 连接失败: {self._server_url}")
            return False
        except Exception as e:
            logger.error(f"❌ 导入异常: {file_path} - {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def _get_mime_type(suffix: str) -> str:
        """
        根据文件扩展名获取 MIME 类型
        
        :param suffix: 文件扩展名 (如 .epub)
        :return: MIME 类型字符串
        """
        mime_types = {
            '.epub': 'application/epub+zip',
            '.mobi': 'application/x-mobipocket-ebook',
            '.pdf': 'application/pdf',
            '.azw3': 'application/vnd.amazon.ebook',
            '.txt': 'text/plain'
        }
        return mime_types.get(suffix.lower(), 'application/octet-stream')
    
    def get_user_info(self) -> Dict:
        """
        获取当前用户信息
        
        :return: 用户信息字典
        """
        if not self._server_url:
            return {"code": 500, "message": "服务器地址未配置"}
        
        try:
            session = self._get_authenticated_session()
            if not session:
                return {"code": 500, "message": "登录失败"}
            
            user_info_url = f"{self._server_url}/api/user/info"
            response = session.get(user_info_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("err") == "ok":
                user_info = data.get("user", {})
                logger.info(f"✅ 获取用户信息成功: {user_info.get('nickname')}")
                return {
                    "code": 200,
                    "message": "获取成功",
                    "data": {
                        "username": user_info.get("username"),
                        "nickname": user_info.get("nickname"),
                        "email": user_info.get("email"),
                        "is_admin": user_info.get("is_admin", False),
                        "avatar": user_info.get("avatar"),
                        "read_books_count": user_info.get("read_books_count", 0),
                        "push_books_count": user_info.get("push_books_count", 0)
                    }
                }
            else:
                error_msg = data.get('msg', '未知错误')
                logger.error(f"❌ 获取用户信息失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 获取用户信息异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def set_book_favorite(self, book_id: int, favorite: bool = True) -> Dict:
        """
        设置书籍收藏状态
        
        :param book_id: 书籍 ID
        :param favorite: True=收藏, False=取消收藏
        :return: 操作结果
        """
        logger.info(f"{'🔖' if favorite else '❌'} [{'收藏' if favorite else '取消收藏'}] 书籍 ID: {book_id}")
        
        if not self._server_url:
            logger.error("❌ 服务器地址未配置")
            return {"code": 400, "message": "服务器地址未配置"}
        
        try:
            # 获取认证会话
            session = self._get_authenticated_session()
            if not session:
                logger.error("❌ 登录失败，无法设置收藏")
                return {"code": 500, "message": "登录失败,无法设置收藏"}
            
            # 调用 API
            url = f"{self._server_url}/api/book/{book_id}/favorite"
            logger.info(f"   URL: {url}")
            logger.info(f"   请求体: {{'favorite': {favorite}}}")
            
            response = session.post(
                url,
                json={"favorite": favorite},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("err") == "ok":
                logger.info(f"✅ {'收藏成功' if favorite else '取消收藏成功'}")
                return {
                    "code": 200,
                    "message": "收藏成功" if favorite else "取消收藏成功",
                    "data": {
                        "book_id": book_id,
                        "favorite": favorite
                    }
                }
            else:
                error_msg = data.get('msg', '未知错误')
                logger.error(f"❌ 操作失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 设置收藏状态异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"操作失败: {str(e)}"}
    
    def set_book_read_state(self, book_id: int, read_state: int) -> Dict:
        """
        设置书籍阅读状态
        
        :param book_id: 书籍 ID
        :param read_state: 阅读状态 (0=未读, 1=在读, 2=已读)
        :return: 操作结果
        """
        state_names = {0: "未读", 1: "在读", 2: "已读"}
        state_name = state_names.get(read_state, f"未知({read_state})")
        
        logger.info(f"📖 [设置阅读状态] 书籍 ID: {book_id}, 状态: {state_name}")
        
        if read_state not in [0, 1, 2]:
            logger.error(f"❌ 无效的阅读状态: {read_state} (必须是 0/1/2)")
            return {"code": 400, "message": f"无效的阅读状态: {read_state} (必须是 0/1/2)"}
        
        if not self._server_url:
            logger.error("❌ 服务器地址未配置")
            return {"code": 400, "message": "服务器地址未配置"}
        
        try:
            # 获取认证会话
            session = self._get_authenticated_session()
            if not session:
                logger.error("❌ 登录失败，无法设置阅读状态")
                return {"code": 500, "message": "登录失败,无法设置阅读状态"}
            
            # 调用 API
            url = f"{self._server_url}/api/book/{book_id}/readstate"
            logger.info(f"   URL: {url}")
            logger.info(f"   请求体: {{'read_state': {read_state}}}")
            
            response = session.post(
                url,
                json={"read_state": read_state},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("err") == "ok":
                logger.info(f"✅ 设置阅读状态成功: {state_name}")
                return {
                    "code": 200,
                    "message": f"设置阅读状态成功: {state_name}",
                    "data": {
                        "book_id": book_id,
                        "read_state": read_state,
                        "state_name": state_name
                    }
                }
            else:
                error_msg = data.get('msg', '未知错误')
                logger.error(f"❌ 操作失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 设置阅读状态异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"操作失败: {str(e)}"}
    
    def get_reading_books(self, limit: int = 20) -> Dict:
        """
        获取正在阅读的书籍列表
        
        :param limit: 返回数量限制（默认20，范围1-100）
        :return: 书籍列表
        """
        logger.info(f"📚 [获取在读列表] 限制数量: {limit}")
        
        if not self._server_url:
            logger.error("❌ 服务器地址未配置")
            return {"code": 400, "message": "服务器地址未配置"}
        
        try:
            # 获取认证会话
            session = self._get_authenticated_session()
            if not session:
                logger.error("❌ 登录失败，无法获取在读列表")
                return {"code": 500, "message": "登录失败,无法获取在读列表"}
            
            # 调用 API
            url = f"{self._server_url}/api/reading"
            logger.info(f"   URL: {url}")
            logger.info(f"   参数: limit={limit}")
            
            response = session.get(url, params={"limit": limit}, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("err") == "ok":
                books = data.get("books", [])
                logger.info(f"✅ 获取在读列表成功: {len(books)} 本书")
                return {
                    "code": 200,
                    "message": "获取成功",
                    "data": {
                        "count": len(books),
                        "books": books
                    }
                }
            else:
                error_msg = data.get('msg', '未知错误')
                logger.error(f"❌ 获取失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 获取在读列表异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def get_favorite_books(self, limit: int = 50) -> Dict:
        """
        获取收藏的书籍列表
        
        :param limit: 返回数量限制（默认50，范围1-100）
        :return: 书籍列表
        """
        logger.info(f"🔖 [获取收藏列表] 限制数量: {limit}")
        
        if not self._server_url:
            logger.error("❌ 服务器地址未配置")
            return {"code": 400, "message": "服务器地址未配置"}
        
        try:
            # 获取认证会话
            session = self._get_authenticated_session()
            if not session:
                logger.error("❌ 登录失败，无法获取收藏列表")
                return {"code": 500, "message": "登录失败,无法获取收藏列表"}
            
            # 调用 API
            url = f"{self._server_url}/api/favorites"
            logger.info(f"   URL: {url}")
            logger.info(f"   参数: limit={limit}")
            
            response = session.get(url, params={"limit": limit}, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("err") == "ok":
                books = data.get("books", [])
                logger.info(f"✅ 获取收藏列表成功: {len(books)} 本书")
                return {
                    "code": 200,
                    "message": "获取成功",
                    "data": {
                        "count": len(books),
                        "books": books
                    }
                }
            else:
                error_msg = data.get('msg', '未知错误')
                logger.error(f"❌ 获取失败: {error_msg}")
                return {"code": 400, "message": error_msg}
                
        except Exception as e:
            logger.error(f"❌ 获取收藏列表异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
    
    def scan_and_import_remote(self) -> Dict:
        """
        触发远端 Talebook 扫描并导入
        
        采用完整流程:
        1. 触发远端扫描 (POST /api/admin/scan/run)
        2. 轮询扫描状态直到完成 (GET /api/admin/scan/status)
        3. 启动导入任务 (POST /api/admin/import/run)
        4. 轮询导入状态直到完成 (GET /api/admin/import/status)
        
        :return: 扫描和导入结果
        """
        import time as time_module
        start_time = time_module.time()
        
        logger.info("=" * 80)
        logger.info("🚀 [Talebook] 开始扫描导入流程")
        logger.info(f"   服务器: {self._server_url}")
        logger.info(f"   用户名: {self._username}")
        logger.info(f"   SSL验证: {self._verify_ssl}")
        logger.info(f"   会话超时: {self._session_timeout}秒")
        logger.info(f"   当前会话: {'有' if self._session else '无'}")
        if self._session:
            remaining = int(self._session_expiry - time_module.time()) if self._session_expiry > time_module.time() else 0
            logger.info(f"   会话剩余: {remaining}秒")
        logger.info("=" * 80)
        
        if not self._server_url:
            logger.error("❌ 服务器地址未配置")
            return {"code": 400, "message": "服务器地址未配置"}

        try:
            # 获取认证会话
            logger.info("🔐 [步骤 0] 获取认证会话...")
            auth_start = time_module.time()
            session = self._get_authenticated_session()
            auth_elapsed = time_module.time() - auth_start
            
            if not session:
                logger.error(f"❌ 登录失败 (耗时: {auth_elapsed:.2f}秒)，无法执行扫描")
                return {"code": 500, "message": "登录失败,无法执行扫描"}
            
            logger.info(f"✅ 认证成功 (耗时: {auth_elapsed:.2f}秒)")
            logger.debug(f"   Session ID: {id(session)}")
            logger.debug(f"   Cookies: {list(session.cookies.keys())}")

            # ========== 阶段 1: 触发扫描 ==========
            phase1_start = time_module.time()
            run_url = f"{self._server_url}/api/admin/scan/run"
            logger.info(f"\n📤 [阶段 1/4] 触发远端 Talebook 扫描")
            logger.info(f"   URL: {run_url}")
            logger.info(f"   方法: POST")
            logger.info(f"   超时设置: 15秒")
            logger.debug(f"   Session cookies: {dict(session.cookies)}")
            
            logger.info("   📤 正在发送 POST 请求...")
            request_start = time_module.time()
            run_resp = session.post(run_url, timeout=15)
            request_elapsed = time_module.time() - request_start
            logger.info(f"   📥 收到响应 (耗时: {request_elapsed:.2f}秒)")
            logger.debug(f"   响应状态码: {run_resp.status_code}")
            logger.debug(f"   响应头: {dict(run_resp.headers)}")
            
            run_resp.raise_for_status()
            run_data = run_resp.json()
            logger.debug(f"   响应数据: {run_data}")

            if run_data.get("err") != "ok":
                logger.error(f"❌ 启动远端扫描失败: {run_data.get('msg', run_data)}")
                return {"code": 500, "message": f"启动远端扫描失败: {run_data.get('msg', run_data)}"}
            
            phase1_elapsed = time_module.time() - phase1_start
            logger.info(f"✅ 扫描任务已提交: {run_data.get('msg', '未知')} (耗时: {phase1_elapsed:.2f}秒)")

            # ========== 阶段 2: 轮询扫描状态 ==========
            phase2_start = time_module.time()
            status_url = f"{self._server_url}/api/admin/scan/status"
            max_attempts = 30  # 减少最大尝试次数 (30秒)
            
            logger.info(f"\n🔎 [阶段 2/4] 轮询扫描任务状态")
            logger.info(f"   URL: {status_url}")
            logger.info(f"   方法: GET")
            logger.info(f"   最大尝试次数: {max_attempts}")
            logger.info(f"   轮询间隔: 1秒")
            
            attempt = 0
            scan_completed = False
            scan_status_data = None

            while attempt < max_attempts:
                attempt += 1
                poll_start = time_module.time()
                time.sleep(1)  # 减少轮询间隔到 1 秒
                
                try:
                    logger.debug(f"   [{attempt}/{max_attempts}] 发送请求...")
                    sresp = session.get(status_url, timeout=10)
                    sresp.raise_for_status()
                    scan_status_data = sresp.json()
                    poll_elapsed = time_module.time() - poll_start
                    
                    # 解析扫描状态
                    scanning = scan_status_data.get("scanning", True)
                    importing = scan_status_data.get("importing", False)
                    status_info = scan_status_data.get("status", {})
                    summary = scan_status_data.get("summary", {})
                    
                    total_files = status_info.get("total", 0)
                    new_files = status_info.get("new", 0)
                    exist_files = status_info.get("exist", 0)
                    ready_files = status_info.get("ready", 0)
                    imported_files = status_info.get("imported", 0)
                    
                    # 每次轮询都打印进度（因为间隔短）
                    logger.debug(
                        f"   [{attempt}/{max_attempts}] ✅ 收到响应 ({poll_elapsed:.2f}s) | "
                        f"扫描:{'进行中' if scanning else '结束'}, "
                        f"总数:{total_files}, 新增:{new_files}, 存在:{exist_files}, 就绪:{ready_files}"
                    )
                    
                    # 检查是否完成：scanning=false 且 importing=false
                    if not scanning and not importing:
                        phase2_elapsed = time_module.time() - phase2_start
                        logger.info(f"\n✅ [阶段 2 完成] 扫描已完成 (尝试 {attempt} 次, 耗时 {phase2_elapsed:.2f}秒)")
                        scan_completed = True
                        break
                        
                except Exception as e:
                    logger.warning(f"   [{attempt}/{max_attempts}] ⚠️  轮询错误: {e}")
            
            if not scan_completed:
                logger.warning("⚠️  扫描超时，可能仍在后台执行")
                return {
                    "code": 200,
                    "message": "扫描任务已触发但超时，请稍后查看服务器状态",
                    "data": {"scan_timeout": True}
                }
            
            # 获取扫描统计信息
            status_info = scan_status_data.get("status", {})
            summary = scan_status_data.get("summary", {})
            
            total_files = status_info.get("total", 0)
            ready_files = status_info.get("ready", 0)
            imported_files_before = status_info.get("imported", 0)
            
            logger.info(f"\n📊 [扫描结果] 总数={total_files}, 就绪={ready_files}, 已导入={imported_files_before}")
            
            # 如果没有就绪文件，直接返回
            if ready_files == 0:
                total_elapsed = time_module.time() - start_time
                logger.info(f"\n{'=' * 80}")
                logger.info(f"✅ [流程完成] 扫描完成，但没有发现新文件 (总耗时: {total_elapsed:.2f}秒)")
                logger.info(f"{'=' * 80}\n")
                return {
                    "code": 200,
                    "message": "扫描完成，但没有发现新文件",
                    "data": {
                        "total_files": total_files,
                        "ready_files": 0,
                        "imported_count": 0
                    }
                }
            
            # ========== 阶段 3: 启动导入 ==========
            phase3_start = time_module.time()
            import_run_url = f"{self._server_url}/api/admin/import/run"
            logger.info(f"\n🚀 [阶段 3/4] 启动导入任务")
            logger.info(f"   URL: {import_run_url}")
            logger.info(f"   方法: POST")
            logger.info(f"   请求体: {{'hashlist': 'all'}}")
            
            logger.debug("   发送请求...")
            import_resp = session.post(
                import_run_url,
                json={"hashlist": "all"},  # 导入所有就绪文件
                timeout=15
            )
            logger.debug(f"   响应状态码: {import_resp.status_code}")
            
            import_resp.raise_for_status()
            import_data = import_resp.json()
            logger.debug(f"   响应数据: {import_data}")
            
            if import_data.get("err") != "ok":
                logger.error(f"❌ 启动导入失败: {import_data.get('msg', import_data)}")
                return {"code": 500, "message": f"启动导入失败: {import_data.get('msg', import_data)}"}
            
            phase3_elapsed = time_module.time() - phase3_start
            logger.info(f"✅ 导入任务已启动: {import_data.get('msg', '未知')} (耗时: {phase3_elapsed:.2f}秒)")
            
            # ========== 阶段 4: 轮询导入状态 ==========
            phase4_start = time_module.time()
            import_status_url = f"{self._server_url}/api/admin/import/status"
            import_max_attempts = 30  # 减少最大尝试次数 (30秒)
            
            logger.info(f"\n⏳ [阶段 4/4] 轮询导入任务状态")
            logger.info(f"   URL: {import_status_url}")
            logger.info(f"   方法: GET")
            logger.info(f"   最大尝试次数: {import_max_attempts}")
            logger.info(f"   轮询间隔: 1秒")
            
            import_attempt = 0
            import_completed = False
            final_import_status = None
            
            while import_attempt < import_max_attempts:
                import_attempt += 1
                poll_start = time_module.time()
                time.sleep(1)  # 减少轮询间隔到 1 秒
                
                try:
                    logger.debug(f"   [{import_attempt}/{import_max_attempts}] 发送请求...")
                    istatus_resp = session.get(import_status_url, timeout=10)
                    istatus_resp.raise_for_status()
                    final_import_status = istatus_resp.json()
                    poll_elapsed = time_module.time() - poll_start
                    
                    # 解析导入状态
                    scanning = final_import_status.get("scanning", False)
                    importing = final_import_status.get("importing", True)
                    istatus_info = final_import_status.get("status", {})
                    
                    i_total = istatus_info.get("total", 0)
                    i_imported = istatus_info.get("imported", 0)
                    
                    # 每次轮询都打印进度
                    logger.debug(
                        f"   [{import_attempt}/{import_max_attempts}] ✅ 收到响应 ({poll_elapsed:.2f}s) | "
                        f"导入中... 总数:{i_total}, 已导入:{i_imported}"
                    )
                    
                    # 检查是否完成
                    if not scanning and not importing:
                        phase4_elapsed = time_module.time() - phase4_start
                        logger.info(f"\n✅ [阶段 4 完成] 导入已完成 (尝试 {import_attempt} 次, 耗时 {phase4_elapsed:.2f}秒)")
                        import_completed = True
                        break
                        
                except Exception as e:
                    logger.warning(f"   [{import_attempt}/{import_max_attempts}] ⚠️  轮询错误: {e}")
            
            if not import_completed:
                total_elapsed = time_module.time() - start_time
                logger.warning(f"\n⚠️  [流程警告] 导入超时，可能仍在后台执行 (总耗时: {total_elapsed:.2f}秒)")
                return {
                    "code": 200,
                    "message": "导入任务已触发但超时，请稍后查看服务器状态",
                    "data": {"import_timeout": True}
                }
            
            # 获取最终统计
            istatus_info = final_import_status.get("status", {})
            isummary = final_import_status.get("summary", {})
            
            final_total = istatus_info.get("total", 0)
            final_imported = istatus_info.get("imported", 0)
            final_new = istatus_info.get("new", 0)
            final_exist = istatus_info.get("exist", 0)
            
            total_elapsed = time_module.time() - start_time
            
            logger.info(f"\n📊 [最终统计]")
            logger.info(f"   总数: {final_total}")
            logger.info(f"   新增: {final_new}")
            logger.info(f"   存在: {final_exist}")
            logger.info(f"   已导入: {final_imported}")
            logger.info(f"   总耗时: {total_elapsed:.2f}秒")
            
            logger.info(f"\n{'=' * 80}")
            logger.info(f"✅ [流程完成] 扫描和导入全部完成 (总耗时: {total_elapsed:.2f}秒)")
            logger.info(f"{'=' * 80}\n")
            
            return {
                "code": 200,
                "message": "扫描和导入完成",
                "data": {
                    "total_files": final_total,
                    "new_files": final_new,
                    "exist_files": final_exist,
                    "imported_count": final_imported,
                    "scan_status": scan_status_data,
                    "import_status": final_import_status
                }
            }

        except Exception as e:
            total_elapsed = time_module.time() - start_time
            logger.error(f"\n{'=' * 80}")
            logger.error(f"❌ [流程失败] 扫描导入流程异常 (耗时: {total_elapsed:.2f}秒)")
            logger.error(f"   错误类型: {type(e).__name__}")
            logger.error(f"   错误消息: {str(e)}")
            logger.error(f"{'=' * 80}\n")
            logger.error(f"堆栈跟踪:", exc_info=True)
            return {"code": 500, "message": f"扫描导入失败: {str(e)}"}
    
    def get_book_cover(self, book_id: int) -> Optional[bytes]:
        """
        获取书籍封面图片
        
        :param book_id: 书籍 ID
        :return: 图片二进制数据(bytes) 或 None
        """
        try:
            session = self._ensure_session()
            if not session:
                logger.error("无法建立会话")
                return None
            
            # 构建封面 URL
            url = f"{self._server_url}/get/cover/{book_id}.jpg"
            logger.debug(f"获取封面图片: {url}")
            
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            logger.debug(f"成功获取封面图片: size={len(response.content)} bytes")
            return response.content
            
        except Exception as e:
            logger.error(f"获取封面图片异常: book_id={book_id}, error={str(e)}")
            return None
    
    def get_book_thumb(self, book_id: int, width: int = 240, height: int = 320) -> Optional[bytes]:
        """
        获取书籍缩略图
        
        :param book_id: 书籍 ID
        :param width: 缩略图宽度
        :param height: 缩略图高度
        :return: 图片二进制数据(bytes) 或 None
        """
        try:
            session = self._ensure_session()
            if not session:
                logger.error("无法建立会话")
                return None
            
            # 构建缩略图 URL
            url = f"{self._server_url}/get/thumb_{width}_{height}/{book_id}.jpg"
            logger.debug(f"获取缩略图: {url}")
            
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            logger.debug(f"成功获取缩略图: size={len(response.content)} bytes")
            return response.content
            
        except Exception as e:
            logger.error(f"获取缩略图异常: book_id={book_id}, size={width}x{height}, error={str(e)}")
            return None
