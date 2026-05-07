# Talebook 电子书管理插件

## 功能特性

- 🔍 **搜索电子书**: 支持关键词搜索 Talebook 服务器上的电子书
- 📥 **下载电子书**: 下载电子书到本地指定目录
- 📤 **上传电子书**: 将本地电子书上传到 Talebook 服务器
- 📚 **浏览书库**: 查看最近添加和热门书籍
- 🔖 **书架管理**: 管理收藏和阅读进度 (待实现)

## 配置说明

### 基本配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| 启用插件 | 是否启用此插件 | ✅ / ❌ |
| 服务器地址 | Talebook 服务器的 URL | `http://192.168.1.100:8080` |
| 用户名 | Talebook 账号用户名 | `admin` |
| 密码 | Talebook 账号密码 | `******` |
| 下载保存路径 | 电子书下载的本地保存路径 | `/downloads/ebooks` |

### 使用示例

#### 1. 搜索电子书

在聊天窗口输入:
```
/tb-search 三体
```

#### 2. 下载电子书

在聊天窗口输入:
```
/tb-download 12345
```
其中 `12345` 是书籍 ID。

## API 参考

### 搜索书籍

```python
books = plugin.search_books(keyword="三体")
# 返回: [{'id': 123, 'title': '三体', 'author': '刘慈欣', ...}]
```

### 下载书籍

```python
filepath = plugin.download_book(book_id=123, format="epub")
# 返回: '/downloads/ebooks/三体_刘慈欣.epub'
```

### 上传书籍

```python
success = plugin.upload_book(file_path="/path/to/book.epub")
# 返回: True/False
```

### 获取最近书籍

```python
books = plugin.get_recent_books(limit=20)
# 返回最近添加的 20 本书
```

### 获取热门书籍

```python
books = plugin.get_hot_books(limit=20)
# 返回热门的 20 本书
```

## 注意事项

1. **服务器要求**: 需要自行搭建 Talebook 服务器
   - GitHub: https://github.com/talebook/talebook
   
2. **文件格式支持**: 
   - 下载: epub, mobi, pdf, azw3 等
   - 上传: epub, mobi, pdf, txt 等

3. **权限要求**: 
   - 搜索和浏览: 普通用户权限
   - 下载: 需要登录
   - 上传: 可能需要管理员权限 (取决于服务器配置)

4. **网络要求**: 确保 MoviePilot 能够访问 Talebook 服务器

## 常见问题

### Q: 连接失败怎么办?

A: 检查以下几点:
1. 服务器地址是否正确 (不要包含末尾的 `/`)
2. 服务器是否正常运行
3. 防火墙是否允许访问
4. 用户名和密码是否正确

### Q: 下载的文件在哪里?

A: 文件会保存在配置的"下载保存路径"中,文件名格式为: `{书名}_{作者}.{格式}`

### Q: 支持哪些电子书格式?

A: 支持的格式取决于 Talebook 服务器的配置,常见格式包括:
- EPUB (推荐)
- MOBI
- PDF
- AZW3
- TXT

## 开发计划

- [ ] 支持书架同步
- [ ] 支持阅读进度同步
- [ ] 支持批量下载
- [ ] 支持自动分类保存
- [ ] 支持元数据编辑

## 技术支持

如有问题或建议,请访问:
- GitHub Issues: https://github.com/jxxghp/MoviePilot-Plugins/issues

## 许可证

MIT License
