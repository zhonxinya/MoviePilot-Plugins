<template>
  <div class="browse-page">
    <!-- 页面标题和筛选条件 -->
    <v-card class="mb-4 elevation-2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
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
            <v-chip color="primary" size="large">
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
    <div v-if="totalPages > 1" class="mt-4 d-flex justify-center">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
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
}

const props = withDefaults(defineProps<Props>(), {
  metaType: '',
  metaName: ''
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
  if (!book.id) return ''
  return `/api/v1/plugin/Talebook/book/${book.id}/cover`
}

/**
 * 加载书籍列表
 */
async function loadBooks() {
  loading.value = true
  
  try {
    let url = ''
    const params = new URLSearchParams()
    
    // 如果有元数据筛选条件
    if (props.metaType && props.metaName) {
      // 按元数据分类获取书籍
      url = `/api/v1/plugin/Talebook/meta/${props.metaType}/${encodeURIComponent(props.metaName)}`
      params.append('page', currentPage.value.toString())
      params.append('num', '20')
    } else {
      // 获取全部书籍(分页)
      url = '/api/v1/plugin/Talebook/books'
      params.append('page', currentPage.value.toString())
      params.append('limit', '20')
    }
    
    const response = await fetch(`${url}?${params.toString()}`)
    const data = await response.json()
    
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
    const response = await fetch(`/api/v1/plugin/Talebook/book/detail/${bookId}`)
    const data = await response.json()
    
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
