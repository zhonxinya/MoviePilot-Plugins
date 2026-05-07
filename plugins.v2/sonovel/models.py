"""
SoNovel API 数据模型
基于 HarmonyOS SoNovelClient.ets 的接口定义
"""

from typing import Optional, List, Union
from pydantic import BaseModel, validator


class SoNovelSearchResult(BaseModel):
    """搜索结果项"""
    bookName: str                    # 书名
    author: str                      # 作者
    url: str                         # 书籍URL
    sourceId: any                    # 书源ID（可能是字符串或整数）
    sourceName: str                  # 书源名称
    category: Optional[str] = None   # 分类
    latestChapter: Optional[str] = None  # 最新章节
    lastUpdateTime: Optional[str] = None # 最后更新时间
    status: Optional[str] = None     # 状态
    coverUrl: Optional[str] = None   # 封面URL
    description: Optional[str] = None # 简介
    
    class Config:
        arbitrary_types_allowed = True


class SoNovelApiResponse(BaseModel):
    """API 响应包装"""
    code: int                        # 响应码
    message: str                     # 响应消息
    data: List[SoNovelSearchResult]  # 数据列表


class BookFetchRequest(BaseModel):
    """书籍获取请求参数"""
    sourceId: str                    # 书源ID（统一为字符串）
    sourceName: str                  # 书源名称
    url: str                         # 书籍URL
    bookName: str                    # 书名
    author: str                      # 作者
    category: Optional[str] = None   # 分类
    latestChapter: Optional[str] = None  # 最新章节
    lastUpdateTime: Optional[str] = None # 最后更新时间
    status: Optional[str] = None     # 状态
    format: str = "epub"            # 输出格式，默认 epub
    language: str = "zh_CN"         # 语言，默认简体中文
    coverUrl: Optional[str] = None  # 封面URL
    
    @validator('sourceId', pre=True)
    @classmethod
    def convert_source_id(cls, v):
        """将 sourceId 转换为字符串"""
        if v is not None:
            return str(v)
        return v
