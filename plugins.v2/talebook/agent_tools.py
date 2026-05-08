"""
Talebook 智能体工具
为 MoviePilot AI 智能体提供电子书管理功能
"""

from typing import Optional, Type, List
from pydantic import BaseModel, Field

from app.agent.tools.base import MoviePilotTool
from app.log import logger

# 模块级别缓存插件实例,避免重复创建 PluginManager
_plugin_instance = None
_plugin_instance_lock = None


def _get_plugin_instance():
    """获取 Talebook 插件实例(带缓存)
    
    Returns:
        Talebook 插件实例或 None
    """
    global _plugin_instance, _plugin_instance_lock
    
    if _plugin_instance_lock is None:
        import threading
        _plugin_instance_lock = threading.Lock()
    
    with _plugin_instance_lock:
        if _plugin_instance is not None:
            # 检查插件是否仍然有效
            try:
                if _plugin_instance.get_state():
                    return _plugin_instance
            except Exception:
                pass
            # 插件已失效,清空缓存
            _plugin_instance = None
        
        # 创建新实例
        try:
            from app.core.plugin import PluginManager
            pm = PluginManager()
            # 使用 running_plugins 属性获取插件实例
            _plugin_instance = pm.running_plugins.get("Talebook")
            if _plugin_instance:
                return _plugin_instance
        except Exception as e:
            import traceback
            logger.error(f"[Talebook Agent Tools] 获取插件实例失败: {e}\n{traceback.format_exc()}")
        
        return None


# ==================== 搜索工具 ====================

class TalebookSearchInput(BaseModel):
    """搜索电子书的输入参数"""
    keyword: str = Field(..., description="要搜索的电子书关键词，例如：三体、哈利波特、Python编程")


class TalebookSearchTool(MoviePilotTool):
    """Talebook 电子书搜索工具"""
    
    name: str = "talebook_search"
    description: str = (
        "🔍 搜索 Talebook 书库中的电子书。\n"
        "\n"
        "📋 返回字段说明：\n"
        "- id: 书籍 ID（数字类型，后续操作必需）\n"
        "- title: 书名\n"
        "- author: 作者\n"
        "- rating: 评分（0-5分）\n"
        "- timestamp: 添加时间戳\n"
        "- cover_url: 封面图片 URL（标准字段；兼容 coverUrl/thumb/img）\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 搜索电子书\n"
        "result = talebook_search(keyword='三体')\n"
        "```\n"
        "\n"
        "💡 提示：搜索结果中的 id 字段是后续获取详情、收藏等操作的关键参数。"
    )
    args_schema: Type[BaseModel] = TalebookSearchInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        keyword = kwargs.get("keyword", "")
        return f"正在搜索电子书：{keyword}"
    
    async def run(self, keyword: str, **kwargs) -> str:
        """执行搜索操作
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            搜索结果字符串
        """
        try:
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用，请先在插件管理中启用并配置服务器信息"
            
            # 调用搜索 API
            result = plugin.api_search_books(keyword=keyword)
            
            if result.get("code") != 200:
                return f"❌ 搜索失败：{result.get('message', '未知错误')}"
            
            books = result.get("data", [])
            
            if not books:
                return f"📚 未找到与'{keyword}'相关的电子书"
            
            # 格式化输出结果
            output_lines = [
                f"🔍 搜索到 {len(books)} 本电子书\n"
            ]
            
            # 显示前 10 个结果
            display_count = min(10, len(books))
            for i, book in enumerate(books[:display_count], 1):
                book_id = book.get('id', 'N/A')
                title = book.get('title', '未知书名')
                author = book.get('author', '未知作者')
                rating = book.get('rating', 0)
                
                # 星级评分
                stars = "⭐" * int(rating) if rating > 0 else "☆"
                
                line = (
                    f"{i}. 《{title}》 {stars}\n"
                    f"   ✍️ 作者：{author}\n"
                    f"   🆔 书籍ID：{book_id}\n"
                )
                
                output_lines.append(line)
            
            if len(books) > 10:
                output_lines.append(f"\n...还有 {len(books) - 10} 个结果")
            
            output_lines.append(
                "\n💡 提示：\n"
                "- 使用 talebook_get_book_detail(book_id=X) 查看详细信息\n"
                "- 使用 talebook_add_favorite(book_id=X) 收藏书籍\n"
                "- 使用 talebook_set_read_state(book_id=X, read_state=1) 标记为在读"
            )
            
            return "\n".join(output_lines)
            
        except Exception as e:
            logger.error(f"[Talebook 搜索工具] 异常: {e}", exc_info=True)
            return f"❌ 搜索出错：{str(e)}"


