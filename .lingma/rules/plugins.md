---
trigger: always_on
alwaysApply: true
---

# MoviePilot 插件开发规范

## 1. 核心原则

**宿主优先、契约对齐、版本一致、分身友好**

所有插件开发必须遵循 MoviePilot V2 架构,确保与宿主系统的完美集成。

---

## 2. 插件架构理解

### 2.1 三仓库协作模型

MoviePilot 插件系统涉及三个仓库的协作:

| 仓库 | 职责 |
|------|------|
| **MoviePilot-Plugins** | 插件源码、市场索引、图标、文档 |
| **MoviePilot** (后端) | 插件加载、生命周期管理、API注册、配置管理 |
| **MoviePilot-Frontend** (前端) | 插件市场UI、配置页渲染、Vue联邦组件加载 |

**关键认知:**
- ✅ 本仓库只提供插件实现和元数据
- ✅ 运行时能力由 MoviePilot 后端提供
- ✅ UI渲染由 MoviePilot-Frontend 负责
- ❌ 不要在本仓库复制宿主逻辑

### 2.2 两种渲染模式

#### Vuetify JSON 模式 (默认)
- **适用场景**: 简单配置表单、详情页、轻量数据列表
- **实现方式**: `get_form()` / `get_page()` 返回 JSON 结构
- **前端渲染**: 由 MoviePilot-Frontend 自动渲染

#### Vue 联邦模式
- **适用场景**: 复杂交互、完整页面、自定义UI
- **实现方式**: 提供 Vue 组件,通过 Module Federation 动态加载
- **必需方法**: `get_render_mode()` 返回 `("vue", "dist/assets")`
- **前端加载**: 从 `/api/v1/plugin/remotes` 获取远程组件

---

## 3. 目录结构与命名规范

### 3.1 插件目录位置

```
MoviePilot-Plugins/
├── plugins/              # 默认/V1 插件目录
│   └── myplugin/         # 插件目录 (类名小写)
│       ├── __init__.py   # 插件主类
│       ├── requirements.txt  # 可选:额外依赖
│       └── README.md     # 可选:插件文档
├── plugins.v2/           # V2 专用插件目录
│   └── myplugin/         # V2 专用实现
├── icons/                # 插件图标
├── package.json          # 默认插件索引
└── package.v2.json       # V2 优先插件索引
```

### 3.2 命名规则 (强制)

**目录名 = 插件类名的小写**

```python
# ✅ 正确
class MyPlugin(_PluginBase):  # 类名: MyPlugin
    pass
# 目录: plugins/myplugin/ 或 plugins.v2/myplugin/

# ❌ 错误
class MyPlugin(_PluginBase):
    pass
# 目录: plugins/my_plugin/  (不匹配!)
```

### 3.3 版本选择策略

| 场景 | 推荐方案 |
|------|---------|
| V2 专用实现 | 放在 `plugins.v2/`,元数据写入 `package.v2.json` |
| 跨版本兼容(代码相同) | 放在 `plugins/`,在 `package.json` 中声明 `"v2": true` |
| V1/V2 差异大 | 拆分到 `plugins.v2/`,不要强行共用 |

**版本加载优先级:**
1. 优先读取 `package.v2.json`
2. 若不存在,回退到 `package.json` 中标记 `"v2": true` 的插件

---

## 4. 插件类实现规范

### 4.1 最小插件骨架

```python
from typing import Any, Dict, List, Tuple, Optional

from app.plugins import _PluginBase


class MyPlugin(_PluginBase):
    # ===== 必需属性 =====
    plugin_name = "我的插件"           # 展示名称
    plugin_desc = "插件描述"           # 简短描述
    plugin_icon = "Moviepilot_A.png"  # 图标文件名
    plugin_version = "1.0.0"          # 版本号(必须与 package.*.json 一致)
    plugin_author = "your-name"       # 作者
    author_url = "https://github.com/your-name"  # 作者主页
    plugin_config_prefix = "myplugin_"  # 配置前缀(必须唯一)
    plugin_order = 50                 # 加载顺序(越小越早)
    auth_level = 1                    # 权限级别

    # ===== 运行时状态 =====
    _enabled = False

    def init_plugin(self, config: dict = None):
        """根据配置初始化插件(必需)"""
        config = config or {}
        self._enabled = bool(config.get("enabled"))

    def get_state(self) -> bool:
        """返回插件运行状态(必需)"""
        return self._enabled

    def stop_service(self):
        """清理后台资源(必需,可为空)"""
        pass
```

