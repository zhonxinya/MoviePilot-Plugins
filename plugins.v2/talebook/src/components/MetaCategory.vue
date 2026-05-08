<template>
  <div class="meta-category-page">
    <!-- 元数据类型选择器 -->
    <v-card class="mb-4 elevation-2" color="primary" variant="tonal">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedMetaType"
              :items="metaTypes"
              item-title="label"
              item-value="value"
              label="选择元数据类型"
              prepend-icon="mdi-tag-multiple"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              @update:model-value="loadMetaList"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchKeyword"
              label="搜索"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              bg-color="white"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 统计信息 -->
    <v-alert
      v-if="!loading && filteredList.length > 0"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      <template v-slot:prepend>
        <v-icon>mdi-information-outline</v-icon>
      </template>
      共 {{ filteredList.length }} 项，点击可查看该分类下的书籍
    </v-alert>

    <!-- 元数据列表 -->
    <v-card v-if="!loading" class="elevation-2">
      <v-card-text>
        <!-- 骨架屏加载 -->
        <v-skeleton-loader
          v-if="metaList.length === 0 && !searchKeyword"
          type="list-item-three-line"
          :loading="true"
          class="mb-2"
        />
        
        <v-row v-else>
          <v-col
            v-for="item in filteredList"
            :key="item.name"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="2"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :class="{ 'on-hover': isHovering }"
                :elevation="isHovering ? 12 : 2"
                class="transition-swing meta-card"
                @click="viewMetaBooks(item.name)"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-center">
                    <div class="flex-grow-1 mr-3">
                      <div class="text-subtitle-1 font-weight-bold text-truncate mb-1">
                        {{ item.name }}
                      </div>
                      <div class="d-flex align-center">
                        <v-icon size="small" color="primary" class="mr-1">mdi-book-multiple</v-icon>
                        <span class="text-body-2 font-weight-medium">{{ item.count }}</span>
                        <span class="text-caption text-grey ml-1">本</span>
                      </div>
                    </div>
                    <v-icon
                      color="primary"
                      :size="isHovering ? 'large' : 'default'"
                      class="transition-swing"
                    >
                      mdi-chevron-right
                    </v-icon>
                  </div>
                </v-card-text>
                
                <!-- 底部装饰条 -->
                <v-divider />
                <div class="card-footer pa-2 d-flex justify-space-between align-center">
                  <v-chip size="x-small" color="primary" variant="tonal">
                    {{ getMetaTypeName(selectedMetaType) }}
                  </v-chip>
                  <v-icon size="small" color="grey-lighten-1">mdi-arrow-right-circle</v-icon>
                </div>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>

        <!-- 空状态 -->
        <v-empty-state
          v-if="filteredList.length === 0 && !loading"
          icon="mdi-tag-off-outline"
          title="暂无数据"
          :text="searchKeyword ? `未找到包含“${searchKeyword}”的${getMetaTypeName(selectedMetaType)}` : `还没有${getMetaTypeName(selectedMetaType)}信息`"
          class="mt-8"
        >
          <template v-slot:actions>
            <v-btn
              v-if="searchKeyword"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-close"
              @click="searchKeyword = ''"
            >
              清除搜索
            </v-btn>
          </template>
        </v-empty-state>
      </v-card-text>
    </v-card>

    <!-- 加载状态 -->
    <v-card v-else class="elevation-2">
      <v-card-text class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="mt-4 text-body-1">加载中...</div>
      </v-card-text>
    </v-card>

    <!-- 书籍列表对话框 -->
    <v-dialog
      v-model="showBooksDialog"
      max-width="1200"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="mr-2">{{ getMetaTypeIcon(selectedMetaType) }}</v-icon>
          <span class="text-h5 font-weight-bold">{{ currentMetaName }}</span>
          <v-spacer />
          <v-chip color="primary" variant="elevated">
            <v-icon start>mdi-book-multiple</v-icon>
            {{ dialogBooks.length }} 本
          </v-chip>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showBooksDialog = false"
            class="ml-2"
          />
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <!-- 加载中 -->
          <div v-if="dialogLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48" />
            <div class="mt-4 text-body-1">加载书籍中...</div>
          </div>
          
          <!-- 书籍网格 -->
          <v-row v-else-if="dialogBooks.length > 0" dense>
            <v-col
              v-for="book in dialogBooks"
              :key="book.id"
              cols="6"
              sm="4"
              md="3"
              lg="2"
            >
              <BookCard
                :book="book"
                :cover-url="getCoverUrl(book)"
                :is-favorited="false"
                :is-downloading="false"
                @detail="handleBookDetail"
              />
            </v-col>
          </v-row>
          
          <!-- 空状态 -->
          <v-empty-state
            v-else
            icon="mdi-book-off-outline"
            title="暂无书籍"
            text="该分类下还没有书籍"
            class="py-8"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted } from 'vue'
import BookCard from './BookCard.vue'
import BookDetailDialog from './BookDetailDialog.vue'