# ==================== 书籍详情工具 ====================

class TalebookGetBookDetailInput(BaseModel):
    """获取书籍详情的输入参数"""
    book_id: int = Field(..., description="书籍 ID，从搜索结果中获取")


class TalebookGetBookDetailTool(MoviePilotTool):
    """Talebook 获取书籍详情工具"""
    
    name: str = "talebook_get_book_detail"
    description: str = (
        "📖 获取 Talebook 电子书的详细信息。\n"
        "\n"
        "📋 返回信息包括：\n"
        "- 基本信息：书名、作者、出版社、出版日期\n"
        "- 详细描述：简介、标签、分类\n"
        "- 元数据：ISBN、语言、页数、文件大小\n"
        "- 阅读状态：是否收藏、阅读进度\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 获取书籍详情\n"
        "detail = talebook_get_book_detail(book_id=123)\n"
        "```\n"
        "\n"
        "💡 提示：book_id 可以从搜索结果中获取。"
    )
    args_schema: Type[BaseModel] = TalebookGetBookDetailInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        book_id = kwargs.get("book_id", "")
        return f"正在获取书籍详情 (ID: {book_id})"
    
    async def run(self, book_id: int, **kwargs) -> str:
        """执行获取详情操作
        
        Args:
            book_id: 书籍 ID
            
        Returns:
            书籍详情字符串
        """
        try:
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用详情 API
            result = plugin.get_book_detail(book_id=book_id)
            
            if result.get("code") != 200:
                return f"❌ 获取详情失败：{result.get('message', '未知错误')}"
            
            book = result.get("data", {})
            
            if not book:
                return f"❌ 未找到 ID 为 {book_id} 的书籍"
            
            # 格式化输出详情
            title = book.get('title', '未知书名')
            author = book.get('author_sort', book.get('author', '未知作者'))
            publisher = book.get('publisher', '未知出版社')
            pubdate = book.get('pubdate', '未知日期')
            rating = book.get('rating', 0)
            tags = book.get('tags', [])
            series = book.get('series', '')
            isbn = book.get('isbn', '无')
            language = book.get('language', '未知')
            comments = book.get('comments', '暂无简介')
            
            # 星级评分
            stars = "⭐" * int(rating) if rating > 0 else "☆"
            
            output = (
                f"📖 《{title}》\n"
                f"{'='*50}\n\n"
                f"✍️ 作者：{author}\n"
                f"🏢 出版社：{publisher}\n"
                f"📅 出版日期：{pubdate}\n"
                f"⭐ 评分：{stars} ({rating}/5)\n"
            )
            
            if series:
                output += f"📚 丛书：{series}\n"
            
            if isbn and isbn != '无':
                output += f"🔢 ISBN：{isbn}\n"
            
            output += f"🌐 语言：{language}\n"
            
            if tags:
                tag_str = ", ".join(tags[:10])  # 最多显示 10 个标签
                output += f"🏷️ 标签：{tag_str}\n"
                if len(tags) > 10:
                    output += f"   ...还有 {len(tags) - 10} 个标签\n"
            
            output += f"\n📝 简介：\n{comments}\n"
            
            # 阅读状态信息
            is_favorited = book.get('is_favorited', False)
            read_state = book.get('read_state', 0)
            state_map = {0: "未读", 1: "在读", 2: "已读"}
            state_text = state_map.get(read_state, "未知")
            
            output += (
                f"\n📊 阅读状态：\n"
                f"   收藏：{'✅ 已收藏' if is_favorited else '❌ 未收藏'}\n"
                f"   进度：{state_text}\n"
            )
            
            output += (
                f"\n💡 可用操作：\n"
                f"- talebook_add_favorite(book_id={book_id}) - 收藏书籍\n"
                f"- talebook_set_read_state(book_id={book_id}, read_state=1) - 标记为在读\n"
            )
            
            return output
            
        except Exception as e:
            logger.error(f"[Talebook 详情工具] 异常: {e}", exc_info=True)
            return f"❌ 获取详情出错：{str(e)}"


