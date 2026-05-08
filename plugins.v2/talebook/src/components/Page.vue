<template>
  <v-container fluid class="pa-4">
    <!-- 标题卡片 -->
    <v-card class="mb-6 elevation-4">
      <v-card-title class="text-h5 bg-primary text-white d-flex align-center justify-space-between py-4 px-6">
        <div class="d-flex align-center">
          <v-icon start color="white" class="mr-3">mdi-book-open-page-variant</v-icon>
          Talebook 本地书库管理
        </div>
        <v-btn
          icon
          variant="text"
          color="white"
          size="small"
          @click="handleClose"
          title="关闭页面"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle class="text-grey-darken-1 pa-3">
        扫描本地目录，批量导入小说到 Talebook 书库（与 Sonovel 联动）
      </v-card-subtitle>
    </v-card>

    <!-- 标签页导航 -->
    <v-card class="mb-6 elevation-4">
      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab value="scan">
          <v-icon start>mdi-folder-search</v-icon>
          扫描导入
        </v-tab>
        <v-tab value="browse">
          <v-icon start>mdi-book-search</v-icon>
          书籍浏览
        </v-tab>
        <v-tab value="recent">
          <v-icon start>mdi-history</v-icon>
          最近添加
        </v-tab>
        <v-tab value="favorites">
          <v-icon start>mdi-heart</v-icon>
          我的收藏
        </v-tab>
        <v-tab value="reading">
          <v-icon start>mdi-book-open-variant</v-icon>
          正在阅读
        </v-tab>
        <v-tab value="meta">
          <v-icon start>mdi-tag-multiple</v-icon>
          元数据分类
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- 标签页内容 -->
    <v-window v-model="activeTab">
      <!-- 扫描导入标签页 -->
      <v-window-item value="scan">
        <ScanPanel
          :scanning="scanning"
          :progress="scanProgress"
          @scan="handleScanAndImport"
          @view-recent="loadRecentBooks"
        />
      </v-window-item>

      <!-- 书籍浏览标签页 -->
      <v-window-item value="browse">
        <v-card class="elevation-4">
          <v-card-title class="text-subtitle-1 py-3">
            <v-icon start color="primary">mdi-book-search</v-icon>
            搜索并浏览书籍
          </v-card-title>
          <v-card-text class="pa-5">
            <v-alert type="info" variant="tonal" class="mb-5" border="start" icon="mdi-information">
              <div class="text-body-2">
                <strong>功能说明：</strong><br>
                • 支持按书名、作者或标签搜索<br>
                • 点击卡片查看详情或直接下载<br>
                • 支持多种格式：.epub、.mobi、.pdf
              </div>
            </v-alert>
            
            <!-- 搜索框 -->
            <v-row class="mb-4">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchKeyword"
                  label="搜索书籍"
                  prepend-inner-icon="mdi-magnify"
                  placeholder="输入书名、作者或标签"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  size="large"
                  block
                  @click="handleSearch"
                >
                  搜索
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 搜索结果 -->
        <BookGrid
          v-if="books.length > 0 && searched"
          :books="books"
          :title="listTitle"
          icon="mdi-bookshelf"
          :api="props.api"
          :favorite-book-ids="favoriteBookIds"
          :downloading-book-id="downloadingBook"
          :get-cover-url="getCoverUrl"
          @detail="showBookDetail"
          @toggle-favorite="toggleFavorite"
          @download="downloadBook"
        />

        <!-- 空状态提示 -->
        <v-empty-state
          v-else-if="!loading && searched"
          icon="mdi-book-off-outline"
          title="没有找到书籍"
          text="尝试其他关键词或查看最近添加的书籍"
          class="mt-8"
        />
      </v-window-item>

      <!-- 最近添加标签页 -->
      <v-window-item value="recent">
        <BookGrid
          :books="books"
          title="最近添加的书籍"
          icon="mdi-history"
          :api="props.api"
          :favorite-book-ids="favoriteBookIds"
          :downloading-book-id="downloadingBook"
          :loading="loading"
          :get-cover-url="getCoverUrl"
          @detail="showBookDetail"
          @toggle-favorite="toggleFavorite"
          @download="downloadBook"
        />

        <!-- 空状态提示 -->
        <v-empty-state
          v-if="!loading && books.length === 0"
          icon="mdi-book-off-outline"
          title="暂无书籍"
          text="请先扫描导入或等待新添加的书籍"
          class="mt-8"
        />
      </v-window-item>

      <!-- 我的收藏标签页 -->
      <v-window-item value="favorites">
        <BookGrid
          :books="favoriteBooks"
          title="我的收藏"
          icon="mdi-heart"
          :api="props.api"
          :favorite-book-ids="favoriteBookIds"
          :loading="loadingFavorites"
          show-refresh
          :show-favorite="false"
          :get-cover-url="getCoverUrl"
          @detail="showBookDetail"
          @download="downloadBook"
          @refresh="loadFavoriteBooks"
        >
          <!-- 自定义徽章: 收藏标记 -->
          <template #badge>
            <v-chip
              position="absolute"
              top="8"
              right="8"
              color="red"
              size="x-small"
              prepend-icon="mdi-heart"
              variant="flat"
            >
              收藏
            </v-chip>
          </template>
          
          <!-- 自定义操作按钮 -->
          <template #actions="{ book }">
            <v-btn
              size="x-small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-information-outline"
              @click="showBookDetail(book.id)"
            >
              详情
            </v-btn>
            <v-spacer />
            <v-btn
              size="x-small"
              color="error"
              variant="tonal"
              prepend-icon="mdi-heart-off"
              @click="removeFromFavorites(book.id)"
            >
              取消收藏
            </v-btn>
          </template>
        </BookGrid>

        <!-- 空状态提示 -->
        <v-empty-state
          v-if="!loadingFavorites && favoriteBooks.length === 0"
          icon="mdi-heart-off-outline"
          title="暂无收藏"
          text="浏览书籍并点击收藏按钮添加到我的收藏"
          class="mt-8"
        />
      </v-window-item>

      <!-- 正在阅读标签页 -->
      <v-window-item value="reading">
        <BookGrid
          :books="readingBooks"
          title="正在阅读"
          icon="mdi-book-open-variant"
          :api="props.api"
          :favorite-book-ids="favoriteBookIds"
          :loading="loadingReading"
          show-refresh
          :show-favorite="false"
          :get-cover-url="getCoverUrl"
          @detail="showBookDetail"
          @download="downloadBook"
          @refresh="loadReadingBooks"
        >
          <!-- 自定义徽章: 在读标记 -->
          <template #badge>
            <v-chip
              position="absolute"
              top="8"
              right="8"
              color="blue"
              size="x-small"
              prepend-icon="mdi-book-open-page-variant"
              variant="flat"
            >
              在读
            </v-chip>
          </template>
                      
          <!-- 自定义操作按钮 -->
          <template #actions="{ book }">
            <v-btn
              size="x-small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-information-outline"
              @click="showBookDetail(book.id)"
            >
              详情
            </v-btn>
            <v-spacer />
            <v-btn
              size="x-small"
              color="success"
              variant="tonal"
              prepend-icon="mdi-check-circle"
              @click="markAsRead(book.id)"
            >
              标记已读
            </v-btn>
          </template>
        </BookGrid>
            
        <!-- 空状态提示 -->
        <v-empty-state
          v-if="!loadingReading && readingBooks.length === 0"
          icon="mdi-book-off-outline"
          title="暂无在读"
          text='浏览书籍并设置阅读状态为“在读”'
          class="mt-8"
        />
      </v-window-item>
      
      <!-- 元数据分类标签页 -->
      <v-window-item value="meta">
        <MetaCategory :api="api" />
      </v-window-item>
    </v-window>

    <!-- 书籍详情对话框 -->
    <BookDetailDialog
      v-model="detailDialog"
      :book="selectedBook"
      :cover-url="selectedBook ? getDetailCoverUrl(selectedBook) : ''"
      :api="props.api"
      :is-favorited="selectedBook ? favoriteBooks.some(b => b.id === selectedBook.id) : false"
      :is-downloading="downloadingBook === selectedBook?.id"
      @toggle-favorite="selectedBook && toggleFavorite(selectedBook.id)"
      @download="selectedBook && downloadBook(selectedBook.id)"
    />

    <!-- Toast 通知 -->
    <ToastNotification />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import BookGrid from './BookGrid.vue'
