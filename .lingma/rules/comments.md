---
trigger: always_on
alwaysApply: true
---

# 代码注释规范

## 1. 核心原则

**中文优先、清晰简洁、及时更新、TODO 必标**

所有代码注释必须使用中文，未完成的功能必须明确标注 TODO。

---

## 2. 注释语言要求

### 2.1 强制使用中文

**规则**：除代码本身外，所有注释必须使用中文。

**适用范围**：
- ✅ 文件头注释
- ✅ 类/接口注释
- ✅ 方法/函数注释
- ✅ 行内注释
- ✅ 区块注释
- ✅ TODO 说明

**例外情况**：
- 技术术语可保留英文（如 API、HTTP、JSON）
- 专有名词可保留英文（如 HarmonyOS、ArkTS）
- 代码示例中的变量名可使用英文

**示例**：

✅ **正确**：
```typescript
// 获取用户信息
function getUserInfo(userId: string): UserInfo {
  // 调用 API 获取数据
  const response = await http.get(`/api/user/${userId}`)
  return response.data
}
```

❌ **错误**：
```typescript
// Get user information
function getUserInfo(userId: string): UserInfo {
  // Call API to fetch data
  const response = await http.get(`/api/user/${userId}`)
  return response.data
}
```

### 2.2 中英文混用规范

**允许的情况**：
- 技术术语：API、HTTP、JSON、XML、SQL
- 框架名称：React、Vue、HarmonyOS、ArkUI
- 协议名称：TCP/IP、HTTPS、WebSocket
- 通用缩写：ID、URL、IP、CPU、GPU

**禁止的情况**：
- ❌ 完整句子使用英文
- ❌ 说明性文字使用英文
- ❌ 业务逻辑描述使用英文

---

## 3. TODO 标注规范

### 3.1 必须标注 TODO 的场景

**以下情况必须添加 TODO 注释**：

1. **未完成的功能**
   ```typescript
   // TODO: 实现用户权限验证逻辑
   function checkPermission(user: User): boolean {
     return true // 临时返回，待实现
   }
   ```

2. **待优化的代码**
   ```typescript
   // TODO: 优化查询性能，添加缓存机制
   function getDataList(): Data[] {
     return database.query('SELECT * FROM data')
   }
   ```

3. **已知但未修复的 Bug**
   ```typescript
   // TODO: 修复并发场景下的数据竞争问题
   // Issue: #123
   function updateData(id: string, data: Data): void {
     // 当前实现存在竞态条件
   }
   ```

4. **临时解决方案（Workaround）**
   ```typescript
   // TODO: 等待 API v2 上线后替换此临时方案
   // 当前使用 v1 API，存在性能问题
   const result = await legacyApi.fetch()
   ```

5. **需要后续补充的内容**
   ```typescript
   // TODO: 添加单元测试
   // TODO: 补充错误处理
   // TODO: 完善日志记录
   function complexLogic(): void {
     // ...
   }
   ```

6. **依赖外部条件的功能**
   ```typescript
   // TODO: 需要后端提供 /api/export 接口后再实现
   function exportData(): Promise<void> {
     throw new Error('Not implemented')
   }
   ```

### 3.2 TODO 注释格式

**标准格式**：
```typescript
// TODO: [简短描述] - [可选：详细说明]
// TODO: [描述] - Issue: #[编号]
// TODO: [描述] - @author [姓名] - [日期]
```

**示例**：
```typescript
// TODO: 实现数据导出功能 - 支持 CSV 和 Excel 格式
// TODO: 修复内存泄漏问题 - Issue: #456
// TODO: 重构状态管理逻辑 - @author 张三 - 2026-04-30
```

**多行 TODO**：
```typescript
// TODO: 实现完整的错误处理机制
// 1. 添加错误码定义
// 2. 实现错误映射表
// 3. 添加用户友好的错误提示
// 4. 记录错误日志到服务器
```

### 3.3 TODO 优先级标记

**可选的优先级标记**：

```typescript
// TODO(HIGH): 紧急修复 - 影响核心功能
// TODO(MEDIUM): 中等优先级 - 影响用户体验
// TODO(LOW): 低优先级 - 优化建议
```