### 4.2 必需方法清单

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `init_plugin(config)` | 读取配置并生效 | None |
| `get_state()` | 返回运行状态 | bool |
| `get_api()` | 声明插件API | List[dict] |
| `get_form()` | 声明配置页 | Tuple[List[dict], Dict] |
| `get_page()` | 声明详情页 | List[dict] \| None |
| `stop_service()` | 停用插件时清理 | None |

### 4.3 常用可选方法

| 方法 | 用途 |
|------|------|
| `get_command()` | 注册远程命令(`/xxx`) |
| `get_service()` | 注册定时服务 |
| `get_dashboard()` | 声明仪表板内容 |
| `get_dashboard_meta()` | 声明多仪表板元信息 |
| `get_render_mode()` | 选择渲染模式(vuetify/vue) |
| `get_actions()` | 注册工作流动作 |
| `get_agent_tools()` | 注册智能体工具 |
| `get_sidebar_nav()` | Vue全页插件侧栏入口 |
| `get_module()` | 重载系统模块 |

---

## 5. 配置与数据管理规范

### 5.1 配置读写 (标准做法)

```python
def init_plugin(self, config: dict = None):
    """从配置初始化"""
    config = config or {}
    self._enabled = bool(config.get("enabled", False))
    self._api_url = config.get("api_url", "default_url")
    # ⚠️ 不要在 init_plugin 中调用 update_config()!
    # 配置保存由 MoviePilot 主应用自动处理

def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
    """返回配置表单和默认模型"""
    return [
        {
            "component": "VForm",
            "content": [
                {
                    "component": "VSwitch",
                    "props": {
                        "model": "enabled",  # 对应 v-model
                        "label": "启用插件"
                    }
                }
            ]
        }
    ], {
        "enabled": False,  # 默认值
    }
```

**⚠️ 重要提醒:**
- ❌ **禁止**在 `init_plugin()` 中调用 `self.update_config()`
- ✅ 配置保存由 MoviePilot 主应用通过 `PUT /api/v1/plugin/{plugin_id}` 自动处理
- ✅ `init_plugin()` 只负责从传入的 `config` 读取并应用配置

### 5.2 数据持久化

```python
from pathlib import Path

# 方式1: 结构化小数据 → plugindata 表
self.save_data("runtime_state", {"count": 10})
data = self.get_data("runtime_state")

# 方式2: 文件存储 → 插件独立数据目录
report_path: Path = self.get_data_path() / "report.txt"
report_path.write_text("content", encoding="utf-8")
```

### 5.3 分身友好写法

```python
# ✅ 推荐: 使用类名动态获取
def _get_plugin_id(self) -> str:
    return self.__class__.__name__

# ❌ 避免: 硬编码插件ID
def _get_plugin_id(self) -> str:
    return "MyPlugin"  # 分身时会冲突!

# ✅ 配置前缀必须唯一
plugin_config_prefix = "myplugin_unique_"
```

---

## 6. 常见能力实现规范

### 6.1 远程命令 (`get_command`)

```python
from app.core.event import eventmanager, Event
from app.schemas.types import EventType

@staticmethod
def get_command() -> List[Dict[str, Any]]:
    """注册远程命令"""
    return [
        {
            "cmd": "/my_plugin_run",
            "event": EventType.PluginAction,
            "desc": "执行我的插件",
            "category": "插件命令",
            "data": {"action": "my_plugin_run"},  # 用 action 路由
        }
    ]

@eventmanager.register(EventType.PluginAction)
def run_command(self, event: Event):
    """监听并处理命令"""
    event_data = event.event_data or {}
    if event_data.get("action") != "my_plugin_run":
        return
    # 执行业务逻辑
    self.post_message({"title": "完成", "text": "任务已执行"})
```

### 6.2 插件 API (`get_api`)

```python
def get_api(self) -> List[Dict[str, Any]]:
    """声明插件API,注册到 /api/v1/plugin/{PluginID}/path"""
    return [
        {
            "path": "/history",
            "endpoint": self.get_history,
            "methods": ["GET"],
            "auth": "bear",  # bear: 前端调用; apikey: 外部系统
            "summary": "查询历史",
            "description": "返回最近的处理记录",
        }
    ]

def get_history(self):
    """API端点实现"""
    history = self.get_data("history") or []
    return {"code": 200, "data": history}
```