import BookDetailDialog from './BookDetailDialog.vue'
import ScanPanel from './ScanPanel.vue'
import ToastNotification from './ToastNotification.vue'
import MetaCategory from './MetaCategory.vue'
import { useToast } from '../composables/useToast'
import { buildBookCoverUrl } from '../utils/coverProxy'

// Props - 接收 MoviePilot-Frontend 传递的 api 对象和 model(配置)
const props = defineProps({
  api: {
    type: Object,
    default: () => ({})
  },
  model: {
    type: Object,
    default: () => ({})
  }
})

// Emits - 定义事件
const emit = defineEmits(['close'])

// 日志工具函数
const log = {
  info: (module: string, message: string, data?: any) => {
    console.log(`[Talebook:${module}] ℹ️ ${message}`, data || '')
  },
  warn: (module: string, message: string, data?: any) => {
    console.warn(`[Talebook:${module}] ⚠️ ${message}`, data || '')
  },
  error: (module: string, message: string, error?: any) => {
    console.error(`[Talebook:${module}] ❌ ${message}`, error || '')
  },
  debug: (module: string, message: string, data?: any) => {
    // 始终输出调试日志（生产环境可通过浏览器控制台过滤）
    console.debug(`[Talebook:${module}] 🔍 ${message}`, data || '')
  }
}