**使用场景**：
- `HIGH` - 必须在下一个版本前完成
- `MEDIUM` - 应该在近期完成
- `LOW` - 有时间再做

### 3.4 TODO 清理规则

**必须清除 TODO 的情况**：
- ✅ 功能已完成实现
- ✅ Bug 已修复
- ✅ 优化已实施
- ✅ 临时方案已替换

**禁止的行为**：
- ❌ 长期保留已完成的 TODO
- ❌ 添加 TODO 但不跟进
- ❌ 提交包含 TODO 的代码而不说明原因

**最佳实践**：
1. 每个 TODO 都应该有明确的完成标准
2. 定期审查 TODO 列表（建议每周）
3. 将重要的 TODO 转化为正式的任务或 Issue
4. 在 PR/MR 中说明新增的 TODO 及其原因

---

## 4. 注释类型与规范

### 4.1 文件头注释

**必须包含**：
- 文件用途说明
- 作者信息（可选）
- 创建日期（可选）
- 最后更新日期（可选）

**示例**：
```typescript
/**
 * 用户管理模块
 * 
 * 提供用户注册、登录、信息管理等功能
 * 
 * @author 张三
 * @created 2026-04-30
 * @updated 2026-05-01
 */
```

### 4.2 类/接口注释

**必须包含**：
- 类/接口的用途
- 主要功能说明
- 使用示例（复杂类）

**示例**：
```typescript
/**
 * 用户信息服务类
 * 
 * 负责用户信息的获取、更新和管理
 * 提供缓存机制以提高性能
 * 
 * @example
 * ```typescript
 * const service = new UserService()
 * const user = await service.getUserById('123')
 * ```
 */
class UserService {
  // ...
}
```

### 4.3 方法/函数注释

**必须包含**：
- 功能说明
- 参数说明（@param）
- 返回值说明（@returns）
- 异常说明（@throws，如有）

**示例**：
```typescript
/**
 * 根据用户 ID 获取用户信息
 * 
 * @param userId - 用户唯一标识
 * @returns 用户信息对象，如果用户不存在则返回 null
 * @throws {ValidationError} 当 userId 格式不正确时抛出
 * 
 * @example
 * ```typescript
 * const user = await getUserById('user_123')
 * if (user) {
 *   console.log(user.name)
 * }
 * ```
 */
async function getUserById(userId: string): Promise<User | null> {
  // ...
}
```

**简化版（简单函数）**：
```typescript
/**
 * 计算两个数的和
 */
function add(a: number, b: number): number {
  return a + b
}
```

### 4.4 行内注释

**使用场景**：
- 解释复杂的逻辑
- 说明算法原理
- 标注注意事项
- 解释为什么这样做（Why，而非 What）

**示例**：
```typescript
// 使用二分查找提高搜索效率（时间复杂度 O(log n)）
const index = binarySearch(sortedArray, target)

// 注意：此处必须深拷贝，避免引用污染
const clonedData = JSON.parse(JSON.stringify(originalData))

// 兼容旧版本 API，v2.0 后可移除此判断
if (apiVersion < 2) {
  return legacyFormat(data)
}
```

**禁止的做法**：
```typescript
// ❌ 冗余注释（代码已经很清晰）
const count = items.length // 获取数量

// ❌ 废话注释
i++ // i 加 1

// ❌ 过时的注释
// 使用冒泡排序（实际已改为快速排序）
```

### 4.5 区块注释

**使用场景**：
- 分隔不同的逻辑块
- 说明一段代码的整体目的
- 标注重要的业务流程

**示例**：
```typescript
// ==================== 数据验证 ====================
if (!validateInput(data)) {
  throw new ValidationError('输入数据不合法')
}

// ==================== 数据处理 ====================
const processedData = transformData(data)

// ==================== 数据保存 ====================
await saveToDatabase(processedData)
```

---

## 5. ArkTS 特殊注释规范

### 5.1 装饰器注释

**@Component 注释**：
```typescript
/**
 * 用户卡片组件
 * 
 * 显示用户基本信息，支持点击跳转到详情页
 * 
 * @state userName - 用户名
 * @state userAvatar - 用户头像 URL
 */
@Component
struct UserCard {
  @State userName: string = ''
  @State userAvatar: string = ''
  
  build() {
    // ...
  }
}
```