interface Props {
  api?: any  // MoviePilot-Frontend 提供的 API 对象
}

const props = withDefaults(defineProps<Props>(), {
  api: undefined
})

interface MetaItem {
  name: string
  count: number
}

const selectedMetaType = ref('tag')
const metaList = ref<MetaItem[]>([])
const loading = ref(false)
const searchKeyword = ref('')

// 对话框相关
const showBooksDialog = ref(false)
const dialogLoading = ref(false)
const dialogBooks = ref<any[]>([])
const currentMetaName = ref('')
const showDetailDialog = ref(false)
const selectedBook = ref<any | null>(null)

// 过滤后的列表(支持搜索)
const filteredList = computed(() => {
  if (!searchKeyword.value) {
    return metaList.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return metaList.value.filter(item => 
    item.name.toLowerCase().includes(keyword)
  )
})

// 元数据类型选项
const metaTypes = [
  { label: '标签', value: 'tag', icon: 'mdi-tag' },
  { label: '作者', value: 'author', icon: 'mdi-account' },
  { label: '丛书', value: 'series', icon: 'mdi-bookshelf' },
  { label: '评分', value: 'rating', icon: 'mdi-star' },
  { label: '出版社', value: 'publisher', icon: 'mdi-domain' },
  { label: '语言', value: 'language', icon: 'mdi-translate' }
]

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
 * 获取封面 URL
 */
function getCoverUrl(book: any): string {
  if (!book.id) return ''
  return `/api/v1/plugin/Talebook/book/${book.id}/cover`
}

/**
 * 加载元数据列表
 */
async function loadMetaList() {
  loading.value = true
  metaList.value = []
  
  try {
    // 如果有 api 对象,使用它来调用(自动携带认证)
    if (props.api) {
      console.log('[MetaCategory] 开始加载元数据列表:', selectedMetaType.value)
      const response = await props.api.get(`/plugin/Talebook/meta/${selectedMetaType.value}`, {
        params: { show_all: true }
      })
      
      console.log('[MetaCategory] API 响应类型:', typeof response)
      console.log('[MetaCategory] API 响应完整内容:', JSON.stringify(response, null, 2))
      
      // MoviePilot-Frontend 的 api.get() 可能直接返回数据,也可能返回 {code, data}
      let dataList = []
      if (response && response.code === 200) {
        console.log('[MetaCategory] 检测到 code=200,使用 response.data')
        dataList = response.data || []
      } else if (Array.isArray(response)) {
        console.log('[MetaCategory] 检测到数组,直接使用')
        dataList = response
      } else if (response && response.items) {
        // Talebook 原始格式
        console.log('[MetaCategory] 检测到 items 字段,使用 response.items')
        dataList = response.items
      } else if (response && response.err === 'ok' && response.items) {
        // Talebook 原始格式(未转换)
        console.log('[MetaCategory] 检测到 Talebook 原始格式 err=ok')
        dataList = response.items
      } else {
        console.warn('[MetaCategory] 无法识别的响应格式,尝试直接使用 response')
        dataList = response || []
      }
      
      metaList.value = dataList
      console.log('[MetaCategory] 加载成功,共', dataList.length, '条')
    } else {
      // 降级方案: 使用 fetch
      const response = await fetch(`/plugin/Talebook/meta/${selectedMetaType.value}?show_all=true`)
      const data = await response.json()
      
      console.log('[MetaCategory] Fetch 响应:', data)
      
      if (data.code === 200) {
        metaList.value = data.data || []
      } else {
        console.error('加载元数据列表失败:', data.message)
      }
    }
  } catch (error) {
    console.error('加载元数据列表异常:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 查看指定元数据的书籍
 */
async function viewMetaBooks(name: string) {
  currentMetaName.value = name
  showBooksDialog.value = true
  dialogLoading.value = true
  dialogBooks.value = []
  
  try {
    let data
    if (props.api) {
      const response = await props.api.get(`/plugin/Talebook/meta/${selectedMetaType.value}/${encodeURIComponent(name)}`, {
        params: { page: 1, num: 50 }
      })
      data = response
    } else {
      const response = await fetch(`/plugin/Talebook/meta/${selectedMetaType.value}/${encodeURIComponent(name)}?page=1&num=50`)
      data = await response.json()
    }
    
    if (data.code === 200) {
      dialogBooks.value = data.data || []
    } else {
      console.error('加载书籍失败:', data.message)
    }
  } catch (error) {
    console.error('加载书籍异常:', error)
  } finally {
    dialogLoading.value = false
  }
}

/**
 * 处理书籍详情点击
 */
async function handleBookDetail(bookId: number) {
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

// 组件挂载时加载数据
onMounted(() => {
  loadMetaList()
})
</script>

<style scoped>
.meta-category-page {
  min-height: 100%;
}

.meta-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.meta-card:hover {
  transform: translateY(-4px);
}

.card-footer {
  background: linear-gradient(to right, rgba(var(--v-theme-primary), 0.05), transparent);
}

.on-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