// 状态管理
const activeTab = ref('scan')  // 当前激活的标签页
const searchKeyword = ref('')

// 使用 Toast composable
const { showToast } = useToast()

// 扫描进度状态
interface ScanProgress {
  step: number        // 当前步骤 (1-4)
  stepName: string    // 步骤名称
  message: string     // 当前消息
  details: {
    totalFiles?: number
    newFiles?: number
    existFiles?: number
    importedCount?: number
  }
}

const books = ref<any[]>([])
const loading = ref(false)
const scanning = ref(false)  // 扫描状态
const scanResult = ref<any>(null)  // 扫描结果
const scanProgress = ref<ScanProgress>({
  step: 0,
  stepName: '',
  message: '',
  details: {}
})
const downloadingBook = ref<number | null>(null)
const detailDialog = ref(false)
const selectedBook = ref<any>(null)
const listTitle = ref('扫描结果')
const searched = ref(false)

// 收藏和阅读状态相关
const favoriteBooks = ref<any[]>([])
const readingBooks = ref<any[]>([])
const loadingFavorites = ref(false)
const loadingReading = ref(false)

// 将收藏书籍数组转换为 Set,方便快速查找
const favoriteBookIds = computed(() => {
  return new Set(favoriteBooks.value.map(b => b.id))
})

// 获取插件 ID (从 URL 参数或全局变量)
const pluginId = 'Talebook'

// API 基础路径 - 使用 props.api 时不需要 /api/v1 前缀
const getApiUrl = (path: string) => {
  return `/plugin/${pluginId}${path}`
}

// Talebook 服务器地址（缓存）
const talebookServerUrl = ref('')

// 加载配置
const loadConfig = async () => {
  log.info('Config', '开始加载插件配置...')
  try {
    const startTime = Date.now()
    const response = await safeApiCall(() => 
      props.api.get(getApiUrl('/config'))
    )
    const duration = Date.now() - startTime
    
    log.info('Config', `配置请求完成 (${duration}ms)`)
    log.debug('Config', '响应数据:', response)
    
    if (response && response.code === 200 && response.data) {
      talebookServerUrl.value = response.data.server_url || ''
      log.info('Config', '✅ 配置加载成功', {
        server_url: talebookServerUrl.value,
        enabled: response.data.enabled,
        config_complete: response.data.config_complete,
        username: response.data.username ? '***' : undefined
      })
    } else {
      log.warn('Config', '⚠️ 配置加载失败或返回无效', {
        code: response?.code,
        message: response?.message
      })
    }
  } catch (error) {
    log.error('Config', '❌ 加载配置异常', error)
  }
}

const getCoverUrl = (book: any) => buildBookCoverUrl(book, talebookServerUrl.value, getApiUrl('/image/proxy'), 'card')

const getDetailCoverUrl = (book: any) => buildBookCoverUrl(book, talebookServerUrl.value, getApiUrl('/image/proxy'), 'detail')