**@Builder 注释**：
```typescript
/**
 * 构建用户头像组件
 * 
 * @param size - 头像尺寸（像素）
 * @param showBorder - 是否显示边框
 */
@Builder
function UserAvatar(size: number, showBorder: boolean = true) {
  // 注意：@Builder 中不能定义局部变量
  Image(this.avatarUrl)
    .width(size)
    .height(size)
    .borderRadius(size / 2)
}
```

### 5.2 状态管理注释

```typescript
@Component
struct MyComponent {
  /**
   * 组件内部状态 - 计数器的当前值
   * 修改此值会触发 UI 重新渲染
   */
  @State count: number = 0
  
  /**
   * 从父组件传递的参数 - 标题文本
   * 单向数据流，子组件不应直接修改
   */
  @Prop title: string = ''
  
  /**
   * 与父组件双向绑定的状态
   * 使用 $variableName 语法传递
   */
  @Link isActive: boolean
}
```

---

## 6. 注释质量检查清单

### 6.1 必须检查的项目

提交代码前，确认：

- [ ] 所有注释使用中文
- [ ] 未完成的功能已标注 TODO
- [ ] TODO 描述清晰具体
- [ ] 复杂逻辑有充分的注释说明
- [ ] 公共 API 有完整的 JSDoc 注释
- [ ] 没有冗余或过时的注释
- [ ] 注释与代码保持一致
- [ ] 没有遗留的调试注释

### 6.2 常见错误

❌ **错误示例**：
```typescript
// FIXME: 这个有问题（太模糊）
// HACK: 先这样写（没有说明原因）
// XXX: 需要改（没有说明怎么改）
// TODO: later（没有时间计划）
```

✅ **正确示例**：
```typescript
// FIXME: 并发场景下可能出现数据不一致 - Issue: #789
// HACK: 由于 API 限制，暂时使用轮询方式，等待 WebSocket 支持
// XXX: 此处的类型转换不安全，需要重构数据模型
// TODO: 在下个 Sprint 中实现批量导入功能 - 预计 2026-05-15
```

---

## 7. 注释维护规范

### 7.1 更新时机

**必须更新注释的情况**：
- 修改了函数签名（参数、返回值）
- 改变了算法或实现逻辑
- 修复了 Bug
- 添加了新功能
- 废弃了某个功能

### 7.2 删除时机

**应该删除的注释**：
- 已完成的 TODO
- 过时的说明
- 被注释掉的代码（应直接删除）
- 冗余的解释

### 7.3 审查频率

- **日常**：每次提交前自查
- **每周**：团队 Code Review 时重点检查
- **每月**：清理过时的 TODO 和注释
- **每季度**：全面审查文档和注释的一致性

---

## 8. 工具辅助

### 8.1 IDE 配置建议

**VS Code 插件**：
- Todo Tree - 高亮显示 TODO 注释
- Better Comments - 彩色注释分类
- Comment Translate - 注释翻译（如需）

**DevEco Studio**：
- 内置 TODO 面板
- 代码检查自动检测注释规范

### 8.2 自动化检查

**ESLint 规则**：
```json
{
  "rules": {
    "require-jsdoc": "error",
    "valid-jsdoc": "error",
    "no-warning-comments": ["warn", { "terms": ["FIXME", "XXX"] }]
  }
}
```

