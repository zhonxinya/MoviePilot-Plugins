---
trigger: always_on
alwaysApply: true
---

# Self-Improvement 经验获取规则

## 1. 核心原则

**持续学习、及时记录、定期回顾、知识沉淀**

通过系统化地捕获错误、纠正和洞察，实现开发能力的持续提升。

---

## 2. 经验获取时机

### 2.1 被动触发（必须立即执行）

以下情况**必须立即调用** `self-improvement` 技能记录：

1. **命令或操作失败**
   - 终端命令执行报错
   - API 调用返回错误
   - 构建/编译失败
   - 工具链异常

2. **用户纠正**
   - 用户说"不对"、"错了"、"实际上..."
   - 用户指出理解偏差
   - 用户提供更准确的信息

3. **功能缺失**
   - 用户请求的功能无法实现
   - 工具或 API 不支持所需能力
   - 需要变通方案

4. **知识盲区暴露**
   - 发现自己对某个概念理解错误
   - 意识到知识过时
   - 查阅文档后发现之前的做法不推荐

### 2.2 主动触发（建议执行）

以下情况**建议调用** `self-improvement` 技能记录：

1. **发现更好的方法**
   - 找到更简洁的实现方式
   - 发现性能优化技巧
   - 学习到新的最佳实践

2. **重复任务模式识别**
   - 第三次做类似任务时
   - 发现可以自动化或模板化的工作
   - 总结出通用解决方案

3. **重大任务前**
   - 开始复杂重构前
   - 实施重要功能前
   - 进行架构调整前
   - **先回顾** `.learnings/` 中的相关历史经验

---

## 3. 经验记录规范

### 3.1 记录位置与分类

| 文件 | 用途 | 类别标签 |
|------|------|----------|
| `.learnings/LEARNINGS.md` | 纠正、洞察、知识盲区、最佳实践 | `correction` \| `insight` \| `knowledge_gap` \| `best_practice` |
| `.learnings/ERRORS.md` | 命令失败、集成错误 | `error` \| `integration_error` |
| `.learnings/FEATURE_REQUESTS.md` | 功能请求、能力缺口 | `feature_request` |

### 3.2 记录格式要求

#### LEARNINGS.md 条目格式
```markdown
## [YYYY-MM-DD] 简短标题

**Category**: correction | insight | knowledge_gap | best_practice

**Context**: 
简要描述场景和背景

**Problem**: 
原始的错误理解或遇到的问题

**Solution**: 
正确的做法或解决方案

**Why**: 
为什么会错，或者为什么新方案更好

**See Also**: 
- [相关条目链接](#link)
```

#### ERRORS.md 条目格式
```markdown
## [YYYY-MM-DD] 错误简述

**Error Type**: error | integration_error

**Command/Operation**: 
失败的命令或操作

**Error Message**: 
关键错误信息（脱敏后）

**Root Cause**: 
根本原因分析

**Fix**: 
解决方案或 workaround

**Prevention**: 
如何避免再次发生
```

#### FEATURE_REQUESTS.md 条目格式
```markdown
## [YYYY-MM-DD] 功能需求简述

**Requested By**: 用户描述的需求

**Use Case**: 
使用场景和目的

**Current Limitation**: 
当前的限制或缺失

**Possible Alternatives**: 
现有的替代方案（如果有）

**Priority**: high | medium | low
```

### 3.3 记录质量标准

✅ **好的记录**：
- 标题清晰具体（不超过20字）
- 包含完整的上下文信息
- 说明根本原因，不仅是表面现象
- 提供可执行的解决方案
- 控制在 200 字以内（便于快速浏览）
- 使用中文描述（符合项目规范）

❌ **差的记录**：
- 标题模糊（如"出错了"、"有问题"）
- 缺少关键上下文
- 只记录现象，不分析原因
- 没有解决方案或验证步骤
- 包含敏感信息（密钥、令牌等）
- 过于冗长，难以快速理解