// API 错误处理工具函数(参考 Sonovel 插件)
async function safeApiCall<T = any>(
  apiCall: () => Promise<T>,
  retries = 2,
  delay = 1000,
  timeout = 30000  // 默认 30 秒超时
): Promise<T> {
  let lastError = null
  
  for (let i = 0; i <= retries; i++) {
    try {
      log.debug('API', `第 ${i + 1}/${retries + 1} 次尝试`)
      
      // 创建带超时的 Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`请求超时 (${timeout}ms)`))
        }, timeout)
      })
      
      //  race between the API call and timeout
      const result = await Promise.race([
        apiCall(),
        timeoutPromise
      ])
      
      log.debug('API', `✅ 请求成功`)
      return result
    } catch (error) {
      lastError = error
      log.warn('API', `⚠️ 第 ${i + 1} 次尝试失败:`, error)
      
      if (i < retries) {
        // 指数退避重试
        const waitTime = delay * Math.pow(2, i)
        log.info('API', `等待 ${waitTime}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  log.error('API', '❌ 所有重试均失败')
  throw lastError
}

// 搜索书籍
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    log.warn('Search', '搜索关键词为空')
    return
  }

  loading.value = true
  searched.value = true
  listTitle.value = `搜索: ${searchKeyword.value}`
  
  const keyword = searchKeyword.value.trim()
  log.info('Search', `开始搜索: "${keyword}"`)
  
  try {
    const startTime = Date.now()
    const response = await safeApiCall(() => 
      props.api.get(getApiUrl('/search'), {
        params: { keyword }
      })
    )
    const duration = Date.now() - startTime
    
    log.debug('Search', `搜索请求完成 (${duration}ms)`, response)
    
    // MoviePilot-Frontend 已自动解析响应,response 就是后端返回的 {code, message, data}
    let booksData = []
    if (response && response.code === 200) {
      // 标准格式 {code: 200, data: [...]}
      booksData = response.data || []
      log.info('Search', `✅ 搜索成功，找到 ${booksData.length} 本书`)
    } else if (Array.isArray(response)) {
      // 直接返回数组(兼容旧格式)
      booksData = response
      log.info('Search', `✅ 搜索成功（旧格式），找到 ${booksData.length} 本书`)
    } else {
      log.warn('Search', '⚠️ 搜索返回错误', {
        code: response?.code,
        message: response?.message
      })
      booksData = []
    }
    
    books.value = booksData
    if (books.value.length > 0) {
      log.debug('Search', '第一本书数据:', books.value[0])
    }
  } catch (error) {
    log.error('Search', '❌ 搜索失败', error)
    showToast(`搜索失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
    books.value = []
  } finally {
    loading.value = false
    log.debug('Search', '搜索状态重置')
  }
}

// 扫描并导入
const handleScanAndImport = async () => {
  log.info('Scan', '========== 开始扫描导入 ==========')
  log.debug('Scan', '当前状态:', {
    scanning: scanning.value,
    hasApi: !!props.api,
    apiPostType: typeof props.api?.post
  })
  
  // 检查 props.api 是否有效
  if (!props.api || typeof props.api.post !== 'function') {
    log.error('Scan', '❌ props.api 无效或未提供', {
      api: props.api,
      postType: typeof props.api?.post
    })
    showToast('错误: 无法调用 API，请刷新页面重试', 'error')
    return
  }
  
  scanning.value = true
  scanResult.value = null
  const startTime = Date.now()
  
  log.info('Scan', `⏱️  开始时间: ${new Date(startTime).toLocaleTimeString()}`)
  
  // 阶段 1: 提交扫描请求
  scanProgress.value = {
    step: 1,
    stepName: '步骤 1/4 - 提交扫描请求',
    message: '正在向云端提交扫描任务...',
    details: {}
  }
  log.info('Scan', '📤 提交扫描请求...')
  log.debug('Scan', 'API URL:', getApiUrl('/scan'))
  
  try {
    log.info('Scan', '🔄 发起扫描请求...')
    
    // 扫描 API 不使用重试，直接调用（后端已处理轮询）
    // 创建带超时的 Promise
    const scanTimeout = 120000  // 120 秒超时（后端最多 60 秒扫描 + 60 秒导入）
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`扫描请求超时 (${scanTimeout/1000}秒)`))
      }, scanTimeout)
    })
    
    const apiPromise = props.api.post(getApiUrl('/scan'))
    
    log.debug('Scan', `⏱️  设置超时: ${scanTimeout/1000}秒`)
    const response = await Promise.race([apiPromise, timeoutPromise])
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    log.info('Scan', `📥 收到响应 (${elapsed}s)`, { 
      code: response?.code,
      hasData: !!response?.data 
    })
    log.debug('Scan', '完整响应:', response)
    
    if (response && response.code === 200) {
      scanResult.value = response.data
      
      // 解析详细结果
      const data = response.data
      const totalFiles = data.total_files || 0
      const newFiles = data.new_files || 0
      const existFiles = data.exist_files || 0
      const importedCount = data.imported_count || 0
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      
      log.info('Scan', '✅ 扫描数据解析完成', {
        totalFiles,
        newFiles,
        existFiles,
        importedCount,
        elapsed
      })
      
      // 更新进度为完成状态
      scanProgress.value = {
        step: 4,
        stepName: '✅ 完成',
        message: `扫描和导入已完成 (耗时 ${elapsed}秒)`,
        details: {
          totalFiles,
          newFiles,
          existFiles,
          importedCount
        }
      }
      
      // 显示成功消息
      let message = `✅ 扫描导入完成！\n`
      message += `⏱️  耗时: ${elapsed}秒 | `
      message += `📊 总数: ${totalFiles} | 新增: ${newFiles} | 已存在: ${existFiles} | 已导入: ${importedCount}`
      
      if (data.scan_timeout) {
        message += '\n⚠️  扫描任务超时，可能仍在后台执行'
        log.warn('Scan', '⚠️ 扫描任务超时')
      } else if (data.import_timeout) {
        message += '\n⚠️  导入任务超时，可能仍在后台执行'
        log.warn('Scan', '⚠️ 导入任务超时')
      }
      
      showToast(message, 'success')
      log.info('Scan', '✅ 扫描导入流程完成', { elapsed, totalFiles, importedCount })
      
      // 加载最近添加的书籍
      log.info('Scan', '🔄 加载最近添加的书籍...')
      await loadRecentBooks()
      
      // 切换到最近添加标签页
      activeTab.value = 'recent'
      log.info('Scan', '✅ 切换到最近添加标签页')
    } else {
      log.error('Scan', '❌ 扫描返回错误', {
        code: response?.code,
        message: response?.message
      })
      showToast(`❌ 扫描失败: ${response?.message || '未知错误'}`, 'error')
    }
  } catch (error: any) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    
    // 详细错误信息
    let errorMsg = '未知错误'
    let errorDetails: any = {}
    
    if (error instanceof Error) {
      errorMsg = error.message
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } else if (error && typeof error === 'object') {
      errorMsg = error.message || error.msg || JSON.stringify(error)
      errorDetails = error
    } else {
      errorMsg = String(error)
    }
    
    log.error('Scan', `❌ 扫描异常 (耗时 ${elapsed}s)`, {
      errorMsg,
      errorDetails,
      rawError: error
    })
    
    showToast(`❌ 扫描失败: ${errorMsg}`, 'error')
  } finally {
    scanning.value = false
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    log.info('Scan', `🏁 扫描流程结束 (总耗时 ${totalTime}s)`)
  }
}