# ==================== 收藏工具 ====================

class TalebookAddFavoriteInput(BaseModel):
    """收藏书籍的输入参数"""
    book_id: int = Field(..., description="书籍 ID，从搜索结果或详情中获取")


class TalebookAddFavoriteTool(MoviePilotTool):
    """Talebook 收藏书籍工具"""
    
    name: str = "talebook_add_favorite"
    description: str = (
        "❤️ 将电子书添加到收藏夹。\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 收藏书籍\n"
        "result = talebook_add_favorite(book_id=123)\n"
        "```\n"
        "\n"
        "💡 提示：\n"
        "- book_id 可以从搜索结果或书籍详情中获取\n"
        "- 使用 talebook_get_favorites() 查看收藏列表\n"
        "- 使用 talebook_remove_favorite(book_id=X) 取消收藏"
    )
    args_schema: Type[BaseModel] = TalebookAddFavoriteInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        book_id = kwargs.get("book_id", "")
        return f"正在收藏书籍 (ID: {book_id})"
    
    async def run(self, book_id: int, **kwargs) -> str:
        """执行收藏操作
        
        Args:
            book_id: 书籍 ID
            
        Returns:
            操作结果字符串
        """
        try:
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用收藏 API
            result = plugin.api_add_favorite(book_id=book_id)
            
            if result.get("code") != 200:
                return f"❌ 收藏失败：{result.get('message', '未知错误')}"
            
            return (
                f"✅ 收藏成功！\n\n"
                f"📚 书籍 ID：{book_id}\n"
                f"❤️ 状态：已添加到收藏夹\n\n"
                f"💡 提示：\n"
                f"- 使用 talebook_get_favorites() 查看收藏列表\n"
                f"- 使用 talebook_remove_favorite(book_id={book_id}) 取消收藏"
            )
            
        except Exception as e:
            logger.error(f"[Talebook 收藏工具] 异常: {e}", exc_info=True)
            return f"❌ 收藏出错：{str(e)}"


class TalebookRemoveFavoriteInput(BaseModel):
    """取消收藏的输入参数"""
    book_id: int = Field(..., description="书籍 ID")


class TalebookRemoveFavoriteTool(MoviePilotTool):
    """Talebook 取消收藏工具"""
    
    name: str = "talebook_remove_favorite"
    description: str = (
        "💔 从收藏夹中移除电子书。\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 取消收藏\n"
        "result = talebook_remove_favorite(book_id=123)\n"
        "```"
    )
    args_schema: Type[BaseModel] = TalebookRemoveFavoriteInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        book_id = kwargs.get("book_id", "")
        return f"正在取消收藏 (ID: {book_id})"
    
    async def run(self, book_id: int, **kwargs) -> str:
        """执行取消收藏操作
        
        Args:
            book_id: 书籍 ID
            
        Returns:
            操作结果字符串
        """
        try:
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用取消收藏 API
            result = plugin.api_remove_favorite(book_id=book_id)
            
            if result.get("code") != 200:
                return f"❌ 取消收藏失败：{result.get('message', '未知错误')}"
            
            return (
                f"✅ 取消收藏成功！\n\n"
                f"📚 书籍 ID：{book_id}\n"
                f"💔 状态：已从收藏夹移除"
            )
            
        except Exception as e:
            logger.error(f"[Talebook 取消收藏工具] 异常: {e}", exc_info=True)
            return f"❌ 取消收藏出错：{str(e)}"


# ==================== 阅读状态工具 ====================

class TalebookSetReadStateInput(BaseModel):
    """设置阅读状态的输入参数"""
    book_id: int = Field(..., description="书籍 ID")
    read_state: int = Field(..., description="阅读状态：0=未读, 1=在读, 2=已读")


