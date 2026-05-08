<template>
  <div class="meta-category-page">
    <!-- 元数据类型选择器 -->
    <v-card class="mb-4 elevation-2">
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
              @update:model-value="loadMetaList"
            />
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-chip color="primary" size="large">
              <v-icon start>mdi-format-list-bulleted</v-icon>
              共 {{ metaList.length }} 项
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 元数据列表 -->
    <v-card v-if="!loading" class="elevation-2">
      <v-card-text>
        <v-row>
          <v-col
            v-for="item in metaList"
            :key="item.name"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :class="{ 'on-hover': isHovering }"
                :elevation="isHovering ? 8 : 2"
                class="transition-swing"
                @click="viewMetaBooks(item.name)"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div class="flex-grow-1 mr-2">
                      <div class="text-subtitle-1 font-weight-medium text-truncate">
                        {{ item.name }}
                      </div>
                      <div class="text-caption text-grey mt-1">
                        <v-icon size="small" class="mr-1">mdi-book-multiple</v-icon>
                        {{ item.count }} 本书
                      </div>
                    </div>
                    <v-icon color="primary" size="large">
                      mdi-chevron-right
                    </v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>

        <!-- 空状态 -->
        <v-empty-state
          v-if="metaList.length === 0"
          icon="mdi-tag-off-outline"
          title="暂无数据"
          :text="`还没有${getMetaTypeName(selectedMetaType)}信息`"
          class="mt-8"
        />
      </v-card-text>
    </v-card>

    <!-- 加载状态 -->
    <v-card v-else class="elevation-2">
      <v-card-text class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="mt-4 text-body-1">加载中...</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MetaItem {
  name: string
  count: number
}

const selectedMetaType = ref('tag')
const metaList = ref<MetaItem[]>([])
const loading = ref(false)

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
 * 加载元数据列表
 */
async function loadMetaList() {
  loading.value = true
  metaList.value = []
  
  try {
    const response = await fetch(`/api/v1/plugin/Talebook/meta/${selectedMetaType.value}?show_all=true`)
    const data = await response.json()
    
    if (data.code === 200) {
      metaList.value = data.data || []
    } else {
      console.error('加载元数据列表失败:', data.message)
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
function viewMetaBooks(name: string) {
  // 跳转到书籍浏览页面,并带上筛选条件
  const encodedName = encodeURIComponent(name)
  window.location.href = `#/browse?meta=${selectedMetaType.value}&name=${encodedName}`
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

.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.on-hover {
  transform: translateY(-4px);
}
</style>
