"""
迅雷网盘 API 客户端
封装所有与迅雷网盘的通信逻辑
"""
from typing import Dict, List, Optional
import hashlib
import re
import time

import requests
from playwright.sync_api import sync_playwright

from app.core.config import settings
from app.log import logger


class XunleiApiClient:
    """
    迅雷网盘 API 客户端

    功能:
    - 基于浏览器 Cookie 的会话管理
    - 文件浏览和列表获取
    - 离线下载任务管理
    - 文件下载链接获取
    """

    DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    def __init__(self, cookie: str = "", username: str = "", password: str = "", user_agent: str = ""):
        """
        初始化 API 客户端

        :param cookie: 浏览器导出的 Cookie 字符串
        :param username: 账号备注(兼容旧配置,不参与登录)
        :param password: 兼容旧配置字段(仅作为 Cookie 别名,不作为直登密码)
        :param user_agent: 浏览器导出的 User-Agent,用于尽量保持会话一致性
        """
        self._username = username
        self._password = password
        self._user_agent = user_agent.strip() if user_agent else ""
        self._cookie_string = ""
        self._session: Optional[requests.Session] = None
        self._session_cache_key: Optional[str] = None
        self._base_url = "https://api-pan.xunlei.com"
        if cookie:
            self.set_cookie(cookie)

    def _build_default_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self._user_agent or self.DEFAULT_USER_AGENT,
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://pan.xunlei.com",
            "Referer": "https://pan.xunlei.com/",
        }

    def _normalize_cookie_string(self, cookie: str) -> str:
        return "; ".join(
            part.strip()
            for part in cookie.replace("\n", ";").replace(",", ";").split(";")
            if part.strip()
        )

    def _parse_cookie_string(self, cookie: str) -> Dict[str, str]:
        cookie_map: Dict[str, str] = {}
        for part in self._normalize_cookie_string(cookie).split(";"):
            piece = part.strip()
            if not piece or "=" not in piece:
                continue
            name, value = piece.split("=", 1)
            name = name.strip()
            value = value.strip().strip('"')
            if name:
                cookie_map[name] = value
        return cookie_map

    def _cookie_fingerprint(self, cookie: str) -> str:
        return hashlib.sha256(cookie.encode("utf-8")).hexdigest()

    def _build_session(self) -> Optional[requests.Session]:
        if not self._cookie_string:
            return None

        session = requests.Session()
        session.headers.update(self._build_default_headers())
        session.cookies.update(self._parse_cookie_string(self._cookie_string))
        self._session = session
        self._session_cache_key = self._cookie_fingerprint(self._cookie_string)
        return session

    @staticmethod
    def _cookies_to_cookie_string(cookies: List[Dict]) -> str:
        if not cookies:
            return ""

        cookie_parts = []
        for cookie in cookies:
            if not isinstance(cookie, dict):
                continue
            name = str(cookie.get("name", "") or "").strip()
            value = str(cookie.get("value", "") or "").strip()
            if name:
                cookie_parts.append(f"{name}={value}")

        return "; ".join(cookie_parts)

    @staticmethod
    def _safe_page_text(page) -> str:
        try:
            return page.locator("body").inner_text(timeout=5000) or ""
        except Exception:
            try:
                return page.content() or ""
            except Exception:
                return ""

    @staticmethod
    def _extract_account_hint(page) -> str:
        text = XunleiApiClient._safe_page_text(page)
        if not text:
            return ""

        patterns = [
            r"1[3-9]\d{9}",
            r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",
            r"(迅雷账号|手机号|账号)[:：\s]*([\w@.+-]{4,})",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                groups = [group for group in match.groups() if group]
                if groups:
                    return groups[-1]
                return match.group(0)

        try:
            title = page.title()
            if title:
                return title
        except Exception:
            pass

        return ""

    def set_user_agent(self, user_agent: str) -> None:
        """设置浏览器 User-Agent,并清理旧会话缓存。"""
        normalized_user_agent = str(user_agent or "").strip()
        if normalized_user_agent == self._user_agent:
            return

        self._user_agent = normalized_user_agent
        self._session = None
        self._session_cache_key = None

    def get_login_guide(self) -> Dict:
        """返回迅雷网页端登录指引。"""
        return {
            "code": 200,
            "message": "请在浏览器中打开迅雷登录页并完成手机验证或账号密码登录",
            "data": {
                "login_url": "https://pan.xunlei.com",
                "browser_login_mode": "browser-assisted",
                "note": "当前公开页未见稳定二维码入口，请使用浏览器手动完成登录后再采集会话。",
            },
        }

    def capture_browser_session(self, login_url: str = "https://pan.xunlei.com", wait_seconds: int = 180, poll_interval: int = 2) -> Dict:
        """打开登录页并在用户完成登录后采集 Cookie 与 User-Agent。"""
        login_url = str(login_url or "https://pan.xunlei.com").strip() or "https://pan.xunlei.com"
        wait_seconds = max(int(wait_seconds or 0), 30)
        poll_interval = max(int(poll_interval or 0), 1)

        try:
            with sync_playwright() as playwright:
                browser_type = settings.PLAYWRIGHT_BROWSER_TYPE or "chromium"
                browser = playwright[browser_type].launch(headless=False)
                context = browser.new_context()
                page = context.new_page()
                try:
                    page.goto(login_url, wait_until="domcontentloaded", timeout=30 * 1000)
                    page.bring_to_front()
                    page.wait_for_timeout(1000)

                    deadline = time.monotonic() + wait_seconds
                    last_validation: Dict = {}
                    last_cookie = ""
                    last_user_agent = ""
                    last_page_url = page.url

                    while time.monotonic() < deadline:
                        try:
                            last_page_url = page.url
                            last_user_agent = page.evaluate("() => window.navigator.userAgent") or self._user_agent or self.DEFAULT_USER_AGENT
                            last_cookie = self._cookies_to_cookie_string(context.cookies())
                            if last_cookie:
                                validator = XunleiApiClient(
                                    cookie=last_cookie,
                                    username=self._username,
                                    user_agent=last_user_agent,
                                )
                                last_validation = validator.validate_session()
                                if last_validation.get("code") == 200:
                                    account_hint = self._extract_account_hint(page)
                                    return {
                                        "code": 200,
                                        "message": "浏览器会话采集成功",
                                        "data": {
                                            "cookie": last_cookie,
                                            "user_agent": last_user_agent,
                                            "current_url": last_page_url,
                                            "account": account_hint,
                                            "validation": last_validation,
                                        },
                                    }
                            page.wait_for_timeout(poll_interval * 1000)
                        except Exception as poll_error:
                            last_validation = {"code": 500, "message": f"轮询会话异常: {str(poll_error)}"}
                            page.wait_for_timeout(poll_interval * 1000)

                    return {
                        "code": 408,
                        "message": "等待浏览器登录超时，请在页面完成登录后重试",
                        "data": {
                            "cookie": last_cookie,
                            "user_agent": last_user_agent,
                            "current_url": last_page_url,
                            "validation": last_validation,
                        },
                    }
                finally:
                    try:
                        page.close()
                    except Exception:
                        pass
                    try:
                        context.close()
                    except Exception:
                        pass
                    try:
                        browser.close()
                    except Exception:
                        pass
        except Exception as e:
            logger.error(f"❌ 浏览器会话采集失败: {str(e)}", exc_info=True)
            return {
                "code": 500,
                "message": f"浏览器会话采集失败: {str(e)}",
                "data": {
                    "login_url": login_url,
                },
            }

    def set_cookie(self, cookie: str) -> None:
        """
        设置浏览器会话 Cookie。

        :param cookie: 请求头格式的 Cookie 字符串
        """
        normalized_cookie = self._normalize_cookie_string(cookie or "")
        if normalized_cookie == self._cookie_string:
            return

        self._cookie_string = normalized_cookie
        self._session = None
        self._session_cache_key = None

    def load_cookie(self, cookie: str) -> None:
        """兼容别名: 从 Cookie 字符串加载会话。"""
        self.set_cookie(cookie)

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict] = None,
        json_body: Optional[Dict] = None,
        timeout: int = 10,
    ) -> Dict:
        session = self._get_authenticated_session()
        if not session:
            return {"code": 401, "message": "Cookie 会话无效或未配置"}

        url = f"{self._base_url}{path}"
        response = session.request(
            method=method,
            url=url,
            params=params,
            json=json_body,
            timeout=timeout,
        )
        response.raise_for_status()
        try:
            return response.json()
        except ValueError:
            return {"code": 500, "message": "接口返回非 JSON 数据"}

    def _get_authenticated_session(self) -> Optional[requests.Session]:
        """
        获取已认证的会话。

        :return: 已认证的 requests.Session 对象,失败返回 None
        """
        if self._session and self._cookie_string:
            current_key = self._cookie_fingerprint(self._cookie_string)
            if self._session_cache_key == current_key:
                return self._session

        if not self._cookie_string:
            logger.warning("⚠️ 未配置迅雷网盘 Cookie, 请先在浏览器登录后导入会话")
            return None

        session = self._build_session()
        if not session:
            return None

        validation = self._validate_session(session)
        if validation.get("code") == 200:
            logger.info("✅ 迅雷网盘 Cookie 会话校验成功")
            return session

        logger.warning(f"⚠️ 迅雷网盘 Cookie 会话校验失败: {validation.get('message', '未知错误')}")
        self._session = None
        self._session_cache_key = None
        return None

    def _validate_session(self, session: requests.Session) -> Dict:
        """通过轻量级资源接口验证当前 Cookie 会话。"""
        try:
            response = session.get(
                f"{self._base_url}/files/list",
                params={"parent_id": "root", "page": 1, "limit": 1},
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            if data.get("code") == 0:
                return {"code": 200, "message": "会话有效"}

            message = data.get("message", "会话校验失败")
            return {"code": 401, "message": message}
        except requests.exceptions.RequestException as exc:
            return {"code": 500, "message": f"会话校验请求异常: {str(exc)}"}
        except ValueError:
            return {"code": 500, "message": "会话校验接口返回非 JSON 数据"}
    
    def get_file_list(self, parent_id: str = "root", page: int = 1, limit: int = 50) -> Dict:
        """
        获取文件列表
        
        :param parent_id: 父文件夹ID,默认为根目录
        :param page: 页码
        :param limit: 每页数量
        :return: 文件列表信息
        """
        try:
            data = self._request_json(
                "GET",
                "/files/list",
                params={"parent_id": parent_id, "page": page, "limit": limit},
                timeout=10,
            )

            if data.get("code") == 0:
                payload = data.get("data", {}) or {}
                files = payload.get("files") or payload.get("items") or []
                logger.info(f"✅ 获取文件列表成功: {len(files)} 个文件")
                return {
                    "code": 200,
                    "data": {
                        "files": files,
                        "items": files,
                        "total": payload.get("total", 0),
                        "page": page,
                        "limit": limit,
                    },
                }

            error_msg = data.get("message", "获取文件列表失败")
            logger.error(f"❌ 获取文件列表失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 获取文件列表异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
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
            download_data = {
                "url": url,
                "save_path": save_path,
            }

            logger.info(f"📥 添加离线下载任务: {url[:50]}...")
            data = self._request_json(
                "POST",
                "/offline/download",
                json_body=download_data,
                timeout=30,
            )

            if data.get("code") == 0:
                task_id = data.get("data", {}).get("task_id")
                logger.info(f"✅ 离线下载任务已添加: {task_id}")
                return {
                    "code": 200,
                    "message": "任务已添加",
                    "data": {
                        "task_id": task_id,
                        "url": url,
                    },
                }

            error_msg = data.get("message", "添加任务失败")
            logger.error(f"❌ 添加离线下载任务失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 添加离线下载任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"添加失败: {str(e)}"}
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
            data = self._request_json(
                "GET",
                "/offline/tasks",
                params={"status": status, "page": page, "limit": limit},
                timeout=10,
            )

            if data.get("code") == 0:
                payload = data.get("data", {}) or {}
                tasks = payload.get("tasks", [])
                logger.info(f"✅ 获取下载任务列表成功: {len(tasks)} 个任务")
                return {
                    "code": 200,
                    "data": {
                        "tasks": tasks,
                        "total": payload.get("total", 0),
                    },
                }

            error_msg = data.get("message", "获取任务列表失败")
            logger.error(f"❌ 获取任务列表失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 获取任务列表异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"获取失败: {str(e)}"}
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
            data = self._request_json(
                "POST",
                f"/files/{file_id}/download",
                timeout=10,
            )

            if data.get("code") == 0:
                download_url = data.get("data", {}).get("url", "")
                logger.info(f"✅ 获取下载链接成功: {file_id}")
                return {
                    "code": 200,
                    "data": {
                        "url": download_url,
                    },
                }

            error_msg = data.get("message", "获取下载链接失败")
            logger.error(f"❌ 获取下载链接失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 下载文件异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"下载失败: {str(e)}"}
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
            data = self._request_json(
                "DELETE",
                f"/files/{file_id}",
                timeout=10,
            )

            if data.get("code") == 0:
                logger.info(f"✅ 删除文件成功: {file_id}")
                return {"code": 200, "message": "删除成功"}

            error_msg = data.get("message", "删除文件失败")
            logger.error(f"❌ 删除文件失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 删除文件异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"删除失败: {str(e)}"}
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
            data = self._request_json(
                "POST",
                f"/offline/tasks/{task_id}/pause",
                timeout=10,
            )

            if data.get("code") == 0:
                logger.info(f"✅ 暂停任务成功: {task_id}")
                return {"code": 200, "message": "任务已暂停"}

            error_msg = data.get("message", "暂停任务失败")
            logger.error(f"❌ 暂停任务失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 暂停任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"暂停失败: {str(e)}"}
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
            data = self._request_json(
                "POST",
                f"/offline/tasks/{task_id}/resume",
                timeout=10,
            )

            if data.get("code") == 0:
                logger.info(f"✅ 恢复任务成功: {task_id}")
                return {"code": 200, "message": "任务已恢复"}

            error_msg = data.get("message", "恢复任务失败")
            logger.error(f"❌ 恢复任务失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 恢复任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"恢复失败: {str(e)}"}
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
            data = self._request_json(
                "DELETE",
                f"/offline/tasks/{task_id}",
                timeout=10,
            )

            if data.get("code") == 0:
                logger.info(f"✅ 取消任务成功: {task_id}")
                return {"code": 200, "message": "任务已取消"}

            error_msg = data.get("message", "取消任务失败")
            logger.error(f"❌ 取消任务失败: {error_msg}")
            return {"code": 400, "message": error_msg}

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 取消任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"取消失败: {str(e)}"}
        except Exception as e:
            logger.error(f"❌ 取消任务异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"取消失败: {str(e)}"}
    
    def close(self):
        """关闭会话"""
        if self._session:
            self._session.close()
            logger.info("🔒 迅雷网盘会话已关闭")
        self._session = None
        self._session_cache_key = None
    
    def login(self) -> Dict:
        """校验当前 Cookie 会话是否可用。"""
        try:
            if not self._cookie_string:
                return {"code": 400, "message": "请先导入浏览器 Cookie"}

            session = self._get_authenticated_session()
            if session:
                return {
                    "code": 200,
                    "message": "Cookie 会话有效",
                    "data": {
                        "username": self._username,
                        "cookie_loaded": True,
                        "user_agent": self._user_agent or self.DEFAULT_USER_AGENT,
                    },
                }

            return {"code": 401, "message": "Cookie 会话无效或已过期"}
        except Exception as e:
            logger.error(f"❌ 登录异常: {str(e)}", exc_info=True)
            return {"code": 500, "message": f"登录异常: {str(e)}"}

    def validate_session(self) -> Dict:
        """显式校验当前 Cookie 会话。"""
        return self.login()