class TalebookSetReadStateTool(MoviePilotTool):
    """Talebook 设置阅读状态工具"""
    
    name: str = "talebook_set_read_state"
    description: str = (
        "📊 设置电子书的阅读状态。\n"
        "\n"
        "📋 状态说明：\n"
        "- 0: 未读（默认状态）\n"
        "- 1: 在读（正在阅读）\n"
        "- 2: 已读（阅读完成）\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 标记为在读\n"
        "talebook_set_read_state(book_id=123, read_state=1)\n"
        "\n"
        "# 标记为已读\n"
        "talebook_set_read_state(book_id=123, read_state=2)\n"
        "```\n"
        "\n"
        "💡 提示：使用 talebook_get_reading() 查看正在阅读的书籍列表。"
    )
    args_schema: Type[BaseModel] = TalebookSetReadStateInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        book_id = kwargs.get("book_id", "")
        read_state = kwargs.get("read_state", 0)
        state_map = {0: "未读", 1: "在读", 2: "已读"}
        state_text = state_map.get(read_state, "未知")
        return f"正在设置阅读状态为'{state_text}' (ID: {book_id})"
    
    async def run(self, book_id: int, read_state: int, **kwargs) -> str:
        """执行设置阅读状态操作
        
        Args:
            book_id: 书籍 ID
            read_state: 阅读状态 (0/1/2)
            
        Returns:
            操作结果字符串
        """
        try:
            # 验证状态值
            if read_state not in [0, 1, 2]:
                return "❌ 错误：read_state 必须是 0（未读）、1（在读）或 2（已读）"
            
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用设置阅读状态 API
            result = plugin.api_set_book_read_state(book_id=book_id, read_state=read_state)
            
            if result.get("code") != 200:
                return f"❌ 设置状态失败：{result.get('message', '未知错误')}"
            
            state_map = {0: "未读", 1: "在读", 2: "已读"}
            state_text = state_map.get(read_state, "未知")
            
            return (
                f"✅ 设置成功！\n\n"
                f"📚 书籍 ID：{book_id}\n"
                f"📊 阅读状态：{state_text}\n\n"
                f"💡 提示：\n"
                f"- 使用 talebook_get_reading() 查看正在阅读的书籍\n"
                f"- 使用 talebook_get_book_detail(book_id={book_id}) 查看详情"
            )
            
        except Exception as e:
            logger.error(f"[Talebook 阅读状态工具] 异常: {e}", exc_info=True)
            return f"❌ 设置状态出错：{str(e)}"


# ==================== 列表查询工具 ====================

class TalebookGetFavoritesInput(BaseModel):
    """获取收藏列表的输入参数"""
    limit: int = Field(default=20, description="返回数量限制（1-100），默认 20")


class TalebookGetFavoritesTool(MoviePilotTool):
    """Talebook 获取收藏列表工具"""
    
    name: str = "talebook_get_favorites"
    description: str = (
        "❤️ 获取我的收藏夹中的电子书列表。\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 获取收藏列表（默认 20 本）\n"
        "favorites = talebook_get_favorites()\n"
        "\n"
        "# 获取最多 50 本\n"
        "favorites = talebook_get_favorites(limit=50)\n"
        "```"
    )
    args_schema: Type[BaseModel] = TalebookGetFavoritesInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        return "正在获取收藏列表"
    
    async def run(self, limit: int = 20, **kwargs) -> str:
        """执行获取收藏列表操作
        
        Args:
            limit: 返回数量限制
            
        Returns:
            收藏列表字符串
        """
        try:
            # 验证 limit
            if limit < 1 or limit > 100:
                return "❌ 错误：limit 必须在 1-100 之间"
            
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用获取收藏列表 API
            result = plugin.api_get_favorite_books(limit=limit)
            
            if result.get("code") != 200:
                return f"❌ 获取收藏列表失败：{result.get('message', '未知错误')}"
            
            books = result.get("data", [])
            
            if not books:
                return "📚 收藏夹为空，还没有收藏任何书籍"
            
            # 格式化输出
            output_lines = [
                f"❤️ 我的收藏夹 ({len(books)} 本)\n"
            ]
            
            display_count = min(20, len(books))
            for i, book in enumerate(books[:display_count], 1):
                book_id = book.get('id', 'N/A')
                title = book.get('title', '未知书名')
                author = book.get('author', '未知作者')
                rating = book.get('rating', 0)
                
                stars = "⭐" * int(rating) if rating > 0 else "☆"
                
                line = (
                    f"{i}. 《{title}》 {stars}\n"
                    f"   ✍️ 作者：{author}\n"
                    f"   🆔 ID：{book_id}\n"
                )
                
                output_lines.append(line)
            
            if len(books) > 20:
                output_lines.append(f"\n...还有 {len(books) - 20} 本")
            
            return "\n".join(output_lines)
            
        except Exception as e:
            logger.error(f"[Talebook 收藏列表工具] 异常: {e}", exc_info=True)
            return f"❌ 获取收藏列表出错：{str(e)}"


