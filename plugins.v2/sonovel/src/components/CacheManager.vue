<script setup>
const props = defineProps({
  cacheStatus: {
    type: Object,
    default: null
  },
  isLoadingCache: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'clear'])

// 格式化 TTL 时间
function formatTTL(seconds) {
  if (!seconds) return 'N/A'
  
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    return `${Math.floor(seconds / 3600)}小时`
  }
}

// 刷新缓存状态
function handleRefresh() {
  emit('refresh')
}

// 清空缓存
function handleClear() {
  emit('clear')
}
</script>

<template>
  <v-card class="cache-card" elevation="6">
    <v-card-title class="d-flex align-center py-4 bg-gradient-cache">
      <v-avatar size="44" color="white" class="mr-3 elevation-3">
        <v-icon icon="mdi-database" size="24" color="purple"></v-icon>
      </v-avatar>
      <div>
        <span class="text-h6 font-weight-bold text-white d-block">缓存管理</span>
        <span class="text-caption text-white-opacity">优化性能和存储空间</span>
      </div>
    </v-card-title>
    <v-card-text class="pa-5">
      <v-progress-linear 
        v-if="isLoadingCache" 
        indeterminate 
        color="primary"
        class="mb-4"
      ></v-progress-linear>
      
      <v-row v-if="cacheStatus">
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="cache-stat-card">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-icon size="32" color="primary" class="mr-3">mdi-database-check</v-icon>
                <div>
                  <div class="text-caption text-grey">缓存条目数</div>
                  <div class="text-h4 font-weight-bold text-primary">{{ cacheStatus.cache_size || 0 }}</div>
                </div>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="text-body-2 text-grey">
                已缓存的搜索关键词数量
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="cache-stat-card">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-icon size="32" color="success" class="mr-3">mdi-memory</v-icon>
                <div>
                  <div class="text-caption text-grey">内存使用</div>
                  <div class="text-h4 font-weight-bold text-success">{{ cacheStatus.memory_usage || 'N/A' }}</div>
                </div>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="text-body-2 text-grey">
                当前内存中的缓存数据
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="cache-stat-card">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-icon size="32" color="info" class="mr-3">mdi-clock-outline</v-icon>
                <div>
                  <div class="text-caption text-grey">缓存有效期</div>
                  <div class="text-h4 font-weight-bold text-info">{{ formatTTL(cacheStatus.cache_ttl) }}</div>
                </div>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="text-body-2 text-grey">
                每条缓存的保存时间
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <v-alert
        type="info"
        variant="tonal"
        density="comfortable"
        class="mt-4"
        border="start"
      >
        <template #prepend>
          <v-icon>mdi-information-outline</v-icon>
        </template>
        <div>
          <strong>缓存说明：</strong><br>
          • 缓存可以加快重复搜索的速度<br>
          • 缓存数据会在插件重启时自动保存<br>
          • 定期清理过期缓存可释放存储空间
        </div>
      </v-alert>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn 
        color="primary" 
        variant="flat"
        prepend-icon="mdi-refresh"
        @click="handleRefresh"
        :loading="isLoadingCache"
        elevation="2"
      >
        刷新状态
      </v-btn>
      <v-btn 
        color="warning" 
        variant="outlined"
        prepend-icon="mdi-delete-forever"
        @click="handleClear"
        :loading="isLoadingCache"
        elevation="2"
      >
        清空缓存
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.bg-gradient-cache {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.text-white-opacity {
  color: rgba(255, 255, 255, 0.9) !important;
}

.cache-stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cache-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}
</style>