// 加载最近添加的书籍
const loadRecentBooks = async () => {
  loading.value = true
  searched.value = false
  listTitle.value = '最近添加'
  
  log.info('Recent', '开始加载最近添加的书籍')
  
  try {
    const startTime = Date.now()
    const response = await safeApiCall(() => 
      props.api.get(getApiUrl('/recent'))
    )
    const duration = Date.now() - startTime
    
    log.debug('Recent', `请求完成 (${duration}ms)`, response)
    
    // MoviePilot-Frontend 已自动解析响应,response 就是后端返回的 {code, message, data}
    let booksData = []
    if (response && response.code === 200) {
      // 标准格式 {code: 200, data: [...]}
      booksData = response.data || []
      log.info('Recent', `✅ 加载成功，共 ${booksData.length} 本书`)
    } else if (Array.isArray(response)) {
      // 直接返回数组(兼容旧格式)
      booksData = response
      log.info('Recent', `✅ 加载成功（旧格式），共 ${booksData.length} 本书`)
    } else {
      log.warn('Recent', '⚠️ 获取最近书籍失败', {
        code: response?.code,
        message: response?.message
      })
      booksData = []
    }
    
    books.value = booksData
    if (books.value.length > 0) {
      log.debug('Recent', '第一本书数据:', books.value[0])
    }
  } catch (error) {
    log.error('Recent', '❌ 加载最近书籍失败', error)
    books.value = []
  } finally {
    loading.value = false
    log.debug('Recent', '加载状态重置')
  }
}