**Git Hook**：
```bash
#!/bin/bash
# pre-commit hook: 检查是否有未处理的 TODO
if git diff --cached | grep -i "TODO"; then
  echo "⚠️  检测到 TODO 注释，请确认是否应该在此提交"
  read -p "继续提交？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

---

## 9. 团队协作规范

### 9.1 统一术语

团队内部应统一常用术语的翻译：
- API → API（保留英文）
- Endpoint → 接口端点
- Request → 请求
- Response → 响应
- Callback → 回调
- Promise → Promise（保留英文）
- Async/Await → 异步/等待

### 9.2 注释风格统一

- 使用一致的标点符号（建议使用中文标点）
- 保持相同的缩进和对齐方式
- 遵循团队的命名约定

### 9.3 知识共享

- 重要的设计决策应在注释中说明原因
- 复杂的业务逻辑应提供背景信息
- 鼓励团队成员互相审查注释质量

---

## 10. 最佳实践总结

1. **中文优先** - 所有注释使用中文，技术术语可保留英文
2. **TODO 必标** - 未完成的功能必须明确标注 TODO
3. **简洁明了** - 注释应该简洁，避免冗长
4. **解释 Why** - 重点说明为什么这样做，而非做什么
5. **及时更新** - 代码变更时同步更新注释
6. **定期清理** - 删除过时和无用的注释
7. **完整文档** - 公共 API 必须有完整的 JSDoc
8. **团队一致** - 保持团队内部的注释风格统一

---

## 11. 特殊场景注释规范

### 11.1 错误处理注释

**必须注释的错误处理场景**：

1. **异常捕获说明**
   ```typescript
   try {
     await fetchData()
   } catch (error) {
     // 网络请求失败，返回默认数据而非抛出异常
     // 确保用户体验不受影响
     console.error('数据获取失败:', error)
     return getDefaultData()
   }
   ```

2. **错误码说明**
   ```typescript
   /**
    * 处理 API 响应错误
    * 
    * @param errorCode - 错误码
    * @returns 用户友好的错误消息
    * 
    * 错误码映射：
    * - 400: 请求参数错误
    * - 401: 未授权，需要重新登录
    * - 403: 权限不足
    * - 404: 资源不存在
    * - 500: 服务器内部错误
    */
   function getErrorMessage(errorCode: number): string {
     // ...
   }
   ```

3. **降级策略说明**
   ```typescript
   // 主服务不可用时，切换到备用服务
   // 注意：备用服务数据可能有延迟
   if (!isMainServiceAvailable()) {
     console.warn('主服务不可用，切换到备用服务')
     return await fallbackService.getData()
   }
   ```

### 11.2 性能优化注释

**必须注释的性能相关代码**：

1. **缓存策略**
   ```typescript
   // 使用 LRU 缓存，最多保存 100 条记录
   // 缓存过期时间：5 分钟
   // 注意：数据一致性要求不高的场景可使用
   const cache = new LRUCache<string, Data>({
     max: 100,
     ttl: 5 * 60 * 1000
   })
   ```

2. **算法复杂度**
   ```typescript
   /**
    * 快速排序实现
    * 
    * 时间复杂度：平均 O(n log n)，最坏 O(n²)
    * 空间复杂度：O(log n)
    * 
    * 对于小规模数据（< 50），使用插入排序更优
    */
   function quickSort(arr: number[]): number[] {
     // ...
   }
   ```

3. **懒加载/延迟加载**
   ```typescript
   // 使用 IntersectionObserver 实现图片懒加载
   // 仅在图片进入视口时才加载，减少初始页面负载
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         loadImage(entry.target)
       }
     })
   })
   ```

4. **防抖/节流**
   ```typescript
   /**
    * 搜索输入防抖处理
    * 
    * 延迟 300ms 执行，避免频繁请求
    * 取消前一次的定时器，只执行最后一次输入
    */
   const debouncedSearch = debounce((keyword: string) => {
     performSearch(keyword)
   }, 300)
   ```

### 11.3 安全性注释

**必须注释的安全相关代码**：

1. **输入验证**
   ```typescript
   /**
    * 验证用户输入，防止 XSS 攻击
    * 
    * 安全措施：
    * 1. 移除 HTML 标签
    * 2. 转义特殊字符
    * 3. 限制输入长度
    * 
    * @param input - 用户输入字符串
    * @returns 净化后的字符串
    */
   function sanitizeInput(input: string): string {
     // ...
   }
   ```

2. **敏感数据处理**
   ```typescript
   // 密码不在日志中明文显示
   // 仅记录哈希值的前 8 位用于调试
   console.debug('Password hash:', passwordHash.substring(0, 8) + '...')
   ```

3. **权限检查**
   ```typescript
   /**
    * 检查用户是否有操作权限
    * 
    * 安全检查点：
    * 1. 验证 Token 有效性
    * 2. 检查角色权限
    * 3. 验证资源所有权
    * 
    * @throws {UnauthorizedError} 权限不足时抛出
    */
   function checkPermission(user: User, resource: Resource): void {
     // ...
   }
   ```

4. **SQL 注入防护**
   ```typescript
   // 使用参数化查询防止 SQL 注入
   // 禁止拼接 SQL 字符串
   const result = await db.query(
     'SELECT * FROM users WHERE id = ?',
     [userId]  // 参数化传入
   )
   ```

### 11.4 兼容性注释

**必须注释的兼容性相关代码**：

1. **版本兼容**
   ```typescript
   // 兼容 HarmonyOS API 11 及以下版本
   // API 12+ 可使用新接口，性能更好
   if (apiVersion >= 12) {
     return newApi.getData()
   } else {
     return legacyApi.getData()
   }
   ```

2. **浏览器/平台兼容**
   ```typescript
   // Safari 不支持 Array.prototype.at()
   // 使用传统索引访问方式
   const lastItem = arr[arr.length - 1]
   // 而非: arr.at(-1)
   ```

3. **废弃 API 说明**
   ```typescript
   /**
    * @deprecated 此方法已在 v2.0 废弃
    * 请使用 newUserManager.getUserById() 替代
    * 
    * 废弃原因：
    * 1. 性能较差，每次调用都查询数据库
    * 2. 不支持缓存机制
    * 3. 错误处理不完善
    * 
    * 计划移除时间：2026-12-31
    */
   function getUser(id: string): User {
     // ...
   }
   ```

### 11.5 并发与异步注释

**必须注释的并发相关代码**：

1. **竞态条件说明**
   ```typescript
   // 使用锁机制防止并发修改
   // 注意：此处存在竞态条件风险
   // 同一用户可能同时发起多个请求
   const lock = await acquireLock(userId)
   try {
     await updateUserData(userId, data)
   } finally {
     await releaseLock(lock)
   }
   ```

2. **Promise 链说明**
   ```typescript
   /**
    * 串行执行多个异步任务
    * 
    * 执行顺序：
    * 1. 验证用户身份
    * 2. 检查权限
    * 3. 获取数据
    * 4. 格式化响应
    * 
    * 任何一步失败都会中断后续执行
    */
   async function processRequest(userId: string): Promise<Response> {
     const user = await validateUser(userId)
     await checkPermission(user)
     const data = await fetchData(user)
     return formatResponse(data)
   }
   ```

3. **并行执行优化**
   ```typescript
   // 并行请求三个独立的数据源
   // 总耗时取决于最慢的请求，而非三者之和
   const [users, posts, comments] = await Promise.all([
     fetchUsers(),
     fetchPosts(),
     fetchComments()
   ])
   ```

### 11.6 配置与常量注释

**必须注释的配置项**：

1. **魔法数字说明**
   ```typescript
   // 最大重试次数：3 次
   // 超过此次数认为服务不可用
   const MAX_RETRY_COUNT = 3
   
   // 重试间隔：指数退避
   // 第 1 次：1s，第 2 次：2s，第 3 次：4s
   const RETRY_DELAY_BASE = 1000
   ```

2. **配置项说明**
   ```typescript
   /**
    * 应用配置
    * 
    * 可通过环境变量覆盖：
    * - APP_PORT: 服务端口
    * - DB_HOST: 数据库地址
    * - LOG_LEVEL: 日志级别
    */
   interface AppConfig {
     port: number        // 服务端口，默认 3000
     dbHost: string      // 数据库主机地址
     logLevel: string    // 日志级别：debug|info|warn|error
   }
   ```

3. **枚举值说明**
   ```typescript
   /**
    * 订单状态枚举
    */
   enum OrderStatus {
     PENDING = 0,    // 待支付
     PAID = 1,       // 已支付
     SHIPPED = 2,    // 已发货
     DELIVERED = 3,  // 已送达
     CANCELLED = 4,  // 已取消
     REFUNDED = 5    // 已退款
   }
   ```

---

## 12. 代码审查注释要点

### 12.1 Reviewer 应关注的注释

**审查清单**：

- [ ] 公共 API 是否有完整的 JSDoc
- [ ] 复杂逻辑是否有清晰的注释说明
- [ ] TODO 是否具体且可执行
- [ ] 是否有过时或误导性的注释
- [ ] 注释是否与代码保持一致
- [ ] 是否解释了 "为什么" 而不仅是 "做什么"
- [ ] 安全相关的代码是否有充分说明
- [ ] 性能优化的代码是否说明了收益和权衡

### 12.2 常见注释问题

**需要改进的情况**：

1. **注释与代码不一致**
   ```typescript
   // ❌ 注释说返回用户列表，实际返回单个用户
   // 获取用户列表
   function getUser(id: string): User { ... }
   
   // ✅ 修正注释
   // 根据 ID 获取单个用户
   function getUser(id: string): User { ... }
   ```

2. **注释过于详细（啰嗦）**
   ```typescript
   // ❌ 过度注释
   // 声明一个变量 count
   // 将其初始化为 0
   // 这个变量用于计数
   let count = 0
   
   // ✅ 简洁注释（如需要）
   // 计数器，记录成功请求数
   let successCount = 0
   ```

3. **缺少关键信息**
   ```typescript
   // ❌ 模糊的注释
   // 修复 bug
   fixIssue()
   
   // ✅ 具体的注释
   // 修复 #123: 并发场景下的数据竞争问题
   // 添加互斥锁保护共享资源
   fixConcurrencyIssue()
   ```

---

## 13. 自动化检查规则

### 13.1 ESLint 配置

```json
{
  "rules": {
    // 强制 JSDoc 注释
    "require-jsdoc": ["error", {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true,
        "ArrowFunctionExpression": false,
        "FunctionExpression": true
      }
    }],
    
    // 验证 JSDoc 格式
    "valid-jsdoc": ["error", {
      "requireReturn": true,
      "requireParamDescription": true,
      "requireReturnDescription": true,
      "prefer": {
        "return": "returns"
      }
    }],
    
    // 警告未处理的 FIXME/XXX
    "no-warning-comments": ["warn", {
      "terms": ["FIXME", "XXX", "HACK"],
      "location": "start"
    }],
    
    // 禁止空块
    "no-empty": "error",
    
    // 强制使用中文注释（通过自定义规则）
    "custom/chinese-comments": "error"
  }
}
```

### 13.2 自定义 ESLint 规则示例

```javascript
// rules/chinese-comments.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '强制注释使用中文'
    }
  },
  create(context) {
    return {
      Program() {
        const sourceCode = context.getSourceCode()
        const comments = sourceCode.getAllComments()
        
        comments.forEach(comment => {
          // 跳过纯英文技术术语
          if (isTechnicalTerm(comment.value)) return
          
          // 检查是否包含中文字符
          if (!/[\u4e00-\u9fa5]/.test(comment.value)) {
            context.report({
              node: comment,
              message: '注释应使用中文'
            })
          }
        })
      }
    }
  }
}
```

### 13.3 Git Commit Hook

```bash
#!/bin/bash
# .git/hooks/commit-msg
# 检查提交信息中是否包含 TODO 说明

