---
trigger: always_on
alwaysApply: true
---

# 开发工作流程规范

## 1. 工作流程总览
**Plan（分析规划） → Execute（分步执行） → Check（检查验证） → Commit（提交归档）**

每个任务必须严格遵循此四阶段流程，确保代码质量和可追溯性。

---

## 2. Plan - 分析与规划阶段

### 2.1 需求分析
- **理解意图**：明确用户需求的真实目的和预期结果
- **范围界定**：确定任务涉及的模块、文件和功能边界
- **风险评估**：识别潜在的兼容性问题、依赖冲突或性能影响
- **信息收集**：使用 `search_codebase`、`read_file`、`grep_code` 等工具全面了解现有实现

### 2.2 方案设计
- **技术选型**：选择合适的技术方案和实现路径
- **架构考虑**：评估对现有架构的影响，保持设计一致性
- **备选方案**：准备至少一个备选方案以应对实施中的问题

### 2.3 任务拆分
- **原子化任务**：将大任务拆分为可独立验证的小步骤（每步不超过50行代码变更）
- **依赖顺序**：明确任务间的先后依赖关系，形成清晰的执行序列
- **验收标准**：为每个子任务定义明确的完成标准和验证方法
- **使用 TodoWrite**：必须通过 `add_tasks` 工具创建任务列表，禁止口头承诺后补写

### 2.4 输出产物
- 清晰的任务列表（通过 `add_tasks` 创建）
- 关键文件清单和修改点说明
- 预期的测试验证方案

---

## 3. Execute - 分步执行阶段

### 3.1 执行原则
- **严格按序**：按照任务列表顺序逐一执行，不得跳步或并行执行依赖任务
- **单步聚焦**：每次只处理一个任务，完成后立即验证再进入下一步
- **最小改动**：仅修改必要的代码，避免引入无关变更或过度重构
- **实时反馈**：每完成一步更新任务状态（`update_tasks`），保持进度透明

### 3.2 编码规范遵守
- **Python 规范**: 严格遵守 PEP 8 和项目代码风格
  - 使用类型提示 (Type Hints)
  - 函数和方法必须有文档字符串
  - 变量命名清晰且具有描述性
- **插件开发规范**: 严格遵循 `.lingma/rules/plugins.md` 中的所有要求
  - 目录名必须与插件类名小写一致
  - 禁止在 `init_plugin()` 中调用 `update_config()`
  - 配置前缀必须唯一
  - 版本号三处保持一致(索引、代码、history)
- **代码风格**: 保持一致的命名规范、注释风格和代码组织方式

### 3.3 工具使用策略
- **优先语义搜索**：理解代码逻辑时优先使用 `search_codebase`
- **精确定位符号**：查找类/方法定义时使用 `lsp` 工具的 `goToDefinition`
- **批量读取文件**：多个文件内容获取时并行调用 `read_file`
- **谨慎修改文件**：优先使用 `search_replace`，仅在必要时使用 `edit_file`
- **禁止终端编辑**：不得使用 `run_in_terminal` 进行文件编辑操作

### 3.4 异常处理
- **遇到阻塞**：立即暂停并分析原因，必要时调整方案或请求用户确认
- **工具失败**：检查错误信息，尝试替代方案或手动重试（最多3次）
- **偏离计划**：如发现原计划不可行，重新进入 Plan 阶段调整方案

---

## 4. Check - 检查验证阶段

### 4.1 代码质量检查
- **语法正确性**：使用 `get_problems` 检查编译错误和 lint 警告
- **类型安全**：确认所有类型声明准确，无类型错误
- **导入检查**：验证所有 import 语句正确，无循环依赖
- **插件合规**：检查插件实现是否符合 `.lingma/rules/plugins.md` 规范
- **后端编译检查**：确保 Python 代码能通过编译检查 (`python3 -m py_compile`)
- **前端编译检查**：如使用 Vue 联邦模式，确保前端代码能通过 TypeScript 检查 (`npm run typecheck`)

