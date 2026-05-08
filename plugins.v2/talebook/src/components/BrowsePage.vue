<template>
  <div class="browse-page">
    <!-- 页面标题和筛选条件 -->
    <v-card class="mb-4 elevation-2" color="primary" variant="tonal">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                color="primary"
                class="mr-2"
                @click="goBack"
              />
              <v-icon size="x-large" color="primary" class="mr-3">
                {{ getMetaTypeIcon(metaType) }}
              </v-icon>
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ metaName || '全部书籍' }}
                </div>
                <div class="text-body-2 text-grey mt-1">
                  {{ getMetaTypeName(metaType) }}分类浏览
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-chip color="primary" size="large" variant="elevated">
              <v-icon start>mdi-book-multiple</v-icon>
              共 {{ totalBooks }} 本
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 书籍网格 -->
    <BookGrid
      v-if="!loading && books.length > 0"
      :books="books"
      title=""
      icon=""
      :favorite-book-ids="new Set()"
      :loading="loading"
      :show-refresh="true"
      :get-cover-url="getCoverUrl"
      @detail="handleBookDetail"
      @refresh="loadBooks"
    />

    <!-- 加载状态 -->
    <v-card v-else-if="loading" class="elevation-2">
      <v-card-text class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="mt-4 text-body-1">加载中...</div>
      </v-card-text>
    </v-card>

    <!-- 空状态 -->
    <v-card v-else class="elevation-2">
      <v-card-text class="text-center py-8">
        <v-empty-state
          icon="mdi-book-off-outline"
          title="暂无书籍"
          text="该分类下还没有书籍"
        />
      </v-card-text>
    </v-card>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-6 d-flex justify-center">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        size="large"
        color="primary"
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- 书籍详情对话框 -->
    <BookDetailDialog
      v-model="showDetailDialog"
      :book="selectedBook"
      :cover-url="selectedBook ? getCoverUrl(selectedBook) : ''"
      @toggle-favorite="handleToggleFavorite"
      @download="handleDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BookGrid from './BookGrid.vue'
import BookDetailDialog from './BookDetailDialog.vue'

interface Props {
  metaType?: string  // tag/author/series/rating/publisher/language
  metaName?: string  // 具体的元数据名称
  api?: any  // MoviePilot-Frontend 提供的 API 对象
}

const props = withDefaults(defineProps<Props>(), {
  metaType: '',
  metaName: '',
  api: undefined
})

// 响应式数据
const books = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalBooks = ref(0)
const showDetailDialog = ref(false)
const selectedBookId = ref<number | null>(null)
const selectedBook = ref<any | null>(null)

/**
 * 获取元数据类型图标
 */
function getMetaTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    tag: 'mdi-tag',
    author: 'mdi-account',
    series: 'mdi-bookshelf',
    rating: 'mdi-star',
    publisher: 'mdi-domain',
    language: 'mdi-translate'
  }
  return iconMap[type] || 'mdi-book'
}

/**
 * 获取元数据类型中文名
 */
function getMetaTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    tag: '标签',
    author: '作者',
    series: '丛书',
    rating: '评分',
    publisher: '出版社',
    language: '语言'
  }
  return typeMap[type] || type
}

/**
 * 获取封面 URL
 */
function getCoverUrl(book: any): string {
  if (!book) return ''
  
  // 优先使用 thumb 字段(缩略图)
  if (book.thumb) {
    if (book.thumb.startsWith('http://') || book.thumb.startsWith('https://')) {
      return book.thumb
    }
    // 如果是相对路径,通过插件 API 代理访问
    return getApiUrl(book.thumb)
  }
  
  // 其次使用 img 字段(大图)
  if (book.img) {
    if (book.img.startsWith('http://') || book.img.startsWith('https://')) {
      return book.img
    }
    return getApiUrl(book.img)
  }
  
  // 最后使用插件 API
  if (book.id) {
    return `/api/v1/plugin/Talebook/book/${book.id}/cover`
  }
  
  return ''
}

/**
 * 获取插件 API URL
 */
function getApiUrl(path: string): string {
  // 如果路径已经是完整 URL,直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 否则通过插件 API 代理
  return `/api/v1/plugin/Talebook${path}`
}

/**
 * 加载书籍列表
 */
async function loadBooks() {
  loading.value = true
  
  try {
    let url = ''
    const params: any = {}
    
    // 如果有元数据筛选条件
    if (props.metaType && props.metaName) {
      // 按元数据分类获取书籍
      url = `/plugin/Talebook/meta/${props.metaType}/${encodeURIComponent(props.metaName)}`
      params.page = currentPage.value
      params.num = 20
    } else {
      // 获取全部书籍(分页)
      url = '/plugin/Talebook/books'
      params.page = currentPage.value
      params.limit = 20
    }
    
    // 使用 api 对象或 fetch
    let data
    if (props.api) {
      console.log('[BrowsePage] 开始加载书籍列表, URL:', url)
      const response = await props.api.get(url, { params })
      console.log('[BrowsePage] API 响应类型:', typeof response)
      console.log('[BrowsePage] API 响应完整内容:', JSON.stringify(response, null, 2))
      data = response
    } else {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`${url}?${queryString}`)
      data = await response.json()
    }
    
    if (data.code === 200) {
      // 处理不同的返回格式
      if (props.metaType && props.metaName) {
        // 元数据分类返回: {code, data: [...], total, title}
        books.value = data.data || []
        totalBooks.value = data.total || books.value.length
      } else {
        // 通用列表返回: {code, data: {books: [...], total, page, limit}}
        books.value = data.data?.books || []
        totalBooks.value = data.data?.total || books.value.length
      }
      totalPages.value = Math.ceil(totalBooks.value / 20)
    } else {
      console.error('加载书籍失败:', data.message)
      books.value = []
    }
  } catch (error) {
    console.error('加载书籍异常:', error)
    books.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 处理页码变化
 */
function handlePageChange(page: number) {
  currentPage.value = page
  loadBooks()
}

/**
 * 处理书籍详情点击
 */
async function handleBookDetail(bookId: number) {
  selectedBookId.value = bookId
  
  // 获取书籍详情
  try {
    let data
    if (props.api) {
      const response = await props.api.get(`/plugin/Talebook/book/detail/${bookId}`)
      data = response
    } else {
      const response = await fetch(`/plugin/Talebook/book/detail/${bookId}`)
      data = await response.json()
    }
    
    if (data.code === 200) {
      selectedBook.value = data.data
      showDetailDialog.value = true
    } else {
      console.error('获取书籍详情失败:', data.message)
    }
  } catch (error) {
    console.error('获取书籍详情异常:', error)
  }
}

/**
 * 处理收藏切换
 */
function handleToggleFavorite(bookId: number) {
  console.log('切换收藏状态:', bookId)
  // TODO: 实现收藏功能
}

/**
 * 处理下载
 */
function handleDownload(bookId: number) {
  console.log('下载书籍:', bookId)
  // TODO: 实现下载功能
}

/**
 * 返回上一页
 */
function goBack() {
  window.history.back()
}

// 监听路由参数变化
watch(() => [props.metaType, props.metaName], () => {
  currentPage.value = 1
  loadBooks()
})

// 组件挂载时加载数据
onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.browse-page {
  min-height: 100%;
}
</style>
