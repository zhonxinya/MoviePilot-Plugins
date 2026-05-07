<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SearchHeader from './SearchHeader.vue'
import TabNavigation from './TabNavigation.vue'
import ResultsList from './ResultsList.vue'
import HistoryList from './HistoryList.vue'
import CacheManager from './CacheManager.vue'
import NotificationContainer from './NotificationContainer.vue'
import { UI_CONSTANTS } from '../constants'

const props = defineProps({
  api: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['action', 'switch', 'close'])

// 调试信息
console.log('[SoNovel Page] ========== 组件加载 ==========')
console.log('[SoNovel Page] Props:', props)

// 插件 ID
const pluginId = 'Sonovel'

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const error = ref('')

// 分页相关
const PAGE_SIZE = UI_CONSTANTS.PAGE_SIZE
const currentPage = ref(1)
const isLoadingMore = ref(false)

// 合并同名同作者的小说
const mergedResults = computed(() => {
  const mergedMap = new Map()
  
  searchResults.value.forEach(book => {
    const key = `${book.bookName}|||${book.author}`
    
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)
      if (!existing.sources) {
        existing.sources = [existing]
      }
      existing.sources.push(book)
      
      if (!existing.coverUrl && book.coverUrl) {
        existing.coverUrl = book.coverUrl
      }
      
      if (book.latestChapter && (!existing.latestChapter || book.lastUpdateTime > existing.lastUpdateTime)) {
        existing.latestChapter = book.latestChapter
        existing.lastUpdateTime = book.lastUpdateTime
      }
    } else {
      mergedMap.set(key, { ...book })
    }
  })
  
  return Array.from(mergedMap.values())
})

// 计算显示的结果
const displayedResults = computed(() => {
  return mergedResults.value.slice(0, currentPage.value * PAGE_SIZE)
})

// 是否有更多结果
const hasMoreResults = computed(() => {
  return displayedResults.value.length < searchResults.value.length
})

// 剩余结果数量
const remainingCount = computed(() => {
  return searchResults.value.length - displayedResults.value.length
})

// 标签页相关
const currentTab = ref('search')
const cacheStatus = ref(null)
const isLoadingCache = ref(false)

// 搜索历史
const searchHistory = ref([])

// 通知相关
const notifications = ref([])

// 显示通知
function showNotification(type, title, message, duration = UI_CONSTANTS.NOTIFICATION_DURATION) {
  const id = Date.now()
  notifications.value.push({ id, type, title, message, duration })
  setTimeout(() => removeNotification(id), duration)
}

// 移除通知
function removeNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// API 错误处理
async function safeApiCall(apiCall, retries = 2, delay = 1000) {
  let lastError = null
  for (let i = 0; i <= retries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        console.warn(`API 调用失败，第 ${i + 1} 次重试...`, error)
      }
    }
  }
  throw lastError
}

// 执行搜索
async function handleSearch(keyword: string) {
  if (!keyword.trim()) {
    error.value = '请输入搜索关键词'
    return
  }

  searchKeyword.value = keyword
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await safeApiCall(() => 
      props.api.get(`plugin/${pluginId}/search?keyword=${encodeURIComponent(keyword)}`)
    )
    
    if (response.code === 200) {
      searchResults.value = response.data || []
      saveToSearchHistory(keyword, searchResults.value.length)
      showNotification('success', '搜索成功', `找到 ${searchResults.value.length} 本相关书籍`)
      emit('action')
    } else {
      throw new Error(response.message || '搜索失败')
    }
  } catch (err) {
    console.error('搜索出错:', err)
    error.value = err instanceof Error ? err.message : '未知错误'
  } finally {
    isLoading.value = false
  }
}

// 下载书籍
async function handleDownload(book) {
  try {
    const downloadData = {
      sourceId: String(book.sourceId),
      sourceName: book.sourceName,
      url: book.url,
      bookName: book.bookName,
      author: book.author,
      category: book.category || undefined,
      latestChapter: book.latestChapter || undefined,
      lastUpdateTime: book.lastUpdateTime || undefined,
      status: book.status || undefined,
      format: 'epub',
      language: 'zh_CN',
      coverUrl: book.coverUrl || undefined,
    }
    
    const response = await safeApiCall(() => 
      props.api.post(`plugin/${pluginId}/download`, downloadData)
    )
    
    if (response.code === 200) {
      const taskId = response.data?.task_id
      showNotification('success', '任务已提交', `任务ID: ${taskId}\n请在后台查看进度`)
      emit('action')
    } else {
      throw new Error(response.message || '下载失败')
    }
  } catch (err) {
    console.error('下载异常:', err)
    showNotification('error', '下载失败', err instanceof Error ? err.message : '未知错误')
  }
}

// 加载搜索历史
async function loadSearchHistory() {
  try {
    const historyStr = localStorage.getItem('sonovel_search_history')
    searchHistory.value = historyStr ? JSON.parse(historyStr) : []
  } catch (err) {
    console.error('加载搜索历史失败:', err)
    searchHistory.value = []
  }
}