### 4.2 功能验证
- **逻辑完整性**：确认所有需求点均已实现，无遗漏功能
- **边界条件**：验证空值、异常输入、极端场景的处理逻辑
- **回归测试**：确保修改未破坏现有功能的正常运行
- **性能考量**：检查是否存在不必要的重建、内存泄漏或性能瓶颈

### 4.3 代码审查要点
- **可读性**：代码是否清晰易懂，命名是否具有描述性
- **可维护性**：是否有适当的注释，复杂逻辑是否有说明
- **一致性**：是否与项目现有代码风格保持一致
- **复用性**：是否有可提取的公共逻辑或组件

### 4.4 文档与注释
- **关键逻辑注释**：复杂算法或业务逻辑必须有中文注释说明
- **API 文档**：新增公开方法需添加 JSDoc 风格注释
- **TODO 清理**：移除临时的 TODO 标记或转化为正式任务
- **变更说明**：重大改动需在相关位置添加变更说明注释

### 4.5 最终确认清单
- [ ] 所有任务状态已更新为 COMPLETE
- [ ] 无编译错误和严重 lint 警告
- [ ] 功能按预期工作,边界情况已处理
- [ ] 代码符合 Python 规范和项目约定
- [ ] 无遗留的临时文件或调试代码
- [ ] 插件开发时已遵循 plugins.md 规范(如适用)

---

## 5. Commit - 提交归档阶段

### 5.1 提交前准备
- **清理临时文件**：删除测试文件、备份文件、日志文件等临时产物
- **格式化代码**：确保代码格式符合项目规范（如需要运行格式化命令）
- **暂存区整理**：使用 `git add -p` 交互式添加，确保只包含相关改动
- **分离无关改动**：不同逻辑的修改应分开提交，不得混在一起

### 5.2 提交信息规范（遵循 github.md）
- **标题行**：使用 Conventional Commits 前缀 + 简短中文描述（≤50字符）
  - 示例：`feat: 添加媒体卡片懒加载功能`
  - 示例：`fix: 修复订阅页面数据刷新异常`
- **正文**：详细说明变更内容、原因和影响（可选但推荐）
  - 列出主要修改点（使用 `-` 开头的列表）
  - 说明解决的问题或新增的功能
  - 提及重要的技术决策或权衡考虑
- **尾部**：关联 Issue 编号或其他元数据（如 `Closes #123`）

### 5.3 原子性提交原则
- **单一职责**：每个提交只做一件事，具有明确的单一目的
- **逻辑完整**：提交的内容应该是可独立工作的完整单元
- **可回滚性**：每个提交都应该可以安全地单独回滚而不破坏构建
- **审查友好**：提交粒度应便于代码审查者理解和评估

### 5.4 提交示例
```bash
# 好的提交示例
git commit -m "feat: 实现下载历史卡片组件" -m "- 创建 DownloadHistoryCard.ets 组件" -m "- 集成媒体封面图片加载逻辑" -m "- 添加点击跳转到详情页功能"

git commit -m "fix: 修正 API 响应数据类型定义" -m "- 更新 MoviePilotModels.ets 中的接口定义" -m "- 修复可选字段缺失导致的运行时错误"
```

### 5.5 分支管理（补充）
- **功能分支**：从 `main` 或 `develop` 创建 `feature/xxx` 分支开发
- **及时同步**：定期从上游分支合并最新代码，减少冲突风险
- **合并策略**：功能完成后通过 Pull Request 合并，经过代码审查后再合入主干
- **分支清理**：合并后及时删除已完成的特性分支，保持仓库整洁

---

## 6. 特殊场景处理

### 6.1 多文件联动修改
- **分组提交**：相关联的文件修改应在同一提交中，但不同组的修改分开提交
- **顺序保证**：确保依赖关系的文件按正确顺序修改和提交
- **验证完整性**：每组修改完成后验证整体功能是否正常