**认证方式选择:**
- `bear`: 前端插件页面调用(携带用户Token)
- `apikey`: 外部系统调用(携带API Key)
- ❌ 无特殊原因不要匿名开放

### 6.3 定时服务 (`get_service`)

```python
from apscheduler.triggers.cron import CronTrigger

def get_service(self) -> List[Dict[str, Any]]:
    """注册公共服务(定时任务)"""
    if not self.get_state():
        return []
    return [
        {
            "id": "MyPlugin.Refresh",  # 必须稳定且唯一
            "name": "我的插件定时刷新",
            "trigger": CronTrigger.from_crontab("0 */6 * * *"),  # 每6小时
            "func": self.refresh,
            "kwargs": {},
        }
    ]

def refresh(self):
    """定时执行的任务"""
    logger.info("执行定时刷新...")
    # 业务逻辑

def stop_service(self):
    """停用插件时清理资源"""
    # 如果有自定义线程/调度器,在这里清理
    pass
```

### 6.4 仪表板 (`get_dashboard`)

```python
def get_dashboard(self, key: str, **kwargs) -> Optional[Tuple[Dict, Dict, List]]:
    """返回仪表板内容"""
    col_config = {"cols": 12, "md": 6}  # 列配置
    global_config = {
        "title": "我的插件",
        "refresh": 30,  # 自动刷新间隔(秒)
        "border": True,
    }
    page = [
        {
            "component": "VAlert",
            "props": {
                "type": "info",
                "text": f"当前数据: {self._current_data}",
            }
        }
    ]
    return col_config, global_config, page
```

**多仪表板支持:**
```python
def get_dashboard_meta(self) -> Optional[List[Dict[str, str]]]:
    """声明多个仪表板"""
    return [
        {"key": "summary", "name": "摘要"},
        {"key": "trend", "name": "趋势"},
    ]
```

### 6.5 智能体工具 (`get_agent_tools`)

```python
from typing import List, Optional, Type
from pydantic import BaseModel, Field
from app.agent.tools.base import MoviePilotTool

class SearchInput(BaseModel):
    """工具输入参数"""
    explanation: str = Field(..., description="工具使用说明")
    keyword: str = Field(..., description="搜索关键词")

class MySearchTool(MoviePilotTool):
    """自定义搜索工具"""
    name: str = "my_search_tool"
    description: str = "Search for data by keyword. Use when user needs to find specific information."
    args_schema: Type[BaseModel] = SearchInput

    def get_tool_message(self, **kwargs) -> Optional[str]:
        """返回友好的提示消息"""
        return f"正在搜索: {kwargs.get('keyword', '')}"

    async def run(self, keyword: str, **kwargs) -> str:
        """执行工具逻辑(异步)"""
        try:
            # 访问上下文信息
            session_id = self._session_id
            user_id = self._user_id
            
            # 执行业务逻辑
            results = await self._search(keyword)
            
            # 发送实时消息
            await self.send_tool_message(f"找到 {len(results)} 条结果", title="搜索完成")
            
            return f"搜索完成: {keyword}, 共 {len(results)} 条结果"
        except Exception as e:
            return f"搜索失败: {str(e)}"

def get_agent_tools(self) -> List[type]:
    """注册智能体工具"""
    return [MySearchTool]
```

**工具实现要求:**
- ✅ 必须继承 `MoviePilotTool`
- ✅ 必须实现 `run()` 异步方法
- ✅ 必须实现 `get_tool_message()` 方法
- ✅ 必须定义 `name` 和 `description` 属性
- ✅ `description` 要详细描述功能和使用场景

### 6.6 工作流动作 (`get_actions`)

```python
def get_actions(self) -> List[Dict[str, Any]]:
    """注册工作流动作"""
    return [
        {
            "id": "my_plugin_action",
            "name": "执行我的插件动作",
            "func": self.run_action,
            "kwargs": {"mode": "fast"},  # 预置参数
        }
    ]

def run_action(self, content: ActionContent, **kwargs):
    """工作流动作执行函数"""
    # 第一个参数固定为 ActionContent
    mode = kwargs.get("mode", "normal")
    # 业务逻辑
    return {"result": "success"}
```

---

## 7. 渲染模式详细规范

### 7.1 Vuetify JSON 模式 (默认)

