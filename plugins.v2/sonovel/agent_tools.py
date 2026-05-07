"""
Sonovel 智能体工具
为 MoviePilot AI 智能体提供图书搜索和下载能力
"""

from typing import Optional, Type, List
from pydantic import BaseModel, Field

from app.agent.tools.base import MoviePilotTool
from app.log import logger

# 模块级别缓存插件实例,避免重复创建 PluginManager
_plugin_instance = None
_plugin_instance_lock = None


def _get_plugin_instance():
    """获取 Sonovel 插件实例(带缓存)
    
    Returns:
        Sonovel 插件实例或 None
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
            _plugin_instance = pm.running_plugins.get("Sonovel")
            if _plugin_instance:
                return _plugin_instance
        except Exception as e:
            import traceback
            logger.error(f"[Sonovel Agent Tools] 获取插件实例失败: {e}\n{traceback.format_exc()}")
        
        return None


class SonovelSearchInput(BaseModel):
    """搜索图书的输入参数"""
    keyword: str = Field(..., description="要搜索的书籍关键词，例如：三体、哈利波特")


class SonovelSearchTool(MoviePilotTool):
    """SoNovel 图书搜索工具"""
    
    name: str = "sonovel_search"
    description: str = (
        "🔍 搜索电子书资源，支持多书源聚合搜索。\n"
        "\n"
        "📋 返回字段说明：\n"
        "- bookName: 书名\n"
        "- author: 作者\n"
        "- sourceId: 书源ID（数字类型，如 1, 8, 9）\n"
        "- sourceName: 书源名称（如 '香书小说', '悠久小说网'）\n"
        "- url: 【关键】真实的书籍页面URL，下载时必须使用此值\n"
        "\n"
        "⚠️ 重要提示：\n"
        "1. 搜索结果中的 url 字段是真实的书籍页面地址，下载时必须原样使用\n"
        "2. sourceId 是数字类型的书源ID，不是字符串名称\n"
        "3. 下载时需要从搜索结果中提取：bookName, author, sourceId, sourceName, url\n"
        "\n"
        "✅ 正确使用流程：\n"
        "步骤1: 调用 sonovel_search(keyword='斗破苍穹') 进行搜索\n"
        "步骤2: 从返回的 data 数组中选择一本书\n"
        "步骤3: 提取该书的 url、sourceId、sourceName、bookName、author 字段\n"
        "步骤4: 使用提取的值调用 sonovel_download 进行下载\n"
        "\n"
        "❌ 错误做法：自行构造 URL 或使用示例地址会导致下载失败！"
    )
    args_schema: Type[BaseModel] = SonovelSearchInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        keyword = kwargs.get("keyword", "")
        return f"正在搜索图书：{keyword}"
    
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
                return "错误：Sonovel 插件未安装或未启用"
            
            if not plugin.get_state():
                return "错误：Sonovel 插件已禁用，请先在插件管理中启用"
            
            # 调用搜索 API
            result = plugin.api_search(keyword=keyword)
            
            if result.get("code") != 200:
                return f"搜索失败：{result.get('message', '未知错误')}"
            
            books = result.get("data", [])
            
            if not books:
                return f"未找到与'{keyword}'相关的书籍"
            
            # 步飤1: 智能去重 - 识别同一本书的不同书源
            deduplicated_books = _deduplicate_books(books)
                        
            # 步飤2: 智能评分 - 评估每本书的下载价值
            scored_books = _score_books(deduplicated_books)
            
            # 步骤3: 按评分排序
            scored_books.sort(key=lambda x: x['score'], reverse=True)
            
            # 格式化输出结果
            output_lines = [
                f"🔍 搜索到 {len(books)} 个结果",
                f"📚 去重后 {len(deduplicated_books)} 本不同的书籍\n"
            ]
            
            # 显示前10个高分书籍
            display_count = min(10, len(scored_books))
            for i, book_info in enumerate(scored_books[:display_count], 1):
                book = book_info['book']
                score = book_info['score']
                reasons = book_info['reasons']
                
                # 星级评分
                stars = "⭐" * min(5, max(1, int(score / 20)))
                
                line = (
                    f"{i}. 《{book.get('bookName')}》 {stars} ({score}分)\n"
                    f"   ✍️ 作者：{book.get('author', '未知')}\n"
                    f"   📖 书源：{book.get('sourceName', '未知')}\n"
                )
                
                if book.get('category'):
                    line += f"   🏷️ 分类：{book['category']}\n"
                
                if book.get('latestChapter'):
                    line += f"   📝 最新章节：{book['latestChapter']}\n"
                
                # 显示推荐理由
                if reasons:
                    line += f"   💡 推荐：{', '.join(reasons[:2])}\n"
                
                # 显示该书的其他书源数量
                source_count = book_info.get('source_count', 1)
                if source_count > 1:
                    line += f"   🔗 其他书源：{source_count - 1} 个\n"
                
                output_lines.append(line)
            
            if len(scored_books) > 10:
                output_lines.append(
                    f"\n...还有 {len(scored_books) - 10} 个结果\n"
                    f"💡 提示：可使用 sonovel_search_and_download 一键下载推荐度最高的书籍"
                )
            
            return "\n".join(output_lines)
            
        except Exception as e:
            logger.error(f"[搜索工具] 异常: {e}", exc_info=True)
            return f"搜索出错：{str(e)}"


# ==================== 模块级别辅助函数 ====================

def _deduplicate_books(books: list) -> list:
    """智能去重 - 识别同一本书的不同书源
    
    Args:
        books: 原始搜索结果列表
        
    Returns:
        去重后的书籍列表（保留最佳书源）
    """
    if not books:
        return []
    
    # 使用字典分组：key = (书名标准化, 作者标准化)
    book_groups = {}
    
    for book in books:
        # 标准化书名和作者（去除空格、特殊字符等）
        book_name = _normalize_text(book.get('bookName', ''))
        author = _normalize_text(book.get('author', ''))
        
        key = (book_name, author)
        
        if key not in book_groups:
            book_groups[key] = {
                'book': book,
                'sources': [book],
                'source_count': 1
            }
        else:
            book_groups[key]['sources'].append(book)
            book_groups[key]['source_count'] += 1
            
            # 选择更好的书源（优先选择有最新章节的）
            current_best = book_groups[key]['book']
            if _is_better_source(book, current_best):
                book_groups[key]['book'] = book
    
    # 返回每个书籍的最佳版本
    return [group['book'] for group in book_groups.values()]


def _score_books(books: list) -> list:
    """智能评分 - 评估每本书的下载价值
    
    Args:
        books: 去重后的书籍列表
        
    Returns:
        带评分的书籍列表
    """
    scored_books = []
    
    for book in books:
        score = 0
        reasons = []
        
        # 评分维度1: 最新章节状态（30分）
        latest_chapter = book.get('latestChapter', '')
        if latest_chapter:
            if '完结' in latest_chapter or '完本' in latest_chapter:
                score += 30
                reasons.append('已完结')
            elif '连载' in latest_chapter:
                score += 20
                reasons.append('连载中')
            else:
                score += 15
        
        # 评分维度2: 书源可靠性（25分）
        source_name = book.get('sourceName', '')
        reliable_sources = ['香书小说', '悠久小说网', '笔趣阁', '新笔趣阁']
        if any(s in source_name for s in reliable_sources):
            score += 25
            reasons.append('可靠书源')
        else:
            score += 15
        
        # 评分维度3: 分类明确性（15分）
        category = book.get('category', '')
        if category and category not in ['其他', '未知', '']:
            score += 15
            reasons.append('分类明确')
        
        # 评分维度4: URL有效性（15分）
        url = book.get('url', '')
        if url and not url.startswith('http://example') and not url.startswith('https://example'):
            score += 15
        
        # 评分维度5: 作者信息完整性（10分）
        author = book.get('author', '')
        if author and author != '未知':
            score += 10
        
        # 评分维度6: 书名长度合理性（5分）
        book_name = book.get('bookName', '')
        if 2 <= len(book_name) <= 30:
            score += 5
        
        scored_books.append({
            'book': book,
            'score': score,
            'reasons': reasons
        })
    
    return scored_books


def _is_better_source(new_book: dict, current_best: dict) -> bool:
    """判断新书源是否比当前最佳书源更好
    
    Args:
        new_book: 新的书源信息
        current_best: 当前最佳书源
        
    Returns:
        True 如果新书源更好
    """
    # 优先级1: 有最新章节 vs 无最新章节
    new_has_chapter = bool(new_book.get('latestChapter'))
    best_has_chapter = bool(current_best.get('latestChapter'))
    if new_has_chapter and not best_has_chapter:
        return True
    if not new_has_chapter and best_has_chapter:
        return False
    
    # 优先级2: 完结状态优先
    new_chapter = new_book.get('latestChapter', '')
    best_chapter = current_best.get('latestChapter', '')
    if ('完结' in new_chapter or '完本' in new_chapter) and \
       ('完结' not in best_chapter and '完本' not in best_chapter):
        return True
    
    # 优先级3: 可靠书源优先
    reliable_sources = ['香书小说', '悠久小说网', '笔趣阁']
    new_source = new_book.get('sourceName', '')
    best_source = current_best.get('sourceName', '')
    new_is_reliable = any(s in new_source for s in reliable_sources)
    best_is_reliable = any(s in best_source for s in reliable_sources)
    if new_is_reliable and not best_is_reliable:
        return True
    
    # 默认保持当前最佳
    return False


def _normalize_text(text: str) -> str:
    """标准化文本 - 用于去重比较
    
    Args:
        text: 原始文本
        
    Returns:
        标准化后的文本
    """
    if not text:
        return ''
    
    # 转换为小写
    text = text.lower()
    
    # 去除空格
    text = text.replace(' ', '').replace('\u3000', '')
    
    # 去除常见标点符号
    import re
    text = re.sub(r'[\s\-\_\.\,\!\?\:\;\'\"\(\)\[\]\{\}\/\\]', '', text)
    
    return text


def _select_best_book(books: list, author: Optional[str] = None,
                      source_preference: Optional[str] = None) -> Optional[dict]:
    """智能选择最佳书籍结果（使用评分系统）
    
    Args:
        books: 搜索结果列表
        author: 作者姓名（可选）
        source_preference: 偏好的书源名称（可选）
        
    Returns:
        选中的书籍信息字典，如果没有合适结果则返回 None
    """
    if not books:
        return None
    
    # 策略1: 如果指定了作者，优先匹配作者
    if author:
        author_matches = [
            book for book in books
            if author.lower() in book.get("author", "").lower()
        ]
        if author_matches:
            books = author_matches
            logger.info(f"[选择策略] 按作者筛选后剩余 {len(books)} 个结果")
    
    # 策略2: 如果指定了书源偏好，优先匹配书源
    if source_preference:
        source_matches = [
            book for book in books
            if source_preference in book.get("sourceName", "")
        ]
        if source_matches:
            books = source_matches
            logger.info(f"[选择策略] 按书源筛选后剩余 {len(books)} 个结果")
    
    # 策略3: 使用评分系统选择最佳结果
    scored_books = _score_books(books)
    if scored_books:
        # 按评分排序，返回最高分的书籍
        scored_books.sort(key=lambda x: x['score'], reverse=True)
        best_book = scored_books[0]['book']
        best_score = scored_books[0]['score']
        logger.info(f"[选择策略] 选择评分最高的书籍: {best_book.get('bookName')} (评分: {best_score})")
        return best_book
    
    # 兜底：返回第一个结果
    return books[0] if books else None
    import re
    text = re.sub(r'[\s\-\_\.\,\!\?\。\，\！\？]', '', text)
    
    return text


# ==================== 工具类定义 ====================


class SonovelDownloadInput(BaseModel):
    """下载图书的输入参数"""
    book_name: str = Field(..., description="【必填】书籍名称，必须从搜索结果的 bookName 字段获取")
    author: str = Field(..., description="【必填】作者姓名，必须从搜索结果的 author 字段获取")
    source_id: str = Field(..., description="【必填】书源ID（数字字符串），必须从搜索结果的 sourceId 字段获取，例如: '1', '8', '9'")
    source_name: str = Field(..., description="【必填】书源名称，必须从搜索结果的 sourceName 字段获取，例如: '香书小说'")
    url: str = Field(..., description="【最关键】书籍的真实URL，必须从搜索结果的 url 字段原样获取！示例: 'http://www.xbiqugu.la/7/7877/'。禁止使用虚构或示例URL！")
    format: Optional[str] = Field(default="epub", description="输出格式：epub/pdf/txt/mobi，默认epub")


class SonovelSearchAndDownloadInput(BaseModel):
    """一键搜索并下载图书的输入参数"""
    keyword: str = Field(..., description="要搜索的书籍关键词，例如：斗破苍穹、三体")
    author: Optional[str] = Field(default=None, description="作者姓名（可选），用于精确匹配，例如：天蚕土豆、刘慈欣")
    format: Optional[str] = Field(default="epub", description="输出格式：epub/pdf/txt/mobi，默认epub")
    source_preference: Optional[str] = Field(
        default=None, 
        description="书源偏好（可选），指定优先使用的书源名称，例如：'香书小说'、'悠久小说网'。不指定则自动选择第一个可用书源"
    )


class SonovelDownloadTool(MoviePilotTool):
    """SoNovel 图书下载工具"""
    
    name: str = "sonovel_download"
    description: str = (
        "📥 下载电子书文件到远程服务器。\n"
        "\n"
        "⚠️【极其重要】参数来源要求：\n"
        "所有参数都必须从 sonovel_search 的搜索结果中提取，严禁自行构造！\n"
        "\n"
        "📋 各参数的正确来源：\n"
        "- book_name ← 搜索结果的 bookName 字段\n"
        "- author ← 搜索结果的 author 字段\n"
        "- source_id ← 搜索结果的 sourceId 字段（数字类型，如 '1', '8'）\n"
        "- source_name ← 搜索结果的 sourceName 字段\n"
        "- url ← 搜索结果的 url 字段（真实URL，如 'http://www.xbiqugu.la/7/7877/'）\n"
        "\n"
        "❌ 常见错误（会导致下载失败）：\n"
        "1. url 使用示例地址：'https://xiangshu.example/斗破苍穹' → 失败！\n"
        "2. source_id 使用名称：'香书小说' → 应该是数字 '1'！\n"
        "3. 自行拼接或猜测 URL → 必须从搜索结果获取！\n"
        "\n"
        "✅ 正确使用示例：\n"
        "```python\n"
        "# 步骤1: 搜索\n"
        "search_result = sonovel_search(keyword='斗破苍穹')\n"
        "book = search_result['data'][0]  # 选择第一本书\n"
        "\n"
        "# 步骤2: 提取参数（必须从搜索结果获取）\n"
        "sonovel_download(\n"
        "    book_name=book['bookName'],      # 从搜索结果获取\n"
        "    author=book['author'],           # 从搜索结果获取\n"
        "    source_id=str(book['sourceId']), # 从搜索结果获取，转为字符串\n"
        "    source_name=book['sourceName'],  # 从搜索结果获取\n"
        "    url=book['url'],                 # 【关键】从搜索结果获取真实URL\n"
        "    format='epub'\n"
        ")\n"
        "```\n"
        "\n"
        "💡 提示：如果不确定参数是否正确，请先调用 sonovel_search 查看完整的搜索结果结构。"
    )
    args_schema: Type[BaseModel] = SonovelDownloadInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        book_name = kwargs.get("book_name", "")
        return f"正在下载图书：《{book_name}》"
    
    async def run(self, book_name: str, author: str, source_id: str, 
                  source_name: str, url: str, format: str = "epub", **kwargs) -> str:
        """执行下载操作
        
        Args:
            book_name: 书籍名称
            author: 作者姓名
            source_id: 书源ID
            source_name: 书源名称
            url: 书籍URL
            format: 输出格式
            
        Returns:
            下载结果字符串
        """
        try:
            # 使用缓存的插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "错误：Sonovel 插件未安装或未启用"
            
            if not plugin.get_state():
                return "错误：Sonovel 插件已禁用，请先在插件管理中启用"
            
            # 构建下载请求数据
            book_data = {
                "bookName": book_name,
                "author": author,
                "sourceId": source_id,
                "sourceName": source_name,
                "url": url,
                "format": format,
                "language": "zh_CN",  # 修复：使用 zh_CN 而非 zh
            }
            
            # 调用下载 API
            result = plugin.api_download(book_data=book_data)
            
            if result.get("code") != 200:
                return f"下载失败：{result.get('message', '未知错误')}"
            
            data = result.get("data", {})
            filename = data.get("filename", "")
            message = data.get("message", "")
            
            return (
                f"✅ 下载成功！\n\n"
                f"书名：《{book_name}》\n"
                f"作者：{author}\n"
                f"格式：{format.upper()}\n"
                f"文件名：{filename}\n"
                f"状态：{message}"
            )
            
        except Exception as e:
            return f"下载出错：{str(e)}"


class SonovelSearchAndDownloadTool(MoviePilotTool):
    """SoNovel 一键搜索并下载工具（推荐）"""
    
    name: str = "sonovel_search_and_download"
    description: str = (
        "🚀 【推荐使用】一键完成电子书搜索和下载的完整流程。\n"
        "自动执行：搜索 → 智能选择最佳结果 → 提交下载任务\n"
        "\n"
        "✨ 优势：\n"
        "- 无需手动提取参数，避免 URL 错误\n"
        "- 自动选择最匹配的书源和版本\n"
        "- 简化操作流程，提高效率\n"
        "\n"
        "📋 参数说明：\n"
        "- keyword: 【必填】搜索关键词\n"
        "- author: 【可选】作者姓名，提高匹配精度\n"
        "- format: 【可选】输出格式，默认 epub\n"
        "- source_preference: 【可选】偏好的书源名称\n"
        "\n"
        "✅ 使用示例：\n"
        "```python\n"
        "# 简单搜索并下载（自动选择第一个结果）\n"
        "sonovel_search_and_download(keyword='斗破苍穹')\n"
        "\n"
        "# 指定作者和格式\n"
        "sonovel_search_and_download(\n"
        "    keyword='斗破苍穹',\n"
        "    author='天蚕土豆',\n"
        "    format='epub'\n"
        ")\n"
        "\n"
        "# 指定偏好的书源\n"
        "sonovel_search_and_download(\n"
        "    keyword='三体',\n"
        "    author='刘慈欣',\n"
        "    source_preference='香书小说'\n"
        ")\n"
        "```\n"
        "\n"
        "💡 提示：这是最推荐的用法，避免了手动调用 sonovel_search 和 sonovel_download 的复杂性。"
    )
    args_schema: Type[BaseModel] = SonovelSearchAndDownloadInput
    
    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回给用户的提示语"""
        keyword = kwargs.get("keyword", "")
        author = kwargs.get("author", "")
        if author:
            return f"正在搜索并下载：《{keyword}》 by {author}"
        return f"正在搜索并下载：《{keyword}》"
    
    async def run(self, keyword: str, author: Optional[str] = None,
                  format: str = "epub", source_preference: Optional[str] = None,
                  **kwargs) -> str:
        """执行一键搜索并下载操作
        
        Args:
            keyword: 搜索关键词
            author: 作者姓名（可选）
            format: 输出格式
            source_preference: 偏好的书源名称（可选）
            
        Returns:
            下载结果字符串
        """
        try:
            # 获取插件实例
            plugin = _get_plugin_instance()
            
            if not plugin:
                return "❌ 错误：Sonovel 插件未安装或未启用"
            
            if not plugin.get_state():
                return "❌ 错误：Sonovel 插件已禁用，请先在插件管理中启用"
            
            # 步骤1: 执行搜索
            logger.info(f"[一键下载] 开始搜索: keyword={keyword}, author={author}")
            search_result = plugin.api_search(keyword=keyword)
            
            if search_result.get("code") != 200:
                return f"❌ 搜索失败：{search_result.get('message', '未知错误')}"
            
            books = search_result.get("data", [])
            
            if not books:
                return f"❌ 未找到与'{keyword}'相关的书籍"
            
            logger.info(f"[一键下载] 搜索到 {len(books)} 个结果")
            
            # 步飤2: 智能去重
            deduplicated_books = _deduplicate_books(books)
            logger.info(f"[一键下载] 去重后 {len(deduplicated_books)} 本不同的书籍")
                        
            # 步飤3: 智能评分并选择最佳结果
            selected_book = _select_best_book(deduplicated_books, author, source_preference)
            
            if not selected_book:
                return (
                    f"❌ 未能找到合适的书籍\n\n"
                    f"搜索到 {len(books)} 个结果，但无法匹配您的要求。\n"
                    f"建议：\n"
                    f"1. 检查书名或作者是否正确\n"
                    f"2. 尝试更简单的关键词\n"
                    f"3. 移除书源偏好限制"
                )
            
            book_name = selected_book.get("bookName", "")
            book_author = selected_book.get("author", "")
            source_id = selected_book.get("sourceId", "")
            source_name = selected_book.get("sourceName", "")
            url = selected_book.get("url", "")
            
            logger.info(
                f"[一键下载] 选择结果: 《{book_name}》 by {book_author}, "
                f"书源: {source_name} (ID: {source_id})"
            )
            
            # 步骤3: 执行下载
            book_data = {
                "bookName": book_name,
                "author": book_author,
                "sourceId": str(source_id),
                "sourceName": source_name,
                "url": url,
                "format": format,
                "language": "zh_CN",
            }
            
            download_result = plugin.api_download(book_data=book_data)
            
            if download_result.get("code") != 200:
                return (
                    f"❌ 下载失败：{download_result.get('message', '未知错误')}\n\n"
                    f"选择的书籍：《{book_name}》\n"
                    f"书源：{source_name}"
                )
            
            data = download_result.get("data", {})
            filename = data.get("filename", "")
            message = data.get("message", "")
            
            return (
                f"✅ 下载任务已提交！\n\n"
                f"📚 书名：《{book_name}》\n"
                f"✍️ 作者：{book_author}\n"
                f"📖 书源：{source_name}\n"
                f"📄 格式：{format.upper()}\n"
                f"📁 文件名：{filename}\n"
                f"📊 状态：{message}\n\n"
                f"💡 提示：下载任务已在后台执行，请稍后查看下载历史。"
            )
            
        except Exception as e:
            logger.error(f"[一键下载] 异常: {e}", exc_info=True)
            return f"❌ 下载出错：{str(e)}"
    



def get_sonovel_tools() -> List[type]:
    """获取所有 Sonovel 智能体工具"""
    return [SonovelSearchTool, SonovelDownloadTool, SonovelSearchAndDownloadTool]
