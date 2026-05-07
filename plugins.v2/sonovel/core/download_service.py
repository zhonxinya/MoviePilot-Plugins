"""
下载服务
负责图书下载业务逻辑,包括任务管理、后台执行等
"""

import uuid
import time
import threading
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

from app.log import logger
from app.schemas.types import NotificationType

# 支持直接运行和作为模块导入
try:
    from ..client import SoNovelClient
    from ..models import BookFetchRequest
except ImportError:
    from app.plugins.sonovel.client import SoNovelClient
    from app.plugins.sonovel.models import BookFetchRequest


class DownloadService:
    """图书下载服务"""
    
    def __init__(
        self,
        client: SoNovelClient,
        save_data_func: Callable,
        get_data_func: Callable,
        post_message_func: Callable,
        default_format: str = "epub",
        download_timeout: int = 300,
        max_workers: int = 5
    ):
        """
        初始化下载服务
        
        Args:
            client: SoNovel API 客户端
            save_data_func: 保存数据函数 (key, data)
            get_data_func: 获取数据函数 (key) -> data
            post_message_func: 发送消息函数
            default_format: 默认下载格式
            download_timeout: 下载超时时间(秒)
            max_workers: 最大并发下载数
        """
        self._client = client
        self._save_data = save_data_func
        self._get_data = get_data_func
        self._post_message = post_message_func
        self._default_format = default_format
        self._download_timeout = download_timeout
        
        # 后台下载管理
        self._executor: Optional[ThreadPoolExecutor] = None
        self._tasks: Dict[str, Dict] = {}  # task_id -> task_info
        self._lock = threading.Lock()
        self._max_workers = max_workers
    
    def initialize(self):
        """初始化下载线程池"""
        if not self._executor:
            self._executor = ThreadPoolExecutor(
                max_workers=self._max_workers,
                thread_name_prefix="SonovelDownload"
            )
            logger.info(f'✅ 后台下载线程池已初始化(最大并发: {self._max_workers})')
    
    def submit_download(self, book_data: dict) -> Dict[str, Any]:
        """
        提交下载任务到后台执行
        
        Args:
            book_data: 书籍信息字典
            
        Returns:
            任务ID和状态
        """
        logger.info('========== 提交下载任务 ==========')
        logger.info(f'📥 接收到的下载数据: {book_data}')
        
        if not book_data:
            logger.error('❌ 缺少书籍信息')
            return {"code": 400, "message": "缺少书籍信息"}
        
        try:
            # 确保线程池已初始化
            if not self._executor:
                logger.warning('⚠️ 线程池未初始化,尝试重新初始化...')
                self.initialize()
            
            # 生成任务ID
            task_id = str(uuid.uuid4())[:8]
            
            # 创建任务记录
            task_info = {
                'task_id': task_id,
                'bookName': book_data.get('bookName'),
                'author': book_data.get('author'),
                'status': 'pending',
                'message': '等待下载...',
                'created_at': self._get_current_timestamp(),
                'updated_at': self._get_current_timestamp()
            }
            
            with self._lock:
                self._tasks[task_id] = task_info
            
            logger.info(f'✅ 创建下载任务: {task_id}')
            logger.info(f'📚 书名: {book_data.get("bookName")}')
            logger.info(f'👤 作者: {book_data.get("author")}')
            
            # 提交到线程池执行
            self._executor.submit(self._execute_download, task_id, book_data)
            
            logger.info(f'🚀 任务已提交到后台执行')
            
            return {
                "code": 200,
                "message": "success",
                "data": {
                    "task_id": task_id,
                    "status": "pending",
                    "message": "下载任务已提交,请在后台查看进度"
                }
            }
            
        except Exception as e:
            logger.error(f'❌ 提交任务失败: {str(e)}')
            import traceback
            logger.info(f'堆栈跟踪:\n{traceback.format_exc()}')
            return {"code": 500, "message": str(e)}
    
    def _execute_download(self, task_id: str, book_data: dict):
        """
        后台执行下载任务(带超时控制)
        
        Args:
            task_id: 任务ID
            book_data: 书籍信息
        """
        try:
            logger.info(f'[下载任务 {task_id}] ========== 开始后台下载 ==========')
            logger.info(f'[下载任务 {task_id}] 📚 书名: {book_data.get("bookName")}')
            
            if not self._client:
                logger.error(f'[下载任务 {task_id}] ❌ API 客户端未就绪')
                self._update_task_status(task_id, 'failed', 'API 客户端未就绪')
                return
            
            # 构建请求对象
            request = BookFetchRequest(
                sourceId=book_data.get("sourceId"),
                sourceName=book_data.get("sourceName"),
                url=book_data.get("url"),
                bookName=book_data.get("bookName"),
                author=book_data.get("author"),
                category=book_data.get("category"),
                latestChapter=book_data.get("latestChapter"),
                lastUpdateTime=book_data.get("lastUpdateTime"),
                status=book_data.get("status"),
                format=book_data.get("format", self._default_format),
                language=book_data.get("language", "zh_CN"),
                coverUrl=book_data.get("coverUrl"),
            )
            
            # 验证必填字段
            if not all([request.sourceId, request.sourceName, request.url, request.bookName, request.author]):
                missing = []
                if not request.sourceId: missing.append('sourceId')
                if not request.sourceName: missing.append('sourceName')
                if not request.url: missing.append('url')
                if not request.bookName: missing.append('bookName')
                if not request.author: missing.append('author')
                error_msg = f'缺少必填字段: {", ".join(missing)}'
                logger.error(f'[下载任务 {task_id}] ❌ {error_msg}')
                self._update_task_status(task_id, 'failed', error_msg)
                return
            
            # 更新状态为下载中
            self._update_task_status(task_id, 'downloading', '正在下载...')
            
            # 使用线程池执行带超时的下载
            logger.info(f'[下载任务 {task_id}] 📡 调用远程 API (超时: {self._download_timeout}秒)...')
            
            def download_with_timeout():
                """在单独线程中执行下载,支持超时中断"""
                return self._client.book_fetch(request)
            
            # 创建临时线程池执行下载(带超时)
            with ThreadPoolExecutor(max_workers=1) as temp_executor:
                future = temp_executor.submit(download_with_timeout)
                try:
                    # 等待下载完成,最多等待 _download_timeout 秒
                    success = future.result(timeout=self._download_timeout)
                except FuturesTimeoutError:
                    # 超时,取消任务
                    logger.error(f'[下载任务 {task_id}] ⏱️ 下载超时 ({self._download_timeout}秒)')
                    future.cancel()
                    self._update_task_status(task_id, 'failed', f'下载超时 ({self._download_timeout}秒)')
                    return
                except Exception as e:
                    logger.error(f'[下载任务 {task_id}] ❌ 下载异常: {str(e)}')
                    self._update_task_status(task_id, 'failed', str(e))
                    return
            
            if not success:
                logger.error(f'[下载任务 {task_id}] ❌ 远程下载失败')
                self._update_task_status(task_id, 'failed', '远程下载失败')
                return
            
            logger.info(f'[下载任务 {task_id}] ✅ 远程 API 返回成功')
            
            # 生成文件名
            filename = f"{request.bookName}_{request.author}.{request.format}"
            
            # 保存下载历史
            self._save_download_history({
                "bookName": request.bookName,
                "author": request.author,
                "format": request.format,
                "filename": filename,
            })
            
            # 发送通知
            notify_kwargs = {
                "mtype": NotificationType.Plugin,
                "title": f"📚 Sonovel 下载完成:{request.bookName}",
                "text": f"作者:{request.author}\n格式:{request.format.upper()}\n文件已保存在远程服务器"
            }
            
            if request.coverUrl:
                notify_kwargs["image"] = request.coverUrl
            
            self._post_message(**notify_kwargs)
            
            # 更新任务状态为完成
            self._update_task_status(task_id, 'completed', '下载完成', {
                'filename': filename,
                'bookName': request.bookName,
                'author': request.author
            })
            
            logger.info(f'[下载任务 {task_id}] ✅ 下载完成: {filename}')
            
        except Exception as e:
            logger.error(f'[下载任务 {task_id}] ❌ 下载异常: {str(e)}')
            import traceback
            logger.info(f'[下载任务 {task_id}] 堆栈跟踪:\n{traceback.format_exc()}')
            self._update_task_status(task_id, 'failed', str(e))
    
    def _update_task_status(self, task_id: str, status: str, message: str, data: dict = None):
        """
        更新任务状态
        
        Args:
            task_id: 任务ID
            status: 状态 (pending/downloading/completed/failed)
            message: 消息
            data: 附加数据
        """
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].update({
                    'status': status,
                    'message': message,
                    'updated_at': self._get_current_timestamp()
                })
                if data:
                    self._tasks[task_id]['data'] = data
    
    def _save_download_history(self, book_info: dict):
        """
        保存下载历史
        
        Args:
            book_info: 书籍信息
        """
        try:
            download_history = self._get_data("download_history") or []
            download_history.insert(0, {
                **book_info,
                "size": 0,
                "timestamp": self._get_current_timestamp(),
            })
            download_history = download_history[:50]
            self._save_data("download_history", download_history)
        except Exception as e:
            logger.error(f'❌ 保存下载历史失败: {str(e)}')
    
    def get_all_tasks(self) -> Dict[str, Any]:
        """
        获取所有下载任务状态
        
        Returns:
            下载任务列表
        """
        try:
            with self._lock:
                tasks = list(self._tasks.values())
            
            # 按创建时间倒序排序
            tasks.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            return {
                "code": 200,
                "message": "success",
                "data": tasks
            }
        except Exception as e:
            logger.error(f'❌ 获取任务列表失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """
        获取单个下载任务状态
        
        Args:
            task_id: 任务ID
            
        Returns:
            任务状态
        """
        try:
            with self._lock:
                task = self._tasks.get(task_id)
            
            if not task:
                return {"code": 404, "message": "任务不存在"}
            
            return {
                "code": 200,
                "message": "success",
                "data": task
            }
        except Exception as e:
            logger.error(f'❌ 获取任务状态失败: {str(e)}')
            return {"code": 500, "message": str(e)}
    
    def shutdown(self):
        """关闭服务,清理资源"""
        if self._executor:
            self._executor.shutdown(wait=False)
            self._executor = None
            logger.info('🛑 后台下载线程池已关闭')
    
    @staticmethod
    def _get_current_timestamp() -> str:
        """获取当前时间戳字符串"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