### 6.2 重构任务
- **小步快跑**：将大重构拆分为多个小步骤，每步都可独立验证
- **保持功能**：重构过程中确保外部行为不变，仅改进内部实现
- **渐进式替换**：逐步替换旧实现，避免一次性大规模改动
- **充分测试**：每步重构后都要进行完整的功能验证

### 6.3 Bug 修复
- **根因分析**：先定位问题的根本原因，再制定修复方案
- **最小修复**：仅修复当前问题，避免借机进行无关的重构或优化
- **回归防护**：考虑添加测试用例防止同类问题再次出现
- **影响评估**：评估修复对其他模块的潜在影响并进行验证

### 6.4 新功能开发
- **增量实现**：先实现核心功能，再逐步完善细节和边缘情况
- **接口先行**：先定义清晰的接口和数据模型，再实现具体逻辑
- **渐进增强**：确保基础功能可用后，再添加高级特性和优化
- **文档同步**：功能实现同时更新相关文档和使用说明

---

## 7. 效率优化建议

### 7.1 并行操作最大化
- **信息收集阶段**：多个 `read_file`、`search_codebase`、`grep_code` 调用并行执行
- **独立任务**：无依赖关系的任务可以并行处理（但文件修改必须串行）
- **后台进程**：长时间运行的命令（如构建、测试）使用 `is_background=true`
- **编译检查并行**：前后端编译检查可以并行运行以节省时间
  - 后端编译检查：`python3 -m py_compile app/plugins/myplugin/__init__.py`
  - 前端编译检查：`cd app/plugins/myplugin/frontend && npm run typecheck`

### 7.2 避免重复工作
- **缓存利用**：已读取的文件内容在上下文中保留，避免重复读取
- **记忆检索**：遇到类似问题时先使用 `search_memory` 查找历史经验
- **模式复用**：识别常见模式后直接应用，无需重新分析

### 7.3 快速失败策略
- **早期验证**：在投入大量工作前先验证关键假设和技术可行性
- **及时反馈**：每步完成后立即检查，发现问题尽早纠正
- **果断调整**：发现方向错误时立即停止并重新规划，不执着于原方案

---

## 8. 经验总结与沉淀（防止遗忘）

### 8.1 任务结束时的经验捕获流程

**每个任务完成后必须执行以下步骤**：

```typescript
// 1. 回顾任务全过程
const reflection = {
  whatWentWell: [],      // 做得好的地方
  whatWentWrong: [],     // 遇到的问题和错误
  lessonsLearned: [],    // 学到的新知识或技巧
  improvements: []       // 下次可以改进的地方
}

// 2. 检查是否需要记录经验
if (reflection.whatWentWrong.length > 0 || reflection.lessonsLearned.length > 0) {
  // 调用 self-improvement 技能记录
  Skill("self-improvement")
}

// 3. 检索是否有相关历史经验可提升
search_memory({
  depth: 'shallow',
  query: '当前任务相关的经验'
})
```

### 8.2 经验捕获触发条件

**必须记录的情况**：
- ✅ 遇到任何错误或异常（即使已解决）
- ✅ 发现新的最佳实践或优化技巧
- ✅ 意识到之前的理解有误
- ✅ 找到重复任务的通用解决方案
- ✅ 用户提供了重要纠正或反馈
- ✅ 使用了新的 API、工具或方法

**建议记录的情况**：
- 💡 任务耗时超出预期，分析原因
- 💡 发现了代码中的潜在问题（即使未影响功能）
- 💡 总结出可复用的模式或模板
- 💡 对某个技术点有了更深的理解

### 8.3 经验记录时机选择

| 时机 | 适用场景 | 优势 |
|------|---------|------|
| **任务进行中** | 遇到阻塞性问题时 | 记忆新鲜，细节清晰 |
| **任务完成后立即** | 常规任务结束时 | 完整回顾，避免遗漏 |
| **每日结束时** | 多个小任务的汇总 | 批量处理，提高效率 |
| **每周回顾时** | 系统性总结和提炼 | 发现模式，提升到文档 |

