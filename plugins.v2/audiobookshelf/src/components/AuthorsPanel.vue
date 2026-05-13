<template>
  <v-card elevation="4">
    <v-card-title class="text-subtitle-1 py-3 d-flex align-center justify-space-between">
      <div>
        <v-icon start color="primary">mdi-account-multiple</v-icon>
        作者管理
      </div>
      <div>
        <v-select
          v-model="selectedLibrary"
          :items="libraryOptions"
          label="选择库"
          variant="outlined"
          density="compact"
          style="width: 200px; display: inline-block;"
          @update:model-value="loadAuthors"
        ></v-select>
        <v-btn
          class="ml-2"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadAuthors"
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

      <!-- 作者列表 -->
      <v-row v-if="!loading && authors.length > 0">
        <v-col
          v-for="author in authors"
          :key="author.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card variant="outlined" hover>
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar size="60">
                  <v-icon size="40" color="grey">mdi-account</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">
                {{ author.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" color="primary" class="mr-1">
                  {{ author.numBooks || 0 }} 本书
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-information"
                @click="viewAuthorDetail(author.id)"
              >
                详情
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 空状态 -->
      <v-empty-state
        v-if="!loading && authors.length === 0 && !error"
        icon="mdi-account-multiple"
        title="暂无作者"
        text="请先选择一个库"
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
const authors = ref<any[]>([])

// 加载库列表(用于下拉选择)
async function loadLibraries() {
  try {
    const response = await props.api.get('plugin/Audiobookshelf/libraries')
    
    if (response.code === 200) {
      const libraries = response.data?.libraries || []
      libraryOptions.value = libraries.map((lib: any) => ({
        title: lib.name,
        value: lib.id
      }))
      
      // 默认选择第一个库
      if (libraries.length > 0 && !selectedLibrary.value) {
        selectedLibrary.value = libraries[0].id
        loadAuthors()
      }
    }
  } catch (err: any) {
    console.error('加载库列表失败:', err)
  }
}

// 加载作者列表
async function loadAuthors() {
  if (!selectedLibrary.value) {
    authors.value = []
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await props.api.get(`plugin/Audiobookshelf/authors`, {
      params: { library_id: selectedLibrary.value }
    })
    
    if (response.code === 200) {
      authors.value = response.data?.authors || []
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err: any) {
    console.error('加载作者列表失败:', err)
    error.value = err.message || '网络错误'
  } finally {
    loading.value = false
  }
}

// 查看作者详情
function viewAuthorDetail(authorId: string) {
  console.log('查看作者详情:', authorId)
  // 后续可以实现作者详情对话框
}

onMounted(() => {
  loadLibraries()
})
</script>