**无需额外配置**,直接实现 `get_form()` / `get_page()` 即可。

**JSON 结构规则:**
```python
{
    "component": "VTextField",  # Vuetify 组件名
    "props": {
        "model": "fieldName",   # v-model 绑定
        "label": "标签",
        "show": "condition"     # v-show 条件
    },
    "on": {
        "click": "handleClick"  # 事件处理
    },
    "content": [...]  # 子组件
}
```

**支持的表达式:**
- `{{ variable }}`: 变量插值
- `onXXX`: 事件绑定
- `props.model`: 双向绑定
- `props.show`: 条件显示

### 7.2 Vue 联邦模式

**步骤1: 后端声明渲染模式**
```python
def get_render_mode(self) -> Tuple[str, str]:
    """返回 Vue 模式和构建产物路径"""
    return "vue", "dist/assets"
```

**步骤2: 前端创建 Vue 组件**

参考 `docs/UI_docs/module-federation-guide.md`,必需组件:

| 组件 | 暴露名 | 用途 |
|------|--------|------|
| Page.vue | `./Page` | 插件详情弹窗 |
| Config.vue | `./Config` | 配置页面 |
| Dashboard.vue | `./Dashboard` | 仪表板小组件 |
| AppPage.vue | `./AppPage` | 侧栏全页(可选) |

**步骤3: Vite 配置**
```typescript
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    federation({
      name: 'MyPlugin',
      filename: 'remoteEntry.js',
      exposes: {
        './Page': './src/components/Page.vue',
        './Config': './src/components/Config.vue',
        './Dashboard': './src/components/Dashboard.vue',
      },
      shared: {
        vue: { requiredVersion: false, generate: false },
        vuetify: { requiredVersion: false, generate: false, singleton: true },
      },
      format: 'esm'
    })
  ],
  build: {
    target: 'esnext',   // 必须!
    minify: false,
    cssCodeSplit: true,
  }
})
```

**步骤4: 构建并部署**
```bash
yarn typecheck  # 类型检查
yarn build      # 构建
# 将 dist/assets/ 复制到插件目录
```

**步骤5: 后端 `get_form()` 返回**
```python
def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
    """Vue 模式下返回 None + 默认配置"""
    return None, {
        "enabled": False,
        "api_url": "default_url",
    }
```

### 7.3 侧栏全页入口 (`get_sidebar_nav`)

**仅 Vue 模式插件支持:**
```python
def get_sidebar_nav(self) -> List[Dict[str, Any]]:
    """声明侧栏导航入口"""
    return [
        {
            "nav_key": "main",           # URL段,不能含 /?#空格
            "title": "我的插件首页",
            "icon": "mdi-puzzle",
            "section": "system",         # 分组: start/discovery/subscribe/organize/system
            "permission": "manage",      # 权限: subscribe/discovery/search/manage/admin
            "order": 10,                 # 同组内排序
        }
    ]
```

**多入口支持:**
```python
def get_sidebar_nav(self) -> List[Dict[str, Any]]:
    return [
        {"nav_key": "main", "title": "首页", ...},
        {"nav_key": "settings", "title": "设置", ...},
    ]
```

**前端组件暴露名规则:**
- `nav_key: "main"` → 尝试加载 `AppPage` → 回退 `Page`
- `nav_key: "settings"` → 尝试加载 `AppPageSettings` → 回退 `AppPage` → 回退 `Page`

---

## 8. 公共服务封装建议

**优先使用宿主帮助类,不要自行读取系统配置:**

```python
from app.helper.downloader import DownloaderHelper
from app.helper.mediaserver import MediaServerHelper
from app.helper.notification import NotificationHelper

# ✅ 推荐: 通过帮助类获取已启用的实例
def download_file(self, name: str):
    service = DownloaderHelper().get_service(name=name)
    if not service:
        return False
    downloader = service.instance
    return downloader.download(...)

# ❌ 避免: 自行读取配置
from app.core.config import settings
downloader_config = settings.DOWNLOADER_CONFIG  # 不推荐!
```

**常用帮助类:**
- `DownloaderHelper`: 下载器管理
- `MediaServerHelper`: 媒体服务器管理
- `NotificationHelper`: 通知渠道管理

---

## 9. 元数据管理规范

### 9.1 package.json / package.v2.json