commit_msg=$(cat $1)

# 如果提交信息包含 "TODO" 但没有说明原因，警告
if echo "$commit_msg" | grep -q "TODO"; then
  if ! echo "$commit_msg" | grep -qE "(TODO.*-|TODO.*:)"; then
    echo "⚠️  警告: 提交包含 TODO 但未说明原因"
    echo "建议使用格式: TODO: 描述 - 原因/计划"
    echo ""
    read -p "继续提交？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi
```

---

## 14. 团队协作最佳实践

### 14.1 注释模板库

创建团队共享的注释模板：

```typescript
// templates/comments.ts

/**
 * [函数名] - [简短描述]
 * 
 * [详细说明，包括业务背景、实现思路等]
 * 
 * @param paramName - 参数说明
 * @returns 返回值说明
 * @throws {ErrorType} 异常说明
 * 
 * @example
 * ```typescript
 * const result = await functionName(param)
 * console.log(result)
 * ```
 * 
 * @author [姓名]
 * @created [日期]
 * @updated [日期]
 */

// TODO: [描述] - [原因/计划]
// Issue: #[编号]
// Priority: HIGH|MEDIUM|LOW
```

### 14.2 注释审查流程

1. **自查阶段**（开发者）
   - 提交前运行 linter 检查
   - 确认所有 TODO 都有明确说明
   - 验证注释与代码一致性

2. **同行审查**（Code Review）
   - 重点关注公共 API 注释
   - 检查复杂逻辑的说明是否清晰
   - 确认安全性相关注释完整

3. **定期审计**（团队）
   - 每月清理过时注释
   - 更新文档与代码的差异
   - 收集团队反馈改进规范

### 14.3 知识沉淀

**将重要注释转化为文档**：

1. 架构决策记录（ADR）
   - 重要的设计决策及其原因
   - 权衡考虑和备选方案
   
2. 常见问题解答（FAQ）
   - 从注释中提取常见问题
   - 形成团队知识库
   
3. 最佳实践指南
   - 总结优秀的注释案例
   - 分享给团队成员

---

## 15. 鸿蒙项目注释特殊要求

### 15.1 ArkTS 组件注释

```typescript
/**
 * 媒体卡片组件
 * 
 * 功能：
 * 1. 显示媒体封面和标题
 * 2. 支持点击跳转到详情页
 * 3. 长按显示操作菜单
 * 
 * 状态管理：
 * - @State isLoading: 加载状态
 * - @State mediaInfo: 媒体信息
 * 
 * 性能优化：
 * - 使用 LazyForEach 实现懒加载
 * - 图片使用缓存机制
 * 
 * @example
 * ```typescript
 * MediaCard({
 *   mediaId: '123',
 *   onClick: () => navigateToDetail()
 * })
 * ```
 */