// 保存搜索历史
function saveToSearchHistory(keyword, count) {
  try {
    const history = JSON.parse(localStorage.getItem('sonovel_search_history') || '[]')
    const existingIndex = history.findIndex(item => item.keyword === keyword)
    
    if (existingIndex !== -1) {
      history[existingIndex].count = count
      history[existingIndex].timestamp = new Date().toLocaleString('zh-CN')
      const item = history.splice(existingIndex, 1)[0]
      history.unshift(item)
    } else {
      history.unshift({
        keyword,
        count,
        timestamp: new Date().toLocaleString('zh-CN')
      })
    }
    
    localStorage.setItem('sonovel_search_history', JSON.stringify(history.slice(0, UI_CONSTANTS.MAX_HISTORY_ITEMS)))
    searchHistory.value = history.slice(0, UI_CONSTANTS.MAX_HISTORY_ITEMS)
  } catch (err) {
    console.error('保存搜索历史失败:', err)
  }
}

// 清空搜索结果
function clearResults() {
  searchResults.value = []
  searchKeyword.value = ''
  error.value = ''
  currentPage.value = 1
}

// 删除单条历史记录
function deleteHistoryRecord(index) {
  try {
    searchHistory.value.splice(index, 1)
    localStorage.setItem('sonovel_search_history', JSON.stringify(searchHistory.value))
    showNotification('success', '已删除', '搜索记录已删除')
  } catch (err) {
    console.error('删除历史记录失败:', err)
  }
}

// 清空所有历史记录
function clearAllHistory() {
  try {
    searchHistory.value = []
    localStorage.removeItem('sonovel_search_history')
    showNotification('success', '已清空', '所有搜索历史已清空')
  } catch (err) {
    console.error('清空历史记录失败:', err)
  }
}

// 加载更多结果
function loadMore() {
  isLoadingMore.value = true
  setTimeout(() => {
    currentPage.value++
    isLoadingMore.value = false
  }, UI_CONSTANTS.LOAD_MORE_DELAY)
}

// 关闭组件
function handleClose() {
  emit('close')
}

// 加载缓存状态
async function loadCacheStatus() {
  try {
    isLoadingCache.value = true
    const response = await safeApiCall(() => 
      props.api.get(`plugin/${pluginId}/cache_status`)
    )
    if (response.code === 200) {
      cacheStatus.value = response.data
    }
  } catch (err) {
    console.error('加载缓存状态失败:', err)
  } finally {
    isLoadingCache.value = false
  }
}

// 清空缓存
async function handleClearCache() {
  try {
    const response = await safeApiCall(() => 
      props.api.post(`plugin/${pluginId}/cache/clear`)
    )
    if (response.code === 200) {
      showNotification('success', '缓存已清空', `清除了 ${response.data.cleared_count} 条记录`)
      await loadCacheStatus()
    }
  } catch (err) {
    showNotification('error', '清空缓存失败', err instanceof Error ? err.message : '未知错误')
  }
}

onMounted(() => {
  loadSearchHistory()
  loadCacheStatus()
})
</script>

<template>
  <div class="sonovel-page">
    <!-- 通知区域 -->
    <NotificationContainer 
      :notifications="notifications"
      @remove="removeNotification"
    />

    <!-- 搜索头部 -->
    <SearchHeader
      v-model:search-keyword="searchKeyword"
      :is-loading="isLoading"
      :error="error"
      @search="handleSearch"
      @close="handleClose"
    />

    <!-- 标签页导航 -->
    <TabNavigation
      v-model:current-tab="currentTab"
      :results-count="mergedResults.length"
      :history-count="searchHistory.length"
    />

    <!-- 标签页内容 -->
    <v-window v-model="currentTab">
      <!-- 搜索结果标签页 -->
      <v-window-item value="search">
        <ResultsList
          :results="mergedResults"
          :displayed-results="displayedResults"
          :has-more-results="hasMoreResults"
          :remaining-count="remainingCount"
          :is-loading-more="isLoadingMore"
          @download="handleDownload"
          @clear="clearResults"
          @load-more="loadMore"
        />
      </v-window-item>

      <!-- 搜索历史标签页 -->
      <v-window-item value="history">
        <HistoryList
          :history="searchHistory"
          @search="(keyword) => { currentTab = 'search'; handleSearch(keyword) }"
          @delete="deleteHistoryRecord"
          @clear-all="clearAllHistory"
          @go-to-search="currentTab = 'search'"
        />
      </v-window-item>

      <!-- 缓存管理标签页 -->
      <v-window-item value="cache">
        <CacheManager
          :cache-status="cacheStatus"
          :is-loading-cache="isLoadingCache"
          @refresh="loadCacheStatus"
          @clear="handleClearCache"
        />
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.sonovel-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 600px) {
  .sonovel-page {
    padding: 12px;
  }
}
</style>