```json
{
  "MyPlugin": {
    "name": "我的插件",
    "description": "插件简介",
    "labels": "工具,自动化",
    "version": "1.0.0",           // 必须与 plugin_version 一致!
    "icon": "Moviepilot_A.png",   // 图标文件名或HTTP URL
    "author": "your-name",
    "level": 1,                   // 可见权限级别
    "history": {
      "v1.0.0": "初始版本"
    },
    "release": true,              // 是否使用GitHub Release打包
    "v2": true                    // 仅在 package.json 中使用,标记V2兼容
  }
}
```

### 9.2 版本一致性检查 (发布前必做)

**三处版本号必须一致:**
1. ✅ `package.v2.json` 或 `package.json` 中的 `version`
2. ✅ 插件类中的 `plugin_version`
3. ✅ `history` 中最新一条变更说明

```bash
# 校验脚本示例
grep -r "plugin_version" plugins.v2/myplugin/__init__.py
grep -A1 "\"MyPlugin\"" package.v2.json
```

---

## 10. 调试与校验流程

### 10.1 Python 层校验

```bash
# 语法检查
python3 -m py_compile plugins.v2/myplugin/__init__.py

# 批量编译检查
python3 -m compileall plugins.v2/myplugin

# 空白符检查
git diff --check
```

### 10.2 API 层校验

```bash
# 启动 MoviePilot 后检查
# 访问 http://localhost:3000/docs
# 确认 API 注册在 /api/v1/plugin/MyPlugin/...
```

### 10.3 前端层校验 (Vue模式)

```bash
cd frontend-project
yarn typecheck  # TypeScript 类型检查
yarn build      # 构建联邦产物
# 确认 dist/assets/ 包含 remoteEntry.js
```

### 10.4 宿主联调 (必须!)

以下场景**必须**在真实 MoviePilot 环境中验证:
- ✅ `get_api()` 是否成功注册
- ✅ `get_service()` 是否出现在服务列表
- ✅ `get_dashboard()` 是否正常显示
- ✅ Vue 远程组件是否能加载
- ✅ `get_sidebar_nav()` 是否出现在侧栏

---

## 11. 发布清单

**发布前逐项确认:**

- [ ] 插件目录在 `plugins/` 或 `plugins.v2/` 下位置正确
- [ ] 目录名与类名小写一致 (如 `MyPlugin` → `myplugin/`)
- [ ] 元数据已写入正确的索引文件 (`package.json` 或 `package.v2.json`)
- [ ] 索引里的 `version` 与代码里的 `plugin_version` 一致
- [ ] `history` 已补齐本次变更说明
- [ ] 若使用 Release 分发,条目已声明 `"release": true`
- [ ] Python 代码完成最小语法校验
- [ ] 若有 Vue 远程组件,构建产物已更新到 `dist/assets/`
- [ ] **不在 `init_plugin()` 中调用 `update_config()`**
- [ ] **配置前缀 `plugin_config_prefix` 唯一**

---

## 12. 常见问题与排查

### Q1: 插件为什么没有显示在插件市场?

**排查步骤:**
1. 检查 `package.v2.json` 或 `package.json` 中是否有该插件条目
2. 确认目录名与类名小写一致
3. 检查 `__init__.py` 是否存在且语法正确
4. 查看 MoviePilot 后端日志

### Q2: 插件 API 为什么没有注册成功?

**排查步骤:**
1. 检查 `get_api()` 是否正确返回列表
2. 确认 `endpoint` 指向的方法存在
3. 查看 `/docs` 中是否出现路由
4. 检查 `MoviePilot/app/api/endpoints/plugin.py` 中的注册逻辑

### Q3: Vue 联邦页面为什么没有出现在侧栏?

**排查步骤:**
1. 确认 `get_render_mode()` 返回 `("vue", ...)`
2. 确认 `get_sidebar_nav()` 已实现且返回非空列表
3. 检查 `nav_key` 是否符合规范(不含 `/` `?` `#` 空格)
4. 检查 `section` 和 `permission` 是否在允许范围内
5. 确认前端 `AppPage.vue` 组件已正确暴露
6. 查看 `MoviePilot-Frontend/src/utils/federationLoader.ts` 日志

### Q4: 配置保存后刷新页面恢复默认值?

**原因:** 可能在 `init_plugin()` 中调用了 `update_config()`

