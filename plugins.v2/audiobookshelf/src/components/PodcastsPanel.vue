<template>
  <v-card elevation="4">
    <v-card-title class="text-subtitle-1 py-3 d-flex align-center justify-space-between">
      <div>
        <v-icon start color="primary">mdi-podcast</v-icon>
        播客管理
      </div>
      <div>
        <v-select
          v-model="selectedLibrary"
          :items="libraryOptions"
          label="选择库"
          variant="outlined"
          density="compact"
          style="width: 200px; display: inline-block;"
          @update:model-value="loadPodcasts"
        ></v-select>
        <v-btn
          class="ml-2"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadPodcasts"
        >
          刷新
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <!-- 加载状态 -->
      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

      <!-- 错误提示 -->
      <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = ''">
        {{ error }}
      </v-alert>

      <!-- 播客列表 -->
      <v-row v-if="!loading && podcasts.length > 0">
        <v-col
          v-for="podcast in podcasts"
          :key="podcast.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card variant="outlined" hover>
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar size="60" rounded="0">
                  <v-icon size="40" color="grey">mdi-podcast</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">
                {{ podcast.metadata?.title || '未知播客' }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" color="primary" class="mr-1">
                  {{ podcast.episodes?.length || 0 }} 集
                </v-chip>
                <v-chip size="x-small" variant="outlined">
                  {{ podcast.metadata?.author || '未知作者' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-download"
                @click="checkNewEpisodes(podcast.id)"
              >
                检查更新
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 空状态 -->
      <v-empty-state
        v-if="!loading && podcasts.length === 0 && !error"
        icon="mdi-podcast"
        title="暂无播客"
        text="请先选择一个包含播客的库"
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
const selectedLibrary = ref('')
const libraryOptions = ref<{ title: string; value: string }[]>([])
const podcasts = ref<any[]>([])

// 加载库列表(用于下拉选择)
async function loadLibraries() {
  try {
    const response = await props.api.get('plugin/Audiobookshelf/libraries')
    
    if (response.code === 200) {
      const libraries = response.data?.libraries || []
      // 只显示播客库
      const podcastLibraries = libraries.filter((lib: any) => lib.mediaType === 'podcast')
      
      libraryOptions.value = podcastLibraries.map((lib: any) => ({
        title: lib.name,
        value: lib.id
      }))
      
      // 默认选择第一个播客库
      if (podcastLibraries.length > 0 && !selectedLibrary.value) {
        selectedLibrary.value = podcastLibraries[0].id
        loadPodcasts()
      }
    }
  } catch (err: any) {
    console.error('加载库列表失败:', err)
  }
}

// 加载播客列表
async function loadPodcasts() {
  if (!selectedLibrary.value) {
    podcasts.value = []
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // 获取库项目列表
    const response = await props.api.get(`plugin/Audiobookshelf/library/${selectedLibrary.value}/items`)
    
    if (response.code === 200) {
      const items = response.data?.results || []
      // 过滤出播客类型的项目
      podcasts.value = items.filter((item: any) => item.mediaType === 'podcast')
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err: any) {
    console.error('加载播客列表失败:', err)
    error.value = err.message || '网络错误'
  } finally {
    loading.value = false
  }
}

// 检查新剧集
async function checkNewEpisodes(podcastId: string) {
  try {
    const response = await props.api.get(`plugin/Audiobookshelf/podcast/${podcastId}/checknew`)
    
    if (response.code === 200) {
      const episodes = response.data?.episodes || []
      alert(`成功下载 ${episodes.length} 个新剧集`)
      // 重新加载播客列表
      loadPodcasts()
    } else {
      alert(response.message || '检查失败')
    }
  } catch (err: any) {
    console.error('检查新剧集失败:', err)
    alert(err.message || '网络错误')
  }
}

onMounted(() => {
  loadLibraries()
})
</script>
