<template>
  <v-card elevation="4">
    <v-card-title class="text-subtitle-1 py-3 d-flex align-center justify-space-between">
      <div>
        <v-icon start color="primary">mdi-library</v-icon>
        库列表
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadLibraries"
      >
        刷新
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <!-- 加载状态 -->
      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

      <!-- 错误提示 -->
      <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = ''">
        {{ error }}
      </v-alert>

      <!-- 库列表 -->
      <v-row v-if="!loading && libraries.length > 0">
        <v-col
          v-for="library in libraries"
          :key="library.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card variant="outlined" hover>
            <v-card-title class="d-flex align-center">
              <v-icon start color="primary">{{ getLibraryIcon(library.icon) }}</v-icon>
              {{ library.name }}
            </v-card-title>
            <v-card-subtitle>
              <v-chip size="small" color="primary" class="mr-2">
                {{ library.mediaType === 'book' ? '有声书' : '播客' }}
              </v-chip>
              <v-chip size="small" variant="outlined">
                {{ library.folders?.length || 0 }} 个文件夹
              </v-chip>
            </v-card-subtitle>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-book-search"
                @click="viewLibraryItems(library.id)"
              >
                浏览项目
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-account-multiple"
                @click="viewAuthors(library.id)"
              >
                作者
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 空状态 -->
      <v-empty-state
        v-if="!loading && libraries.length === 0 && !error"
        icon="mdi-library"
        title="暂无库"
        text="请先在 Audiobookshelf 中创建库"
      ></v-empty-state>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  api: {
    type: Object,
    default: () => ({})
  }
})

const loading = ref(false)
const error = ref('')
const libraries = ref<any[]>([])

// 加载库列表
async function loadLibraries() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await props.api.get('plugin/Audiobookshelf/libraries')
    
    if (response.code === 200) {
      libraries.value = response.data?.libraries || []
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err: any) {
    console.error('加载库列表失败:', err)
    error.value = err.message || '网络错误'
  } finally {
    loading.value = false
  }
}

// 获取库图标
function getLibraryIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'audiobookshelf': 'mdi-bookshelf',
    'book': 'mdi-book',
    'podcast': 'mdi-podcast',
    'music': 'mdi-music',
    'video': 'mdi-video'
  }
  return iconMap[icon] || 'mdi-library'
}

// 浏览库项目
function viewLibraryItems(libraryId: string) {
  // 切换到库项目视图(后续实现)
  console.log('查看库项目:', libraryId)
}

// 查看作者
function viewAuthors(libraryId: string) {
  // 切换到作者视图(后续实现)
  console.log('查看作者:', libraryId)
}

onMounted(() => {
  loadLibraries()
})
</script>