**解决:**
```python
# ❌ 错误
def init_plugin(self, config: dict = None):
    self._enabled = config.get("enabled", False)
    self.update_config({"enabled": self._enabled})  # 会覆盖用户配置!

# ✅ 正确
def init_plugin(self, config: dict = None):
    self._enabled = config.get("enabled", False)
    # 不再调用 update_config(),让主应用处理保存
```

### Q5: 智能体工具无法被调用?

**排查步骤:**
1. 确认 `get_agent_tools()` 返回工具类列表
2. 确认工具类继承自 `MoviePilotTool`
3. 确认实现了 `run()` 和 `get_tool_message()` 方法
4. 检查 `name` 和 `description` 是否清晰明确
5. 查看智能体日志确认工具是否注册成功

### Q6: 插件页面 API 返回 404 Not Found?

**错误现象:**
```
GET /api/v1/plugin/page/Talebook HTTP/1.1 404 Not Found
```

**常见原因:**

1. **缺少 `get_render_mode()` 方法**
   - Vue 联邦模式插件必须实现此方法声明渲染模式
   - 如果使用了 `PluginVueApp` 组件但没有声明渲染模式,会导致页面路由注册失败

2. **前端资源未构建或路径错误**
   - `dist/assets/` 目录为空或缺少关键文件
   - `get_render_mode()` 返回的路径与实际构建产物位置不匹配

**解决方案:**

```python
# ✅ 正确: Vue 联邦模式必须实现 get_render_mode()
def get_render_mode(self) -> Tuple[str, str]:
    """获取渲染模式,返回 Vue 联邦模式和构建产物路径"""
    return "vue", "dist/assets"

# ❌ 错误: 使用 PluginVueApp 但未声明渲染模式
def get_page(self) -> List[dict]:
    return [
        {
            'component': 'PluginVueApp',
            'props': {
                'plugin_id': self.plugin_id,
                'page_name': 'Page'
            }
        }
    ]
```

**完整修复流程:**

1. **添加渲染模式声明**
   ```python
   def get_render_mode(self) -> Tuple[str, str]:
       return "vue", "dist/assets"
   ```

2. **构建前端资源**
   ```bash
   cd frontend/
   npm run build
   # 或
   yarn build
   ```

3. **验证构建产物**
   ```bash
   # 确认 dist/assets/ 包含以下文件:
   # - remoteEntry.js (必需)
   # - __federation_expose_Page-*.js
   # - __federation_expose_Config-*.js
   # - 其他 JS/CSS 资源文件
   ```

4. **重新加载插件**
   - 在 MoviePilot 管理界面停止并重新启动插件
   - 或重启整个 MoviePilot 服务

5. **验证 API 端点**
   ```bash
   # 访问 Swagger UI 确认路由已注册
   curl http://localhost:3000/api/v1/plugin/page/Talebook
   
   # 应该返回:
   # {"render_mode": "vue", "page": [...]}
   ```

**注意事项:**
- ⚠️ Vuetify JSON 模式(默认)不需要 `get_render_mode()`,直接返回 JSON 即可
- ⚠️ Vue 联邦模式必须同时满足: 实现 `get_render_mode()` + 构建前端资源
- ⚠️ `get_render_mode()` 返回的路径必须与 vite.config.js 中的 `outDir` 和 `assetsDir` 配置一致
- ⚠️ 修改 Python 代码后必须重新加载插件才能生效

### Q7: 插件加载失败 - Can't instantiate abstract class?

**错误现象:**
```
ERROR: 加载插件 Talebook 出错：Can't instantiate abstract class Talebook without an implementation for abstract method 'get_api'
TypeError: Can't instantiate abstract class Talebook without an implementation for abstract method 'get_api'
```

**根本原因:**

MoviePilot V2 插件基类 `_PluginBase` 定义了多个**抽象方法**,子类必须实现所有必需方法才能实例化。

**常见缺失的方法:**

1. **`get_api()`** - 声明插件API端点(必需)
   - ❌ 错误: 使用其他名称如 `get_api_endpoints()`、`register_api()`
   - ✅ 正确: 方法名必须是 `get_api()`

2. **其他必需方法** (已在 4.2 节列出):
   - `init_plugin(config)` 
   - `get_state()`
   - `get_form()`
   - `get_page()`
   - `stop_service()`

**解决方案:**