@Component
struct MediaCard {
  @Prop mediaId: string
  @Event onClick: () => void
  
  @State isLoading: boolean = true
  @State mediaInfo: MediaInfo | null = null
  
  build() {
    // ...
  }
}
```

### 15.2 生命周期注释

```typescript
@Component
struct MyPage {
  /**
   * 组件即将出现
   * 
   * 在此处：
   * 1. 初始化数据
   * 2. 注册事件监听
   * 3. 启动定时器
   */
  aboutToAppear() {
    this.loadData()
  }
  
  /**
   * 组件即将销毁
   * 
   * 在此处：
   * 1. 取消网络请求
   * 2. 移除事件监听
   * 3. 清除定时器
   * 4. 释放资源
   */
  aboutToDisappear() {
    this.cancelRequests()
  }
}
```

### 15.3 状态流转注释

```typescript
@Component
struct StateMachine {
  @State currentState: State = State.IDLE
  
  /**
   * 状态转换处理
   * 
   * 状态流转图：
   * IDLE → LOADING → SUCCESS | ERROR
   * SUCCESS → REFRESHING → SUCCESS
   * ERROR → RETRY → LOADING
   * 
   * @param newState - 目标状态
   * @throws {StateError} 非法状态转换时抛出
   */
  transitionTo(newState: State): void {
    // 验证状态转换合法性
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new StateError(`Invalid transition: ${this.currentState} → ${newState}`)
    }
    this.currentState = newState
  }
}
```

---

## 16. 总结与检查清单

### 16.1 核心原则回顾

✅ **必须做到**：
1. 所有注释使用中文
2. 未完成功能标注 TODO
3. 公共 API 有完整 JSDoc
4. 复杂逻辑有清晰说明
5. 安全/性能代码有详细注释
6. 定期清理过时注释

❌ **严格禁止**：
1. 英文注释（技术术语除外）
2. 模糊的 TODO
3. 过时或错误的注释
4. 冗余的废话注释
5. 注释掉的代码长期保留

### 16.2 最终检查清单

提交代码前逐项检查：

- [ ] 所有注释使用中文
- [ ] TODO 标注清晰具体
- [ ] 公共 API 有完整文档
- [ ] 复杂逻辑有充分说明
- [ ] 安全相关代码有注释
- [ ] 性能优化有说明
- [ ] 没有过时注释
- [ ] 没有冗余注释
- [ ] 注释与代码一致
- [ ] 符合团队规范