class TalebookGetReadingInput(BaseModel):
    """获取正在阅读列表的输入参数"""
    limit: int = Field(default=20, description="返回数量限制（1-100），默认 20")


class TalebookGetReadingTool(MoviePilotTool):
    """Talebook 获取正在阅读列表工具"""
    
    name: str = "talebook_get_reading"
    description: str = (
        "📖 获取我正在阅读的电子书列表。\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 获取正在阅读的书籍（默认 20 本）\n"
        "reading = talebook_get_reading()\n"
        "\n"
        "# 获取最多 50 本\n"
        "reading = talebook_get_reading(limit=50)\n"
        "```"
    )
    args_schema: Type[BaseModel] = TalebookGetReadingInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        return "正在获取正在阅读的书籍列表"
    
    async def run(self, limit: int = 20, **kwargs) -> str:
        """执行获取正在阅读列表操作
        
        Args:
            limit: 返回数量限制
            
        Returns:
            正在阅读列表字符串
        """
        try:
            # 验证 limit
            if limit < 1 or limit > 100:
                return "❌ 错误：limit 必须在 1-100 之间"
            
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用获取正在阅读列表 API
            result = plugin.api_get_reading_books(limit=limit)
            
            if result.get("code") != 200:
                return f"❌ 获取列表失败：{result.get('message', '未知错误')}"
            
            books = result.get("data", [])
            
            if not books:
                return "📚 没有正在阅读的书籍"
            
            # 格式化输出
            output_lines = [
                f"📖 正在阅读 ({len(books)} 本)\n"
            ]
            
            display_count = min(20, len(books))
            for i, book in enumerate(books[:display_count], 1):
                book_id = book.get('id', 'N/A')
                title = book.get('title', '未知书名')
                author = book.get('author', '未知作者')
                rating = book.get('rating', 0)
                
                stars = "⭐" * int(rating) if rating > 0 else "☆"
                
                line = (
                    f"{i}. 《{title}》 {stars}\n"
                    f"   ✍️ 作者：{author}\n"
                    f"   🆔 ID：{book_id}\n"
                )
                
                output_lines.append(line)
            
            if len(books) > 20:
                output_lines.append(f"\n...还有 {len(books) - 20} 本")
            
            output_lines.append(
                "\n💡 提示：\n"
                "- 使用 talebook_set_read_state(book_id=X, read_state=2) 标记为已读\n"
                "- 使用 talebook_get_book_detail(book_id=X) 查看详情"
            )
            
            return "\n".join(output_lines)
            
        except Exception as e:
            logger.error(f"[Talebook 阅读列表工具] 异常: {e}", exc_info=True)
            return f"❌ 获取列表出错：{str(e)}"


# ==================== 本地书库检查工具 ====================

class TalebookCheckBookExistsInput(BaseModel):
    """检查书籍是否存在的输入参数"""
    keyword: str = Field(..., description="书籍关键词，可以是书名、作者或ISBN")
    author: Optional[str] = Field(default=None, description="作者姓名（可选），用于精确匹配")