```python
# ❌ 错误: 使用了错误的方法名
@staticmethod
def get_api_endpoints() -> List[Dict[str, any]]:
    return []

# ✅ 正确: 使用标准方法名 get_api()
def get_api(self) -> List[Dict[str, Any]]:
    """声明插件API,注册到 /api/v1/plugin/{PluginID}/path"""
    return [
        {
            "path": "/search",
            "endpoint": self.search_books,
            "methods": ["GET"],
            "auth": "bear",
            "summary": "搜索电子书",
            "description": "根据关键词搜索电子书",
        }
    ]
```

**完整检查清单:**

开发新插件时,确保实现以下所有必需方法:

```python
class MyPlugin(_PluginBase):
    # 1. ✅ 初始化方法
    def init_plugin(self, config: dict = None):
        config = config or {}
        self._enabled = bool(config.get("enabled", False))
    
    # 2. ✅ 状态查询
    def get_state(self) -> bool:
        return self._enabled
    
    # 3. ✅ API 声明 (容易遗漏!)
    def get_api(self) -> List[Dict[str, Any]]:
        return []  # 如果没有 API,返回空列表
    
    # 4. ✅ 配置表单
    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        return [...], {...}
    
    # 5. ✅ 详情页面
    def get_page(self) -> List[dict]:
        return [...]
    
    # 6. ✅ 服务清理
    def stop_service(self):
        pass
```

**调试技巧:**

如果看到 "Can't instantiate abstract class" 错误:

1. **查看错误信息**,确认缺少哪个抽象方法
2. **对照 4.2 节必需方法清单**,逐一检查是否都已实现
3. **检查方法名拼写**,确保完全匹配(区分大小写)
4. **检查方法签名**,参数和返回值类型要正确
5. **重启插件**,让更改生效

**常见陷阱:**

| 错误做法 | 正确做法 | 说明 |
|---------|---------|------|
| `get_api_endpoints()` | `get_api()` | 方法名必须准确 |
| `@staticmethod` 装饰器 | 不加装饰器 | 需要访问 `self` |
| 返回 `None` | 返回 `[]` | 必须返回列表类型 |
| 忽略此方法 | 至少返回空列表 | 即使没有 API 也要实现 |

**相关经验:**

此问题与 Q6 (插件页面 404) 经常同时出现,都是因为对 MoviePilot V2 插件契约理解不完整。建议同时参考 Q6 的解决方案。

### Q8: get_page() 中使用 self.plugin_id 报错?

**错误现象:**
```
ERROR: 插件 Talebook 调用方法 get_page 出错: 'Talebook' object has no attribute 'plugin_id'
AttributeError: 'Talebook' object has no attribute 'plugin_id'
```

**根本原因:**

MoviePilot V2 插件基类 `_PluginBase` **没有** `plugin_id` 属性。这是一个常见的误解。

**正确的做法:**

使用 `self.__class__.__name__` 动态获取插件ID(类名):

```python
def get_page(self) -> List[dict]:
    return [
        {
            'component': 'PluginVueApp',
            'props': {
                # ❌ 错误: plugin_id 属性不存在
                # 'plugin_id': self.plugin_id,
                
                # ✅ 正确: 使用类名作为插件ID
                'plugin_id': self.__class__.__name__,
                'page_name': 'Page'
            }
        }
    ]
```

**为什么这样做:**

1. **插件ID = 类名**: MoviePilot 使用插件类名作为唯一标识符
   - `class Talebook(_PluginBase)` → ID 为 `"Talebook"`
   - `class Sonovel(_PluginBase)` → ID 为 `"Sonovel"`

2. **分身友好**: 使用 `self.__class__.__name__` 而非硬编码字符串
   ```python
   # ✅ 推荐: 分身时自动适配
   'plugin_id': self.__class__.__name__  # "Talebook" 或 "TalebookCopy"
   
   # ❌ 避免: 硬编码会导致分身冲突
   'plugin_id': 'Talebook'  # 分身时仍然是 "Talebook",会冲突!
   ```

3. **其他需要使用插件ID的场景**:
   ```python
   # API 路径中
   def get_api(self):
       return [{
           "path": f"/{self.__class__.__name__.lower()}/action",
           ...
       }]
   
   # 日志记录
   logger.info(f"{self.__class__.__name__} 插件初始化完成")
   
   # 数据保存
   self.save_data(f"{self.__class__.__name__}_cache", data)
   ```

**完整示例:**