// 加载收藏的书籍
const loadFavoriteBooks = async () => {
  loadingFavorites.value = true
  
  log.info('Favorites', '开始加载收藏列表')
  
  try {
    const response = await safeApiCall(() => 
      props.api.get(getApiUrl('/favorites/list'), { params: { limit: 50 } })
    )
    
    if (response && response.code === 200) {
      favoriteBooks.value = response.data?.books || []
      log.info('Favorites', `✅ 加载成功，共 ${favoriteBooks.value.length} 本书`)
    } else {
      log.warn('Favorites', '⚠️ 获取收藏列表失败', {
        code: response?.code,
        message: response?.message
      })
      favoriteBooks.value = []
    }
  } catch (error) {
    log.error('Favorites', '❌ 加载收藏列表失败', error)
    favoriteBooks.value = []
  } finally {
    loadingFavorites.value = false
  }
}

// 加载正在阅读的书籍
const loadReadingBooks = async () => {
  loadingReading.value = true
  
  log.info('Reading', '开始加载在读列表')
  
  try {
    const response = await safeApiCall(() => 
      props.api.get(getApiUrl('/reading/list'), { params: { limit: 20 } })
    )
    
    if (response && response.code === 200) {
      readingBooks.value = response.data?.books || []
      log.info('Reading', `✅ 加载成功，共 ${readingBooks.value.length} 本书`)
    } else {
      log.warn('Reading', '⚠️ 获取在读列表失败', {
        code: response?.code,
        message: response?.message
      })
      readingBooks.value = []
    }
  } catch (error) {
    log.error('Reading', '❌ 加载在读列表失败', error)
    readingBooks.value = []
  } finally {
    loadingReading.value = false
  }
}

// 取消收藏
const removeFromFavorites = async (bookId: number) => {
  log.info('Favorites', `开始取消收藏 (ID: ${bookId})`)
  
  try {
    // 使用专用的取消收藏 API 端点
    const url = getApiUrl(`/book/unfavorite/${bookId}`)
    
    log.info('Favorites', `发送请求: POST ${url}`)
    
    const response = await safeApiCall(() => 
      props.api.post(url)
    )
    
    log.debug('Favorites', '收到响应:', response)
    
    if (response && response.code === 200) {
      showToast('已取消收藏', 'success')
      // 从列表中移除
      favoriteBooks.value = favoriteBooks.value.filter(b => b.id !== bookId)
      log.info('Favorites', '✅ 取消收藏成功，已从列表移除')
    } else {
      log.error('Favorites', '❌ 取消收藏失败', {
        code: response?.code,
        message: response?.message
      })
      showToast(`取消收藏失败: ${response?.message}`, 'error')
    }
  } catch (error) {
    log.error('Favorites', '❌ 取消收藏异常', error)
    showToast('取消收藏失败', 'error')
  }
}

// 添加收藏
const addToFavorites = async (bookId: number) => {
  log.info('Favorites', `开始添加收藏 (ID: ${bookId})`)
  
  try {
    const url = getApiUrl(`/book/favorite/${bookId}`)
    
    log.info('Favorites', `发送请求: POST ${url}`)
    
    const response = await safeApiCall(() => 
      props.api.post(url)
    )
    
    log.debug('Favorites', '收到响应:', response)
    
    if (response && response.code === 200) {
      showToast('已添加到收藏', 'success')
      log.info('Favorites', '✅ 添加收藏成功')
    } else {
      log.error('Favorites', '❌ 添加收藏失败', {
        code: response?.code,
        message: response?.message
      })
      showToast(`添加收藏失败: ${response?.message}`, 'error')
    }
  } catch (error) {
    log.error('Favorites', '❌ 添加收藏异常', error)
    showToast('添加收藏失败', 'error')
  }
}