**推荐策略**：
- 重大问题 → 立即记录（不要等到任务结束）
- 一般问题 → 任务完成后立即记录
- 小洞察 → 可以累积到每日/每周统一记录

### 8.4 经验总结模板

#### 快速记录模板（5分钟完成）
```markdown
## [YYYY-MM-DD] [任务名称] 经验总结

**任务类型**: feat | fix | refactor | chore

**遇到的问题**:
1. [问题1简述] - [根本原因] - [解决方案]
2. [问题2简述] - [根本原因] - [解决方案]

**学到的新知识**:
- [知识点1]: [简要说明]
- [知识点2]: [简要说明]

**下次改进**:
- [改进点1]
- [改进点2]

**相关文件**:
- [修改的文件列表]

**关联 Issue**: #xxx
```

#### 深度总结模板（重要任务使用）
```markdown
## [YYYY-MM-DD] [任务名称] 深度经验总结

### 任务背景
[描述任务的起因、目标和预期结果]

### 实施过程
1. **初始方案**: [最初的想法和计划]
2. **遇到的挑战**: 
   - [挑战1]: [详细描述 + 如何解决]
   - [挑战2]: [详细描述 + 如何解决]
3. **方案调整**: [如果有，说明为什么调整和如何调整]
4. **最终实现**: [最终采用的方案和理由]

### 关键技术决策
- **决策1**: [描述] - [原因] - [权衡考虑]
- **决策2**: [描述] - [原因] - [权衡考虑]

### 踩坑记录
| 问题 | 原因 | 解决方案 | 预防措施 |
|------|------|---------|----------|
| [问题1] | [原因] | [方案] | [预防] |
| [问题2] | [原因] | [方案] | [预防] |

### 最佳实践发现
- [实践1]: [描述 + 适用场景]
- [实践2]: [描述 + 适用场景]

### 性能与优化
- **瓶颈发现**: [描述]
- **优化措施**: [描述]
- **效果对比**: [前后对比数据]

### 可复用组件/模式
- [组件/模式1]: [说明 + 代码片段]
- [组件/模式2]: [说明 + 代码片段]

### 待跟进事项
- [ ] [事项1]
- [ ] [事项2]

### 相关资源
- [文档链接]
- [参考代码]
- [类似问题讨论]
```

### 8.5 经验分类与标签系统

**按内容分类**：
- `bug_fix` - Bug 修复经验
- `performance` - 性能优化经验
- `architecture` - 架构设计经验
- `api_usage` - API 使用经验
- `tool_chain` - 工具链使用经验
- `best_practice` - 最佳实践
- `pitfall` - 常见陷阱
- `pattern` - 设计模式/代码模式

**按技术领域分类**：
- `python` - Python 语言相关
- `fastapi` - FastAPI 框架相关
- `sqlalchemy` - 数据库 ORM 相关
- `plugin` - 插件开发相关
- `agent` - 智能体工具相关
- `network` - 网络请求相关
- `storage` - 数据存储相关
- `testing` - 测试相关
- `frontend` - 前端开发相关

**按严重程度分类**：
- `critical` - 严重问题（导致崩溃、数据丢失等）
- `major` - 主要问题（影响核心功能）
- `minor` - 次要问题（影响体验但不影响功能）
- `info` - 信息性（知识补充、技巧分享）

**标签使用示例**：
```markdown
**Tags**: bug_fix, python, plugin, major
```

### 8.6 经验提升决策树

```
任务完成
  ↓
是否有新经验？
  ├─ 否 → 结束
  └─ 是 ↓
    经验类型？
      ├─ 仅当前任务有用 → 记录到 .learnings/
      ├─ 类似任务会用到 → 记录到 .learnings/ + 标记为 reusable
      ├─ 跨项目通用 → 记录到 .learnings/ + 提升到用户记忆
      └─ 团队级价值 → 记录到 .learnings/ + 提升到项目文档
        ↓
    是否已有相似经验？
      ├─ 是 → 合并或添加 See Also 引用
      └─ 否 → 创建新条目
        ↓
    添加到合适的分类和标签
        ↓
    设置提醒（如需后续跟进）
```