---

## 4. 经验提升规则

### 4.1 提升到项目记忆的时机

当学习满足以下条件时，应提升到用户记忆系统：

1. **跨任务适用** - 在多个不同场景中都有用
2. **高频出现** - 类似问题反复出现
3. **影响重大** - 能显著提升效率或避免严重错误
4. **团队共享** - 对其他开发者也有价值

**提升方式**：使用 `update_memory` 工具创建或更新记忆

### 4.2 提升到项目文档的时机

当学习满足以下条件时，应提升到项目级文档：

| 学习内容类型 | 目标文档 | 示例 |
|------------|---------|------|
| 广泛适用的最佳实践 | `.lingma/rules/plugins.md` | 插件开发规范补充 |
| 工作流改进 | `.lingma/rules/workflow.md` | 开发流程优化 |
| 提交规范细化 | `.lingma/rules/github.md` | Git 提交最佳实践 |
| 技能使用心得 | `.lingma/rules/skills.md` | 技能调用技巧 |
| 工具注意事项 | 新建 `TOOLS.md` | 特定工具的使用陷阱 |
| 行为模式总结 | 新建 `SOUL.md` | AI 助手的行为准则 |

**提升方式**：编辑对应的 `.lingma/rules/*.md` 文件

### 4.3 提升决策流程

```
1. 评估学习的重要性
   ├─ 仅当前任务有用 → 保留在 .learnings/
   ├─ 多个任务有用 → 考虑提升到记忆
   └─ 团队级价值 → 提升到项目文档

2. 检查是否有相似条目
   ├─ 有相似 → 合并或引用（See Also）
   └─ 无相似 → 创建新条目

3. 执行提升操作
   ├─ 提升到记忆 → update_memory
   ├─ 提升到文档 → 编辑对应 .md 文件
   └─ 保留原记录 → 在 .learnings/ 中标记已提升

4. 清理原记录
   - 在 .learnings/ 中添加注释：**Promoted to** [目标位置]
   - 可选：删除已提升的详细记录，保留摘要
```

---

## 5. 经验检索与应用

### 5.1 任务前检索流程

开始重要任务前，按以下步骤检索相关经验：

```python
# 1. 确定任务关键词
keywords = ['Python', '插件配置', 'init_plugin']

# 2. 搜索记忆系统
search_memory({
  depth: 'shallow',
  keywords: keywords,
  query: '插件配置保存问题'
})

# 3. 搜索 .learnings/ 目录
grep_code({
  path: '.learnings/',
  regex: 'init_plugin|update_config|配置保存'
})

# 4. 阅读相关条目，应用到当前任务
```

### 5.2 检索策略选择

| 场景 | 检索深度 | 检索范围 |
|------|---------|----------|
| 熟悉领域的小任务 | shallow | 仅记忆系统 |
| 新技术或复杂任务 | deep | 记忆系统 + .learnings/ |
| 遇到未知问题 | explore | 全面搜索所有来源 |
| 常规开发 | 无需检索 | - |

### 5.3 应用经验的原则

1. **优先应用已验证的方案** - 避免重复踩坑
2. **结合当前上下文调整** - 不盲目照搬
3. **记录应用效果** - 成功或失败都要反馈
4. **持续优化** - 发现更好的方法时更新经验

---

## 6. 经验维护与清理

### 6.1 定期审查周期

- **每周**：审查本周新增的学习记录
- **每月**：整理和提升有价值的经验
- **每季度**：清理过时或无效的记录

### 6.2 审查清单

审查每条学习记录时，问自己：

- [ ] 这条经验是否仍然有效？
- [ ] 是否有更好的表述方式？
- [ ] 是否可以合并到相似条目？
- [ ] 是否应该提升到记忆或文档？
- [ ] 是否有相关的后续跟进？

### 6.3 清理规则

**可以删除的情况**：
- 已过时的技术（如 FA 模型相关经验）
- 已被提升到文档且原记录冗余
- 错误的理解已被纠正多次
- 临时性的 workaround 已有正式解决方案