```python
class MyPlugin(_PluginBase):
    plugin_name = "我的插件"
    plugin_version = "1.0.0"
    
    def get_page(self) -> List[dict]:
        """获取插件详情页面"""
        return [
            {
                'component': 'PluginVueApp',
                'props': {
                    'plugin_id': self.__class__.__name__,  # ✅ 正确
                    'page_name': 'Page'
                }
            }
        ]
    
    def get_api(self) -> List[Dict[str, Any]]:
        """注册插件API"""
        plugin_id = self.__class__.__name__
        return [
            {
                "path": f"/action",
                "endpoint": self.handle_action,
                "methods": ["POST"],
                "auth": "bear",
            }
        ]
```

**常见错误对照表:**

| 场景 | ❌ 错误做法 | ✅ 正确做法 |
|------|-----------|----------|
| Vue组件传递 | `self.plugin_id` | `self.__class__.__name__` |
| API路径拼接 | `f"/{self.plugin_id}/..."` | `f"/{self.__class__.__name__}/..."` |
| 日志输出 | `logger.info(f"{self.plugin_id}...")` | `logger.info(f"{self.__class__.__name__}...")` |
| 数据键名 | `f"config_{self.plugin_id}"` | `f"config_{self.__class__.__name__}"` |

**注意事项:**
- ⚠️ `_PluginBase` 中没有 `plugin_id`、`id` 等属性
- ⚠️ 不要自行添加 `self.plugin_id = "MyPlugin"` 这样的属性
- ⚠️ 始终使用 `self.__class__.__name__` 动态获取
- ⚠️ 如果需要小写ID,使用 `self.__class__.__name__.lower()`

---

## 13. 最佳实践总结

### ✅ 推荐做法

1. **宿主优先**: 复用 `_PluginBase` 提供的能力,不要重复造轮子
2. **分身友好**: 使用 `self.__class__.__name__` 而非硬编码ID
3. **配置隔离**: `plugin_config_prefix` 必须唯一
4. **版本一致**: 索引、代码、history 三处版本号保持同步
5. **错误处理**: 所有异步操作添加 try-except
6. **日志记录**: 关键操作记录日志,便于排查问题
7. **资源清理**: `stop_service()` 中清理线程、调度器等资源

### ❌ 严格禁止

1. ❌ 在 `init_plugin()` 中调用 `update_config()`
2. ❌ 硬编码插件ID字符串
3. ❌ 自行读取系统配置(应使用帮助类)
4. ❌ 忽略异步操作的异常处理
5. ❌ 在插件中复制宿主逻辑
6. ❌ 版本号不一致就发布

---

## 14. 相关文档索引

**本仓库文档:**
- [V2 插件开发指南](../docs/plugins_docs/V2_Plugin_Development.md)
- [仓库维护指南](../docs/plugins_docs/Repository_Guide.md)
- [FAQ 索引](../docs/plugins_docs/FAQ.md)

**宿主仓库文档:**
- [MoviePilot 后端](https://github.com/jxxghp/MoviePilot)
  - `app/core/plugin.py`: 插件管理器
  - `app/api/endpoints/plugin.py`: 插件API端点
  - `app/plugins/__init__.py`: 插件基类
- [MoviePilot-Frontend 前端](https://github.com/jxxghp/MoviePilot-Frontend)
  - `docs/module-federation-guide.md`: Vue联邦开发指南
  - `src/utils/federationLoader.ts`: 联邦加载器

**FAQ 专题:**
- [扩展消息推送渠道](../docs/plugins_docs/faq/01-extend-notification-channel.md)
- [实现远程命令响应](../docs/plugins_docs/faq/02-remote-command-handler.md)
- [对外暴露API](../docs/plugins_docs/faq/03-expose-plugin-api.md)
- [注册定时服务](../docs/plugins_docs/faq/04-register-service.md)
- [注册智能体工具](../docs/plugins_docs/faq/16-register-agent-tools.md)
- ...更多见 `docs/plugins_docs/faq/`

---

## 15. 结论

开发 MoviePilot V2 插件的核心要点:

1. **运行时契约对齐宿主** `_PluginBase`
2. **索引元数据与插件代码保持一致**
3. **渲染模式与前端加载方式匹配**
4. **配置管理遵循标准流程**(不在 `init_plugin` 中保存配置)
5. **分身友好设计**(不硬编码ID,配置前缀唯一)

做到这五点,插件的开发、升级、迁移、分身和发布都会更加顺利。

---

**最后更新**: 2026-05-06  
**维护者**: MoviePilot Team