class TalebookCheckBookExistsTool(MoviePilotTool):
    """Talebook 检查本地书库是否已有该书"""
    
    name: str = "talebook_check_book_exists"
    description: str = (
        "🔎 检查 Talebook 本地书库中是否已存在某本电子书。\n"
        "\n"
        "💡 使用场景：\n"
        "在调用 Sonovel 下载图书前，先检查本地是否已有该书，避免重复下载。\n"
        "\n"
        "📋 返回信息：\n"
        "- 如果找到：返回书籍详细信息（ID、书名、作者、评分等）\n"
        "- 如果未找到：明确提示本地书库中没有该书\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 简单搜索\n"
        "result = talebook_check_book_exists(keyword='三体')\n"
        "\n"
        "# 精确匹配（指定作者）\n"
        "result = talebook_check_book_exists(keyword='三体', author='刘慈欣')\n"
        "```\n"
        "\n"
        "🔄 推荐工作流程：\n"
        "1. 先用 talebook_check_book_exists 检查本地是否有书\n"
        "2. 如果本地没有，再调用 sonovel_search_and_download 下载\n"
        "3. 下载完成后自动导入到 Talebook 书库"
    )
    args_schema: Type[BaseModel] = TalebookCheckBookExistsInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        keyword = kwargs.get("keyword", "")
        author = kwargs.get("author", "")
        if author:
            return f"正在检查本地书库：《{keyword}》 by {author}"
        return f"正在检查本地书库：{keyword}"
    
    async def run(self, keyword: str, author: Optional[str] = None, **kwargs) -> str:
        """执行检查操作
        
        Args:
            keyword: 书籍关键词（书名/作者/ISBN）
            author: 作者姓名（可选）
            
        Returns:
            检查结果字符串
        """
        try:
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Talebook 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Talebook 插件已禁用"
            
            # 调用搜索 API
            result = plugin.api_search_books(keyword=keyword)
            
            if result.get("code") != 200:
                return f"❌ 搜索失败：{result.get('message', '未知错误')}"
            
            books = result.get("data", [])
            
            if not books:
                author_param = f", author='{author}'" if author else ""
                return (
                    f"✅ 本地书库中没有找到《{keyword}》\n\n"
                    f"💡 建议：\n"
                    f"可以使用 sonovel_search_and_download(keyword='{keyword}'{author_param}) 下载该书"
                )
            
            # 如果指定了作者，进行精确匹配
            if author:
                matched_books = [
                    book for book in books
                    if author.lower() in book.get('author', '').lower()
                ]
                if matched_books:
                    books = matched_books
                else:
                    return (
                        f"✅ 本地书库中有《{keyword}》，但没有找到作者为'{author}'的版本\n\n"
                        f"找到的其他版本：\n"
                    ) + _format_book_list(books[:5])
            
            # 找到书籍，返回详细信息
            output = f"✅ 本地书库中已存在《{keyword}》\n\n"
            output += f"📚 找到 {len(books)} 个匹配结果\n\n"
            output += _format_book_list(books[:5])
            
            if len(books) > 5:
                output += f"\n...还有 {len(books) - 5} 个结果\n"
            
            output += (
                f"\n💡 提示：\n"
                f"- 本地已有该书，无需重复下载\n"
                f"- 使用 talebook_get_book_detail(book_id=X) 查看详情\n"
                f"- 使用 talebook_add_favorite(book_id=X) 收藏书籍"
            )
            
            return output
            
        except Exception as e:
            logger.error(f"[Talebook 检查工具] 异常: {e}", exc_info=True)
            return f"❌ 检查出错：{str(e)}"


def _format_book_list(books: list) -> str:
    """格式化书籍列表输出"""
    lines = []
    for i, book in enumerate(books, 1):
        book_id = book.get('id', 'N/A')
        title = book.get('title', '未知书名')
        author = book.get('author', '未知作者')
        rating = book.get('rating', 0)
        
        stars = "⭐" * int(rating) if rating > 0 else "☆"
        
        line = (
            f"{i}. 《{title}》 {stars}\n"
            f"   ✍️ 作者：{author}\n"
            f"   🆔 书籍ID：{book_id}\n"
        )
        lines.append(line)
    
    return "\n".join(lines)


# ==================== 工具注册函数 ====================

def get_talebook_tools() -> List[type]:
    """获取所有 Talebook 智能体工具"""
    return [
        TalebookSearchTool,
        TalebookGetBookDetailTool,
        TalebookAddFavoriteTool,
        TalebookRemoveFavoriteTool,
        TalebookSetReadStateTool,
        TalebookGetFavoritesTool,
        TalebookGetReadingTool,
        TalebookCheckBookExistsTool,  # 新增：检查本地书库
    ]
