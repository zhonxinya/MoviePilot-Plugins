# Sonovel 插件

SoNovel 图书搜索与下载插件，基于 SoNovel API 实现多书源聚合搜索和电子书下载功能。

## 功能特性

- ✅ **聚合搜索**：支持多书源同时搜索，返回统一结果
- ✅ **格式转换**：支持 EPUB、PDF、TXT、MOBI 等多种格式
- ✅ **自动下载**：一键下载电子书到指定目录
- ✅ **API 接口**：提供 RESTful API 供外部调用
- ✅ **远程命令**：支持通过命令行触发搜索
- ✅ **Vue 前端**：现代化的 Web 界面，支持搜索、浏览和下载

## 安装方法

1. 将本插件目录放置在 `plugins.v2/sonovel/` 路径下
2. 确保 `package.v2.json` 已正确配置
3. 安装依赖：`pip install requests pydantic`
4. 重启 MoviePilot 后端服务
5. 在插件市场中找到并安装此插件

## 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| enabled | 布尔值 | false | 是否启用插件 |
| api_url | 字符串 | https://your-api-server.com | SoNovel API 地址 |
| default_format | 枚举值 | epub | 默认下载格式（epub/pdf/txt/mobi） |
| save_path | 字符串 | 空 | 书籍保存路径，留空则使用插件数据目录 |

## API 接口

### 1. 搜索图书

**端点**：`/api/v1/plugin/SonovelPlugin/search`

**方法**：GET / POST

**参数**：
- `keyword` (必需): 搜索关键词

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "bookName": "书名",
      "author": "作者",
      "url": "书籍URL",
      "sourceId": "书源ID",
      "sourceName": "书源名称",
      "category": "分类",
      "latestChapter": "最新章节",
      "coverUrl": "封面URL"
    }
  ]
}
```

### 2. 下载图书

**端点**：`/api/v1/plugin/SonovelPlugin/download`

**方法**：POST

**请求体**：
```json
{
  "sourceId": "书源ID",
  "sourceName": "书源名称",
  "url": "书籍URL",
  "bookName": "书名",
  "author": "作者",
  "format": "epub",
  "language": "zh"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "filepath": "/path/to/book.epub",
    "filename": "书名_作者.epub",
    "size": 1234567
  }
}
```

## 远程命令

- `/sonovel_search` - 触发图书搜索（开发中）

## 使用示例

### 通过 API 搜索

```bash
curl -X GET "http://localhost:3000/api/v1/plugin/SonovelPlugin/search?keyword=三体" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 通过 API 下载

```bash
curl -X POST "http://localhost:3000/api/v1/plugin/SonovelPlugin/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "1",
    "sourceName": "书源名称",
    "url": "https://example.com/book",
    "bookName": "三体",
    "author": "刘慈欣",
    "format": "epub"
  }'
```

## 技术架构

```
SonovelPlugin/
├── __init__.py      # 插件主类，处理配置、API、事件
├── client.py        # SoNovel API HTTP 客户端
├── models.py        # Pydantic 数据模型定义
├── agent_tools.py   # AI 智能体工具
├── frontend/        # Vue 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   └── BookCard.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── dist/            # 构建产物（自动生成）
└── package.v2.json  # 插件元数据
```

## 依赖项

- `requests` - HTTP 请求库
- `pydantic` - 数据验证和模型

## 前端开发

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物将自动输出到 `dist/` 目录，MoviePilot 会自动加载。

## 版本历史

### v1.1.0 (2026-05-05)

- 添加 Vue 前端界面
- 实现图书搜索页面
- 实现下载进度显示
- 添加下载历史记录
- 支持侧栏导航入口

### v1.0.0 (2026-05-01)

- 初始版本发布
- 实现聚合搜索功能
- 实现书籍下载功能
- 提供 RESTful API 接口
- 支持多种电子书格式

## 注意事项

1. 请确保 SoNovel API 服务可访问
2. 首次使用建议在配置页面测试 API 连接
3. 大文件下载可能需要较长时间，请耐心等待
4. 部分书源可能存在反爬机制，建议合理控制请求频率

## 常见问题

**Q: 搜索无结果？**
A: 检查 API 地址是否正确，确认关键词拼写无误。

**Q: 下载失败？**
A: 检查网络连接，确认书源 URL 有效，查看日志获取详细错误信息。

**Q: 如何更改保存路径？**
A: 在插件配置页面设置 `save_path` 字段，或使用绝对路径。