// 切换收藏状态
const toggleFavorite = async (bookId: number) => {
  // 检查是否已在收藏列表中
  const isFavorited = favoriteBooks.value.some(b => b.id === bookId)
  
  if (isFavorited) {
    await removeFromFavorites(bookId)
  } else {
    await addToFavorites(bookId)
  }
}

// 标记为已读
const markAsRead = async (bookId: number) => {
  try {
    const response = await safeApiCall(() => 
      props.api.post(getApiUrl(`/book/readstate/${bookId}`), { read_state: 2 })
    )
    
    if (response && response.code === 200) {
      showToast('已标记为已读', 'success')
      // 从在读列表中移除
      readingBooks.value = readingBooks.value.filter(b => b.id !== bookId)
    } else {
      showToast(`设置失败: ${response?.message}`, 'error')
    }
  } catch (error) {
    log.error('Reading', '❌ 标记已读失败', error)
    showToast('标记已读失败', 'error')
  }
}

// 显示书籍详情
const showBookDetail = async (bookId: number) => {
  log.info('Detail', `开始获取书籍详情 (ID: ${bookId})`)
  
  try {
    const startTime = Date.now()
    const response = await safeApiCall(() => 
      props.api.get(getApiUrl(`/book/detail/${bookId}`))
    )
    const duration = Date.now() - startTime
    
    log.debug('Detail', `请求完成 (${duration}ms)`, response)
    
    // MoviePilot-Frontend 已自动解析响应
    let bookData = null
    if (response && response.code === 200) {
      bookData = response.data
      log.info('Detail', '✅ 获取详情成功')
    } else if (response && typeof response === 'object' && !Array.isArray(response)) {
      // 直接返回对象(兼容旧格式)
      bookData = response
      log.info('Detail', '✅ 获取详情成功（旧格式）')
    } else {
      log.warn('Detail', '⚠️ 获取书籍详情失败', {
        code: response?.code,
        message: response?.message
      })
    }
    
    if (bookData) {
      selectedBook.value = bookData
      detailDialog.value = true
      log.debug('Detail', '打开详情对话框')
    }
  } catch (error) {
    log.error('Detail', '❌ 获取书籍详情失败', error)
    showToast(`获取详情失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
  }
}

// 下载书籍
const downloadBook = async (bookId: number) => {
  downloadingBook.value = bookId
  
  try {
    const response = await safeApiCall(() => 
      props.api.post(getApiUrl('/action'), {
        action: 'download',
        book_id: bookId,
        format: 'epub'
      })
    )
    
    console.log('下载响应:', response)
    
    if (response && response.code === 200) {
      showToast(`✅ 下载成功: ${response.data.filepath}`, 'success')
    } else {
      showToast(`❌ 下载失败: ${response?.message || '未知错误'}`, 'error')
    }
  } catch (error) {
    console.error('下载失败:', error)
    showToast('❌ 下载失败,请检查控制台日志', 'error')
  } finally {
    downloadingBook.value = null
  }
}

// 关闭页面
const handleClose = () => {
  log.info('Page', '用户点击关闭按钮')
  emit('close')
}

// 组件挂载时加载配置和最近书籍
onMounted(async () => {
  console.log('[Page] ========== 组件挂载 ==========')
  console.log('[Page] props.model:', props.model)
  
  // 先加载配置
  await loadConfig()
  
  console.log('[Page] server_url:', talebookServerUrl.value || '未配置')
  console.log('[Page] ================================')
  
  // 然后加载最近书籍
  loadRecentBooks()
})

// 监听标签页切换，自动加载数据
watch(activeTab, (newTab, oldTab) => {
  log.info('Tab', `标签页切换: ${oldTab} -> ${newTab}`)
  
  if (newTab === 'favorites') {
    // 切换到收藏标签页时，如果列表为空则加载
    if (favoriteBooks.value.length === 0 && !loadingFavorites.value) {
      loadFavoriteBooks()
    }
  } else if (newTab === 'reading') {
    // 切换到在读标签页时，如果列表为空则加载
    if (readingBooks.value.length === 0 && !loadingReading.value) {
      loadReadingBooks()
    }
  }
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}

/* 文本截断样式 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 旋转动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
