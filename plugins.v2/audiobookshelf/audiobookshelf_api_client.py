"""
Audiobookshelf API 客户端
提供与 Audiobookshelf 服务器交互的所有 API 方法
"""
import requests
from typing import Dict, List, Optional, Any
from app.log import logger


class AudiobookshelfApiClient:
    """
    Audiobookshelf API 客户端
    
    基于 OpenAPI 3.0 规范实现
    文档参考: docs/audiobookshelf/openapi.json
    """
    
    def __init__(self, server_url: str, api_key: str, verify_ssl: bool = True):
        """
        初始化 API 客户端
        
        Args:
            server_url: Audiobookshelf 服务器地址 (如 http://localhost:3000)
            api_key: API 密钥 (Bearer Token)
            verify_ssl: 是否验证 SSL 证书
        """
        self.server_url = server_url.rstrip("/")
        self.api_key = api_key
        self.verify_ssl = verify_ssl
        
        # 创建会话
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })
        self.session.verify = verify_ssl
        
        logger.info(f"Audiobookshelf API 客户端已初始化: server={server_url}")
    
    def close(self):
        """关闭会话"""
        if self.session:
            self.session.close()
            logger.debug("Audiobookshelf API 会话已关闭")
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """
        发送 HTTP 请求
        
        Args:
            method: HTTP 方法 (GET, POST, PATCH, DELETE)
            endpoint: API 端点路径
            **kwargs: 额外的请求参数
            
        Returns:
            响应数据字典
            
        Raises:
            requests.exceptions.RequestException: 请求异常
        """
        url = f"{self.server_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            
            # 某些端点返回纯文本
            if response.headers.get("Content-Type", "").startswith("application/json"):
                return response.json()
            else:
                return {"text": response.text}
                
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP 错误 [{e.response.status_code}]: {e.response.text}")
            raise
        except requests.exceptions.ConnectionError as e:
            logger.error(f"连接错误: {str(e)}")
            raise
        except requests.exceptions.Timeout as e:
            logger.error(f"请求超时: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"请求异常: {str(e)}")
            raise
    
    # ==================== Libraries API ====================
    
    def get_libraries(self) -> Dict[str, Any]:
        """
        获取所有库列表
        
        Returns:
            包含 libraries 数组的字典
        """
        return self._request("GET", "/api/libraries")
    
    def get_library_by_id(self, library_id: str, include: Optional[str] = None, minified: bool = False) -> Dict[str, Any]:
        """
        获取单个库详情
        
        Args:
            library_id: 库 ID
            include: 额外包含的内容
            minified: 是否返回简化版本
            
        Returns:
            库对象
        """
        params = {}
        if include:
            params["include"] = include
        if minified:
            params["minified"] = "1"
        
        return self._request("GET", f"/api/libraries/{library_id}", params=params)
    
    def create_library(self, name: str, folders: List[Dict], display_order: int = 1,
                      icon: str = "audiobookshelf", media_type: str = "book",
                      provider: str = "audible", settings: Optional[Dict] = None) -> Dict[str, Any]:
        """
        创建新库
        
        Args:
            name: 库名称
            folders: 文件夹列表 [{"fullPath": "/path/to/folder"}]
            display_order: 显示顺序
            icon: 图标
            media_type: 媒体类型 (book/podcast)
            provider: 元数据提供者
            settings: 库设置
            
        Returns:
            创建的库对象
        """
        data = {
            "name": name,
            "folders": folders,
            "displayOrder": display_order,
            "icon": icon,
            "mediaType": media_type,
            "provider": provider
        }
        if settings:
            data["settings"] = settings
        
        return self._request("POST", "/api/libraries", json=data)
    
    def update_library(self, library_id: str, **kwargs) -> Dict[str, Any]:
        """
        更新库配置
        
        Args:
            library_id: 库 ID
            **kwargs: 要更新的字段
            
        Returns:
            更新后的库对象
        """
        return self._request("PATCH", f"/api/libraries/{library_id}", json=kwargs)
    
    def delete_library(self, library_id: str) -> Dict[str, Any]:
        """
        删除库
        
        Args:
            library_id: 库 ID
            
        Returns:
            删除的库对象
        """
        return self._request("DELETE", f"/api/libraries/{library_id}")
    
    def get_library_items(self, library_id: str, limit: int = 0, page: int = 0,
                         sort: str = "name", desc: bool = False,
                         filter: Optional[str] = None, include: Optional[str] = None,
                         minified: bool = False, collapse_series: bool = False) -> Dict[str, Any]:
        """
        获取库中的项目列表
        
        Args:
            library_id: 库 ID
            limit: 每页数量 (0=全部)
            page: 页码 (从0开始)
            sort: 排序字段
            desc: 是否降序
            filter: 过滤条件
            include: 额外包含的内容
            minified: 是否返回简化版本
            collapse_series: 是否折叠系列
            
        Returns:
            包含 results、total 等字段的字典
        """
        params = {
            "limit": limit,
            "page": page,
            "sort": sort,
            "desc": "1" if desc else "0",
            "minified": "1" if minified else "0",
            "collapseSeries": "1" if collapse_series else "0"
        }
        if filter:
            params["filter"] = filter
        if include:
            params["include"] = include
        
        return self._request("GET", f"/api/libraries/{library_id}/items", params=params)
    
    def get_library_authors(self, library_id: str) -> Dict[str, Any]:
        """
        获取库中的所有作者
        
        Args:
            library_id: 库 ID
            
        Returns:
            包含 authors 数组的字典
        """
        return self._request("GET", f"/api/libraries/{library_id}/authors")
    
    def get_library_series(self, library_id: str, limit: int = 0, page: int = 0,
                          sort: str = "name", desc: bool = False,
                          filter: Optional[str] = None, include: Optional[str] = None,
                          minified: bool = False) -> Dict[str, Any]:
        """
        获取库中的系列列表
        
        Args:
            library_id: 库 ID
            limit: 每页数量
            page: 页码
            sort: 排序字段 (name/numBooks/totalDuration/addedAt/lastBookAdded/lastBookUpdated)
            desc: 是否降序
            filter: 过滤条件
            include: 额外包含的内容
            minified: 是否返回简化版本
            
        Returns:
            包含 results、total 等字段的字典
        """
        params = {
            "limit": limit,
            "page": page,
            "sort": sort,
            "desc": "1" if desc else "0",
            "minified": "1" if minified else "0"
        }
        if filter:
            params["filter"] = filter
        if include:
            params["include"] = include
        
        return self._request("GET", f"/api/libraries/{library_id}/series", params=params)
    
    def delete_library_issues(self, library_id: str) -> str:
        """
        删除库中有问题的项目(仅从数据库移除,不删除文件)
        
        Args:
            library_id: 库 ID
            
        Returns:
            成功消息
        """
        result = self._request("DELETE", f"/api/libraries/{library_id}/issues")
        return result.get("text", "Issues deleted.")
    
    # ==================== Authors API ====================
    
    def get_author_by_id(self, author_id: str, include: Optional[str] = None) -> Dict[str, Any]:
        """
        获取作者详情
        
        Args:
            author_id: 作者 ID
            include: 额外包含的内容 (items,series)
            
        Returns:
            作者对象
        """
        params = {}
        if include:
            params["include"] = include
        
        return self._request("GET", f"/api/authors/{author_id}", params=params)
    
    def update_author(self, author_id: str, name: Optional[str] = None,
                     description: Optional[str] = None,
                     image_path: Optional[str] = None,
                     asin: Optional[str] = None) -> Dict[str, Any]:
        """
        更新作者信息
        
        Args:
            author_id: 作者 ID
            name: 作者名称
            description: 描述
            image_path: 图片路径
            asin: Audible ASIN
            
        Returns:
            更新后的作者对象
        """
        data = {}
        if name is not None:
            data["name"] = name
        if description is not None:
            data["description"] = description
        if image_path is not None:
            data["imagePath"] = image_path
        if asin is not None:
            data["asin"] = asin
        
        return self._request("PATCH", f"/api/authors/{author_id}", json=data)
    
    def delete_author(self, author_id: str) -> str:
        """
        删除作者
        
        Args:
            author_id: 作者 ID
            
        Returns:
            成功消息
        """
        result = self._request("DELETE", f"/api/authors/{author_id}")
        return result.get("text", "Author deleted.")
    
    def match_author(self, author_id: str, q: Optional[str] = None,
                    asin: Optional[str] = None, region: str = "us") -> Dict[str, Any]:
        """
        使用快速匹配将作者与 Audible 匹配
        
        Args:
            author_id: 作者 ID
            q: 搜索查询
            asin: Audible ASIN (优先级高于 q)
            region: 地区代码
            
        Returns:
            更新后的作者对象
        """
        data = {}
        if q:
            data["q"] = q
        if asin:
            data["asin"] = asin
        data["region"] = region
        
        return self._request("POST", f"/api/authors/{author_id}/match", json=data)
    
    def get_author_image(self, author_id: str, width: int = 400,
                        height: Optional[int] = None,
                        format: str = "jpeg", raw: bool = False) -> bytes:
        """
        获取作者图片
        
        Args:
            author_id: 作者 ID
            width: 宽度
            height: 高度 (None=自动保持比例)
            format: 格式 (jpeg/webp)
            raw: 是否返回原始图片
            
        Returns:
            图片二进制数据
        """
        params = {
            "width": width,
            "format": format,
            "raw": "1" if raw else "0"
        }
        if height is not None:
            params["height"] = height
        
        # 图片端点需要特殊处理
        url = f"{self.server_url}/api/authors/{author_id}/image"
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.content
    
    def add_author_image(self, author_id: str, image_url: str) -> bytes:
        """
        为作者添加图片(从 URL 下载)
        
        Args:
            author_id: 作者 ID
            image_url: 图片 URL
            
        Returns:
            图片二进制数据
        """
        return self._request("POST", f"/api/authors/{author_id}/image",
                           json={"url": image_url})
    
    def update_author_image(self, author_id: str, width: int = 400,
                           height: Optional[int] = None,
                           format: str = "jpeg", raw: bool = False) -> bytes:
        """
        更新作者图片(调整大小)
        
        Args:
            author_id: 作者 ID
            width: 宽度
            height: 高度
            format: 格式
            raw: 是否原始图片
            
        Returns:
            图片二进制数据
        """
        data = {
            "width": width,
            "format": format,
            "raw": raw
        }
        if height is not None:
            data["height"] = height
        
        return self._request("PATCH", f"/api/authors/{author_id}/image", json=data)
    
    def delete_author_image(self, author_id: str) -> bool:
        """
        删除作者图片
        
        Args:
            author_id: 作者 ID
            
        Returns:
            是否成功
        """
        self._request("DELETE", f"/api/authors/{author_id}/image")
        return True
    
    # ==================== Series API ====================
    
    def get_series(self, series_id: str, include: Optional[str] = None) -> Dict[str, Any]:
        """
        获取系列详情
        
        Args:
            series_id: 系列 ID
            include: 额外包含的内容 (progress,rssfeed)
            
        Returns:
            系列对象
        """
        params = {}
        if include:
            params["include"] = include
        
        return self._request("GET", f"/api/series/{series_id}", params=params)
    
    def update_series(self, series_id: str, name: Optional[str] = None,
                     description: Optional[str] = None) -> Dict[str, Any]:
        """
        更新系列信息
        
        Args:
            series_id: 系列 ID
            name: 系列名称
            description: 描述
            
        Returns:
            更新后的系列对象
        """
        data = {}
        if name is not None:
            data["name"] = name
        if description is not None:
            data["description"] = description
        
        return self._request("PATCH", f"/api/series/{series_id}", json=data)
    
    # ==================== Podcasts API ====================
    
    def create_podcast(self, library_id: str, folder_id: str,
                      title: str, author: Optional[str] = None,
                      description: Optional[str] = None,
                      feed_url: Optional[str] = None,
                      auto_download_episodes: bool = False) -> Dict[str, Any]:
        """
        创建新播客
        
        Args:
            library_id: 库 ID
            folder_id: 文件夹 ID
            title: 播客标题
            author: 作者
            description: 描述
            feed_url: RSS Feed URL
            auto_download_episodes: 是否自动下载剧集
            
        Returns:
            创建的播客对象
        """
        data = {
            "libraryId": library_id,
            "folderId": folder_id,
            "metadata": {
                "title": title
            },
            "autoDownloadEpisodes": auto_download_episodes
        }
        if author:
            data["metadata"]["author"] = author
        if description:
            data["metadata"]["description"] = description
        if feed_url:
            data["metadata"]["feedUrl"] = feed_url
        
        return self._request("POST", "/api/podcasts", json=data)
    
    def get_podcast_feed(self, rss_feed: str) -> Dict[str, Any]:
        """
        获取播客 Feed 信息
        
        Args:
            rss_feed: RSS Feed URL
            
        Returns:
            包含 podcast 对象的字典
        """
        return self._request("POST", "/api/podcasts/feed", json={"rssFeed": rss_feed})
    
    def parse_opml(self, opml_text: str) -> Dict[str, Any]:
        """
        解析 OPML 文本获取 Feed 列表
        
        Args:
            opml_text: OPML 文本内容
            
        Returns:
            包含 feeds 数组的字典
        """
        return self._request("POST", "/api/podcasts/opml/parse", json={"opmlText": opml_text})
    
    def bulk_create_podcasts_from_opml(self, feeds: List[str], library_id: str,
                                      folder_id: str,
                                      auto_download_episodes: bool = False) -> bool:
        """
        从 OPML Feed URLs 批量创建播客
        
        Args:
            feeds: Feed URL 列表
            library_id: 库 ID
            folder_id: 文件夹 ID
            auto_download_episodes: 是否自动下载
            
        Returns:
            是否成功
        """
        data = {
            "feeds": feeds,
            "libraryId": library_id,
            "folderId": folder_id,
            "autoDownloadEpisodes": auto_download_episodes
        }
        self._request("POST", "/api/podcasts/opml/create", json=data)
        return True
    
    def check_new_episodes(self, podcast_id: str, limit: Optional[int] = None) -> Dict[str, Any]:
        """
        检查并下载新剧集
        
        Args:
            podcast_id: 播客 ID
            limit: 最大下载数量
            
        Returns:
            包含下载的 episodes 数组
        """
        params = {}
        if limit is not None:
            params["limit"] = limit
        
        return self._request("GET", f"/api/podcasts/{podcast_id}/checknew", params=params)
    
    def clear_episode_queue(self, podcast_id: str) -> bool:
        """
        清空剧集下载队列
        
        Args:
            podcast_id: 播客 ID
            
        Returns:
            是否成功
        """
        self._request("GET", f"/api/podcasts/{podcast_id}/clear-queue")
        return True
    
    def get_episode_downloads(self, podcast_id: str) -> Dict[str, Any]:
        """
        获取剧集下载列表
        
        Args:
            podcast_id: 播客 ID
            
        Returns:
            包含 downloads 数组的字典
        """
        return self._request("GET", f"/api/podcasts/{podcast_id}/downloads")
    
    def find_episode(self, podcast_id: str, title: str) -> Dict[str, Any]:
        """
        按标题搜索剧集
        
        Args:
            podcast_id: 播客 ID
            title: 剧集标题
            
        Returns:
            包含 episodes 数组的字典
        """
        return self._request("GET", f"/api/podcasts/{podcast_id}/search-episode",
                           params={"title": title})
    
    def download_episodes(self, podcast_id: str, episode_ids: List[str]) -> bool:
        """
        下载指定剧集
        
        Args:
            podcast_id: 播客 ID
            episode_ids: 剧集 ID 列表
            
        Returns:
            是否成功
        """
        self._request("POST", f"/api/podcasts/{podcast_id}/download-episodes",
                     json=episode_ids)
        return True
    
    def quick_match_episodes(self, podcast_id: str, override: bool = False) -> Dict[str, Any]:
        """
        快速匹配剧集元数据
        
        Args:
            podcast_id: 播客 ID
            override: 是否覆盖现有数据
            
        Returns:
            包含 numEpisodesUpdated 的字典
        """
        params = {}
        if override:
            params["override"] = "1"
        
        return self._request("POST", f"/api/podcasts/{podcast_id}/match-episodes",
                           params=params)
    
    def get_episode(self, podcast_id: str, episode_id: str) -> Dict[str, Any]:
        """
        获取特定剧集详情
        
        Args:
            podcast_id: 播客 ID
            episode_id: 剧集 ID
            
        Returns:
            剧集对象
        """
        return self._request("GET", f"/api/podcasts/{podcast_id}/episode/{episode_id}")
    
    def update_episode(self, podcast_id: str, episode_id: str, **kwargs) -> Dict[str, Any]:
        """
        更新剧集信息
        
        Args:
            podcast_id: 播客 ID
            episode_id: 剧集 ID
            **kwargs: 要更新的字段
            
        Returns:
            更新后的播客对象
        """
        return self._request("PATCH", f"/api/podcasts/{podcast_id}/episode/{episode_id}",
                           json=kwargs)
    
    def remove_episode(self, podcast_id: str, episode_id: str, hard: bool = False) -> Dict[str, Any]:
        """
        移除剧集
        
        Args:
            podcast_id: 播客 ID
            episode_id: 剧集 ID
            hard: 是否硬删除(删除文件)
            
        Returns:
            更新后的播客对象
        """
        params = {}
        if hard:
            params["hard"] = "1"
        
        return self._request("DELETE", f"/api/podcasts/{podcast_id}/episode/{episode_id}",
                           params=params)
    
    # ==================== Email API ====================
    
    def get_email_settings(self) -> Dict[str, Any]:
        """
        获取邮件设置
        
        Returns:
            邮件设置对象
        """
        return self._request("GET", "/api/emails/settings")
    
    def update_email_settings(self, host: str, port: int, secure: bool = True,
                             user: Optional[str] = None,
                             pass_: Optional[str] = None,
                             from_address: Optional[str] = None,
                             test_address: Optional[str] = None,
                             ereader_devices: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """
        更新邮件设置
        
        Args:
            host: SMTP 主机
            port: SMTP 端口
            secure: 是否使用 SSL/TLS
            user: 用户名
            pass_: 密码
            from_address: 发件人地址
            test_address: 测试地址
            ereader_devices: 电子阅读器设备列表
            
        Returns:
            更新后的邮件设置
        """
        data = {
            "host": host,
            "port": port,
            "secure": secure
        }
        if user is not None:
            data["user"] = user
        if pass_ is not None:
            data["pass"] = pass_
        if from_address is not None:
            data["fromAddress"] = from_address
        if test_address is not None:
            data["testAddress"] = test_address
        if ereader_devices is not None:
            data["ereaderDevices"] = ereader_devices
        
        return self._request("PATCH", "/api/emails/settings", json=data)
    
    def send_test_email(self) -> bool:
        """
        发送测试邮件
        
        Returns:
            是否成功
        """
        self._request("POST", "/api/emails/test")
        return True
    
    def update_ereader_devices(self, ereader_devices: List[Dict]) -> Dict[str, Any]:
        """
        更新电子阅读器设备列表
        
        Args:
            ereader_devices: 设备列表
            
        Returns:
            更新后的设备列表
        """
        return self._request("POST", "/api/emails/ereader-devices",
                           json={"ereaderDevices": ereader_devices})
    
    def send_ebook_to_device(self, library_item_id: str, device_name: str) -> bool:
        """
        发送电子书到设备
        
        Args:
            library_item_id: 库项目 ID
            device_name: 设备名称
            
        Returns:
            是否成功
        """
        self._request("POST", "/api/emails/send-ebook-to-device",
                     json={"libraryItemId": library_item_id, "deviceName": device_name})
        return True
    
    # ==================== Notifications API ====================
    
    def get_notifications(self) -> Dict[str, Any]:
        """
        获取通知设置
        
        Returns:
            包含 data 和 settings 的字典
        """
        return self._request("GET", "/api/notifications")
    
    def get_notification_event_data(self) -> Dict[str, Any]:
        """
        获取通知事件数据
        
        Returns:
            包含 events 数组的字典
        """
        return self._request("GET", "/api/notificationdata")
    
    def configure_notification_settings(self, apprise_api_url: Optional[str] = None,
                                       max_failed_attempts: int = 5,
                                       max_notification_queue: int = 100) -> Dict[str, Any]:
        """
        配置通知设置
        
        Args:
            apprise_api_url: Apprise API URL
            max_failed_attempts: 最大失败次数
            max_notification_queue: 最大队列长度
            
        Returns:
            更新后的通知设置
        """
        data = {
            "maxFailedAttempts": max_failed_attempts,
            "maxNotificationQueue": max_notification_queue
        }
        if apprise_api_url is not None:
            data["appriseApiUrl"] = apprise_api_url
        
        return self._request("PATCH", "/api/notifications", json=data)
    
    def create_notification(self, event_name: str, urls: List[str],
                           title_template: str, body_template: str,
                           library_id: Optional[str] = None,
                           enabled: bool = False,
                           notification_type: str = "info") -> Dict[str, Any]:
        """
        创建通知
        
        Args:
            event_name: 事件名称
            urls: Apprise URLs
            title_template: 标题模板
            body_template: 正文模板
            library_id: 库 ID (可选)
            enabled: 是否启用
            notification_type: 通知类型 (info/success/warning/failure)
            
        Returns:
            包含 settings 的字典
        """
        data = {
            "eventName": event_name,
            "urls": urls,
            "titleTemplate": title_template,
            "bodyTemplate": body_template,
            "enabled": enabled,
            "type": notification_type
        }
        if library_id is not None:
            data["libraryId"] = library_id
        
        return self._request("POST", "/api/notifications", json=data)
    
    def update_notification(self, notification_id: str, **kwargs) -> Dict[str, Any]:
        """
        更新通知
        
        Args:
            notification_id: 通知 ID
            **kwargs: 要更新的字段
            
        Returns:
            包含 settings 的字典
        """
        return self._request("PATCH", f"/api/notifications/{notification_id}", json=kwargs)
    
    def delete_notification(self, notification_id: str) -> Dict[str, Any]:
        """
        删除通知
        
        Args:
            notification_id: 通知 ID
            
        Returns:
            包含 settings 的字典
        """
        return self._request("DELETE", f"/api/notifications/{notification_id}")
    
    def send_test_notification(self, notification_id: Optional[str] = None,
                              fail: bool = False) -> bool:
        """
        发送测试通知
        
        Args:
            notification_id: 通知 ID (None=通用测试)
            fail: 是否故意失败
            
        Returns:
            是否成功
        """
        if notification_id:
            self._request("GET", f"/api/notifications/{notification_id}/test")
        else:
            params = {"fail": "1" if fail else "0"}
            self._request("GET", "/api/notifications/test", params=params)
        return True