### 8.7 防止遗忘的具体措施

#### 措施 1：强制检查点
在每个任务的 Check 阶段增加检查项：
```markdown
### 4.5 最终确认清单（更新版）
- [ ] 所有任务状态已更新为 COMPLETE
- [ ] 无编译错误和严重 lint 警告
- [ ] 功能按预期工作，边界情况已处理
- [ ] 代码符合 Python 规范和项目约定
- [ ] 无遗留的临时文件或调试代码
- [ ] **已回顾任务过程，识别需要记录的经验** ← 新增
- [ ] **已将重要经验记录到 .learnings/ 或提升到记忆/文档** ← 新增
```

#### 措施 2：自动化提醒
在 Commit 阶段前自动检查：
```typescript
// 伪代码：提交前检查
beforeCommit() {
  const recentTasks = getCompletedTasks(last24Hours)
  const hasNewExperience = recentTasks.some(task => 
    task.hasErrors || task.hasLearnings || task.userCorrections
  )
  
  if (hasNewExperience && !experienceRecorded) {
    prompt("检测到可能有新经验未记录，是否现在记录？")
  }
}
```

#### 措施 3：每日回顾仪式
每天工作结束时执行：
1. 查看今天完成的任务列表
2. 逐个回顾是否有值得记录的经验
3. 集中记录到 `.learnings/` 对应文件
4. 标记需要提升的重要经验
5. 设置明天的待办事项（如有跟进任务）

#### 措施 4：每周总结会议（个人）
每周固定时间（如周五下午）：
1. 审查本周所有学习记录
2. 识别模式和趋势
3. 将有价值的经验提升到记忆或文档
4. 清理过时或重复的记录
5. 制定下周的学习目标

#### 措施 5：使用记忆锚点
为重要经验设置易于检索的关键词：
```markdown
**Keywords**: Python, 插件配置, init_plugin, update_config, 配置保存

这样可以通过多种方式检索到：
- search_memory(keywords: ['Python', '插件配置'])
- grep_code(regex: 'init_plugin|update_config')
```

### 8.8 经验检索与应用闭环

**应用经验的完整流程**：

```
开始新任务
  ↓
检索相关历史经验（search_memory + grep .learnings/）
  ↓
应用已验证的方案
  ↓
执行任务
  ↓
记录新经验（如果有）
  ↓
评估是否需要提升
  ↓
提升到记忆或文档（如需要）
  ↓
形成闭环，持续优化
```