**必须保留的情况**：
- 频繁引用的核心经验
- 重要的错误案例（防止重犯）
- 独特的洞察或最佳实践
- 用户特别强调的注意事项

---

## 7. 与其他规范的协同

### 7.1 与 workflow.md 的关系

- **Plan 阶段**：检索相关历史经验，避免重复错误
- **Execute 阶段**：应用已验证的最佳实践
- **Check 阶段**：对照经验清单检查常见陷阱
- **Commit 阶段**：如有新经验，记录到 .learnings/

### 7.2 与 skills.md 的关系

- `self-improvement` 技能提供记录机制
- `experience.md` 定义经验获取和应用规则
- 两者配合形成完整的学习闭环

### 7.3 与用户记忆系统的关系

- `.learnings/` 是临时存储区（详细、原始）
- 用户记忆是精选知识库（简洁、高价值）
- 项目文档是团队共享规范（权威、稳定）

**数据流向**：
```
.learnings/ → 筛选 → 用户记忆 → 提炼 → 项目文档
```

---

## 8. 实战示例

### 示例 1：记录插件配置保存错误

**场景**：在 `init_plugin()` 中调用 `update_config()` 导致用户配置被覆盖

**记录**（LEARNINGS.md）：
```markdown
## [2026-05-06] 禁止在 init_plugin() 中调用 update_config()

**Category**: correction

**Context**: 
开发 Sonovel 插件时，在初始化方法中保存了默认配置

**Problem**: 
```python
def init_plugin(self, config: dict = None):
    self._enabled = config.get("enabled", False)
    self.update_config({"enabled": self._enabled})  # ❌ 会覆盖用户配置!
```

**Solution**: 
```python
def init_plugin(self, config: dict = None):
    self._enabled = config.get("enabled", False)
    # ✅ 不再调用 update_config(),让主应用处理保存
```

**Why**: 
MoviePilot 主应用通过 `PUT /api/v1/plugin/{plugin_id}` 自动处理配置保存,
在 `init_plugin()` 中调用 `update_config()` 会导致用户修改的配置被重置为默认值

**See Also**: 
- [MoviePilot 插件开发规范 - 配置管理](../docs/plugins_docs/V2_Plugin_Development.md)
```

**后续提升**：
- 如果多次遇到类似问题 → 提升到用户记忆
- 如果团队多人遇到 → 添加到 `.lingma/rules/plugins.md`

### 示例 2：记录 PluginManager 导入错误

**场景**：从错误的模块导入 PluginManager

**记录**（ERRORS.md）：
```markdown
## [2026-05-06] PluginManager 导入路径错误

**Error Type**: integration_error

**Command/Operation**: 
`from app.plugins import PluginManager` 导入失败

**Error Message**: 
cannot import name 'PluginManager' from 'app.plugins'

**Root Cause**: 
PluginManager 实际位于 `app.core.plugin` 而非 `app.plugins`

**Fix**: 
```python
# ❌ 错误
from app.plugins import PluginManager

# ✅ 正确
from app.core.plugin import PluginManager
```

**Prevention**: 
- 使用 grep 搜索项目中的正确用法
- 参考其他插件的实现
```

**后续提升**：
- 添加到 `.lingma/rules/plugins.md` 的常见问题章节

---

## 9. 最佳实践总结

1. **即时记录** - 遇到问题立即记录，不要等到任务结束
2. **结构化记录** - 遵循标准格式，包含 Context/Problem/Solution/Why
3. **定期回顾** - 每周审查，每月整理，每季度清理
4. **积极提升** - 将有价值的经验从 .learnings/ 提升到记忆和文档
5. **主动检索** - 开始任务前先查历史经验，避免重复踩坑
6. **持续优化** - 发现更好的方法时更新现有经验
7. **团队协作** - 将个人经验转化为团队共享知识