**检索优先级**：
1. **用户记忆** - 最高优先级，已验证的高价值经验
2. **项目文档** - 团队共享的规范和最佳实践
3. **.learnings/** - 详细的原始记录，包含更多上下文

### 8.9 常见遗忘场景及对策

| 遗忘场景 | 原因 | 对策 |
|---------|------|------|
| 问题解决后立即继续下一个任务 | 急于完成任务 | 设置"经验记录"为任务的必要步骤 |
| 认为"这个很简单，不用记" | 低估未来价值 | 建立"凡是有收获就记录"的习惯 |
| 觉得"以后用不到" | 预测不准确 | 记录成本低，宁可多记也不要漏记 |
| 不知道记在哪里 | 流程不清晰 | 遵循 experience.md 的分类规则 |
| 忘记之前遇到过类似问题 | 时间久远 | 定期回顾 + 设置检索关键词 |
| 记录了但找不到 | 检索困难 | 使用标准化格式 + 丰富标签 |

### 8.10 经验沉淀的价值体现

**短期价值**（当天/当周）：
- 避免在同一问题上反复浪费时间
- 快速恢复中断的工作上下文
- 提高类似任务的执行效率

**中期价值**（当月/当季）：
- 形成个人的知识库和方法论
- 识别自己的薄弱环节，针对性提升
- 发现工作中的模式和规律

**长期价值**（半年/全年）：
- 构建系统化的专业技能体系
- 为团队贡献可复用的经验和规范
- 实现从"解决问题"到"预防问题"的转变

---

## 9. MoviePilot 项目特定工作流

### 9.1 插件开发工作流

**前置准备**:
- [ ] 阅读 `.lingma/rules/plugins.md` 了解插件开发规范
- [ ] 确定插件类型(Vuetify JSON 模式或 Vue 联邦模式)
- [ ] 规划插件功能和 API 设计

**开发步骤**:
1. **创建插件目录结构**
   ```bash
   # V2 专用插件
   mkdir -p app/plugins/myplugin
   # 或跨版本兼容插件
   mkdir -p app/plugins/myplugin
   ```

2. **实现插件主类**
   - 继承 `_PluginBase`
   - 实现必需方法(`init_plugin`, `get_state`, `stop_service` 等)
   - 确保目录名与类名小写一致

3. **添加元数据**
   - 在 `package.json` 或 `package.v2.json` 中添加条目
   - 确保 `version` 与 `plugin_version` 一致
   - 添加 `history` 变更记录

4. **后端编译检查**
   ```bash
   # Python 语法检查
   python3 -m py_compile app/plugins/myplugin/__init__.py
   
   # 批量编译检查（如果有多文件）
   python3 -m compileall app/plugins/myplugin
   
   # 类型检查（如果使用了类型提示）
   mypy app/plugins/myplugin/ --ignore-missing-imports
   
   # 代码规范检查
   pylint app/plugins/myplugin/ --disable=C0114,C0115,C0116  # 忽略缺少文档字符串的警告
   ```

5. **前端编译检查（如果使用 Vue 联邦模式）**
   ```bash
   # 进入前端项目目录
   cd app/plugins/myplugin/frontend
   
   # 安装依赖
   npm install
   
   # TypeScript 类型检查
   npm run typecheck
   # 或
   npx tsc --noEmit
   
   # 代码格式检查
   npm run lint
   
   # 构建检查（不输出文件，只检查能否成功构建）
   npm run build --dry-run
   # 或直接运行构建命令查看是否有错误
   npm run build
   ```

6. **集成编译检查**
   ```bash
   # 检查前后端集成
   # 1. 确保后端服务正常启动
   python -m pytest tests/test_myplugin_backend.py  # 测试后端功能
   
   # 2. 如果有前端测试，运行前端测试
   npm run test  # 运行前端单元测试
   
   # 3. 检查 API 接口连通性
   curl -X GET "http://localhost:3001/api/v1/plugin/MyPlugin/status"  # 替换为实际的插件API路径
   
   # 4. 检查插件配置加载
   python -c "from app.plugins.myplugin import MyPlugin; print(MyPlugin().get_state())"
   ```

7. **本地测试**
   ```bash
   # 启动 MoviePilot 进行联调
   # 访问 http://localhost:3000 测试插件功能
   # 检查控制台是否有错误信息
   # 验证所有功能是否按预期工作
   ```

8. **验证关键功能**
   - [ ] 插件能在插件市场显示
   - [ ] 配置页面正常渲染
   - [ ] API 端点正确注册(如有)
   - [ ] 定时服务正常工作(如有)
   - [ ] 智能体工具可被调用(如有)
   - [ ] 前端组件正常加载(如使用 Vue 联邦模式)
   - [ ] 前后端通信正常
   - [ ] 所有编译检查通过
   - [ ] 所有测试通过

### 9.2 智能体技能开发工作流

**技能位置**: `config/agent/skills/<skill-name>/`

**必需文件**:
- `SKILL.md` - 技能定义和使用指南(核心文件)
- `README.md` - 详细说明文档(可选但推荐)
- `EXAMPLES.md` - 使用示例集合(可选但推荐)

**编译和验证**:
- **语法检查**: 使用 markdown lint 工具检查语法
  ```bash
  # 如果安装了 markdownlint
  mdl config/agent/skills/myskill/SKILL.md
  ```
- **内容验证**: 确保所有引用的工具确实存在
  ```bash
  # 检查 SKILL.md 中引用的工具是否在代码中存在
  grep -r "tool1\|tool2\|tool3" app/
  ```

**SKILL.md 结构**:
```yaml
---
name: skill-name
version: 1
description: >-
  技能的简短描述,说明何时使用此技能
allowed-tools: tool1, tool2, tool3
---

# Skill Name

## When to Use
- 场景1
- 场景2

## Tools
- `tool1`: 工具说明
- `tool2`: 工具说明

## Workflow
### Step 1: ...
### Step 2: ...

## Example Conversations
...
```

**开发流程**:
1. 分析用户需求,确定技能触发条件
2. 编写 SKILL.md,定义工作流程
3. 实现所需的工具函数(如需新增)
4. 创建丰富的使用示例
5. 测试技能在实际对话中的表现
6. 根据反馈迭代优化

### 9.3 后端 API 开发工作流

**API 位置**: `app/api/endpoints/`

**开发步骤**:
1. **定义路由**
   ```python
   from fastapi import APIRouter
   
   router = APIRouter()
   
   @router.get("/endpoint", summary="接口说明")
   def get_data():
       return {"data": []}
   ```

2. **注册路由**
   - 在 `app/api/apiv1.py` 中引入并注册 router

3. **添加认证**
   ```python
   from app.api.servcookie import get_current_active_user
   
   @router.get("/protected")
   def protected_endpoint(user = Depends(get_current_active_user)):
       pass
   ```

4. **编写文档**
   - 每个端点必须有 `summary` 和 `description`
   - 使用 Pydantic 模型定义请求/响应 schema

5. **测试 API**
   ```bash
   # 启动后访问 Swagger UI
   # http://localhost:3000/docs
   ```

### 9.4 数据库操作工作流

**模型位置**: `app/db/models/`
**操作类位置**: `app/db/*_oper.py`

**新增表步骤**:
1. **创建模型**
   ```python
   # app/db/models/my_model.py
   from sqlalchemy import Column, Integer, String
   from app.db.init import Base
   
   class MyModel(Base):
       __tablename__ = "my_table"
       id = Column(Integer, primary_key=True)
       name = Column(String)
   ```

2. **创建迁移脚本**
   ```bash
   alembic revision -m "add my_table"
   ```

3. **编写操作类**(可选)
   ```python
   # app/db/my_oper.py
   from app.db.models.my_model import MyModel
   
   class MyOper:
       def get_by_id(self, id: int):
           return MyModel.query.filter_by(id=id).first()
   ```

4. **执行迁移**
   ```bash
   alembic upgrade head
   ```

### 9.5 前端组件开发工作流

**前端位置**: `public/` (静态资源) 或独立前端仓库

**Vue 联邦插件开发**:
1. **创建前端项目**
   ```bash
   npm create vite@latest my-plugin -- --template vue-ts
   cd my-plugin
   yarn
   ```

2. **配置 Module Federation**
   ```typescript
   // vite.config.ts
   import federation from '@originjs/vite-plugin-federation'
   
   export default defineConfig({
     plugins: [
       federation({
         name: 'MyPlugin',
         filename: 'remoteEntry.js',
         exposes: {
           './Page': './src/components/Page.vue',
           './Config': './src/components/Config.vue',
         },
         shared: {
           vue: { requiredVersion: false, generate: false },
         },
         format: 'esm'
       })
     ],
     build: {
       target: 'esnext',
       minify: false,
       cssCodeSplit: true,
     }
   })
   ```

3. **构建并部署**
   ```bash
   yarn typecheck
   yarn build
   # 将 dist/assets/ 复制到插件目录
   cp -r dist/assets ../MoviePilot-Plugins/plugins.v2/myplugin/
   ```

4. **后端声明渲染模式**
   ```python
   def get_render_mode(self) -> Tuple[str, str]:
       return "vue", "dist/assets"
   ```

### 9.6 测试工作流

**测试位置**: `tests/`

**运行测试**:
```bash
# 运行所有测试
python tests/run.py

# 运行特定测试文件
python -m pytest tests/test_metainfo.py -v

# 运行带覆盖率的测试
python -m pytest tests/ --cov=app --cov-report=html

# 插件特定测试
python -m pytest tests/test_myplugin.py -v  # 替换为实际的插件测试文件
```

**编写测试**:
```python
import pytest
from app.core.metainfo import MetaInfo

def test_meta_info_parsing():
    meta = MetaInfo("The.Movie.2024.1080p.WEB-DL.mkv")
    assert meta.title == "The Movie"
    assert meta.year == 2024
```

**插件测试最佳实践**:
```bash
# 1. 后端功能测试
python -m pytest tests/test_myplugin_backend.py  # 测试后端 API 和逻辑

# 2. 前端组件测试（如果使用 Vue 联邦模式）
npm run test  # 运行前端单元测试

# 3. 集成测试
python -m pytest tests/test_myplugin_integration.py  # 测试前后端集成

# 4. API 端点测试
python -m pytest tests/test_myplugin_api.py  # 测试 API 端点功能
```

### 9.7 调试技巧

**日志查看**:
```bash
# 实时查看日志
tail -f config/logs/moviepilot.log

# 过滤特定模块
grep "PluginManager" config/logs/moviepilot.log

# 调整日志级别
# 在 .moviepilot.env 中设置
LOG_LEVEL=DEBUG
```

**常见问题排查**:
1. **插件未加载**: 检查 `app/core/plugin.py` 日志
2. **API 未注册**: 访问 `/docs` 确认路由存在
3. **配置不生效**: 检查数据库 `systemconfig` 表
4. **前端白屏**: 查看浏览器控制台错误

---

## 10. 工作流程检查清单(完整版)

### Plan 阶段
- [ ] 明确用户需求和预期结果
- [ ] 确定任务范围和边界
- [ ] 评估风险和依赖
- [ ] 收集足够的背景信息
- [ ] 设计技术方案和备选方案
- [ ] 拆分为原子化任务
- [ ] 创建任务列表(add_tasks)
- [ ] **检索相关历史经验** ← 新增

### Execute 阶段
- [ ] 按顺序执行任务
- [ ] 每步完成后立即验证
- [ ] 遵守 Python 和插件开发规范
- [ ] 及时更新任务状态
- [ ] **遇到问题立即记录到 .learnings/** ← 新增

### Check 阶段
- [ ] 检查编译错误和 lint 警告
- [ ] 验证类型安全和导入正确
- [ ] 确认功能完整性
- [ ] 测试边界条件
- [ ] 检查代码可读性和一致性
- [ ] 清理 TODO 和临时注释
- [ ] **回顾任务过程,识别新经验** ← 新增

### Commit 阶段
- [ ] 清理临时文件
- [ ] 格式化代码
- [ ] 整理暂存区(git add -p)
- [ ] 分离无关改动
- [ ] 编写规范的提交信息
- [ ] **确认所有重要经验已记录** ← 新增
- [ ] **提升有价值的经验到记忆或文档** ← 新增
- [ ] 提交代码

### 插件开发特定检查(如适用)
- [ ] 插件目录名与类名小写一致
- [ ] 未在 `init_plugin()` 中调用 `update_config()`
- [ ] 版本号三处保持一致
- [ ] API 端点在 `/docs` 中可见
- [ ] 智能体工具能被正确调用
- [ ] Vue 联邦组件能正常加载
- [ ] 后端代码通过编译检查
- [ ] 前端代码通过编译检查(如使用 Vue 联邦模式)
- [ ] 所有测试通过
- [ ] 集成测试通过
