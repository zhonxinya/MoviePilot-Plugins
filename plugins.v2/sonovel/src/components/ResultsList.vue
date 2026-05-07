<script setup>
import BookCard from './BookCard.vue'
import { UI_CONSTANTS } from '../constants'

const props = defineProps({
  results: {
    type: Array,
    required: true
  },
  displayedResults: {
    type: Array,
    required: true
  },
  hasMoreResults: {
    type: Boolean,
    default: false
  },
  remainingCount: {
    type: Number,
    default: 0
  },
  isLoadingMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['download', 'clear', 'loadMore'])

// 下载书籍
function handleDownload(book) {
  emit('download', book)
}

// 清空结果
function handleClear() {
  emit('clear')
}

// 加载更多
function handleLoadMore() {
  emit('loadMore')
}
</script>

<template>
  <v-card v-if="results.length > 0" class="mb-6 results-container" elevation="6">
    <v-card-title class="d-flex align-center justify-space-between py-4 bg-gradient glass-effect">
      <div class="d-flex align-center">
        <v-avatar size="48" color="success" class="mr-3 elevation-4 bounce-in">
          <v-icon icon="mdi-format-list-bulleted" size="26" color="white"></v-icon>
        </v-avatar>
        <div>
          <span class="text-h5 font-weight-bold text-white d-block">搜索结果</span>
          <span class="text-subtitle-2 text-white-opacity">
            共找到 {{ results.length }} 本相关书籍
          </span>
        </div>
      </div>
      <v-btn 
        size="small" 
        variant="outlined" 
        color="white"
        prepend-icon="mdi-close"
        @click="handleClear"
        class="white--text"
      >
        清空结果
      </v-btn>
    </v-card-title>
    <v-card-text class="pa-5">
      <v-row>
        <v-col
          v-for="(book, index) in displayedResults"
          :key="book.url"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="animate-fade-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <BookCard 
            :book="book" 
            @download="handleDownload"
          />
        </v-col>
      </v-row>
      
      <!-- 加载更多按钮 -->
      <div v-if="hasMoreResults" class="text-center mt-8">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-dots-horizontal-circle"
          :loading="isLoadingMore"
          @click="handleLoadMore"
          size="x-large"
          elevation="4"
          class="load-more-btn"
        >
          加载更多 ({{ remainingCount }} 条)
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.results-container {
  border-radius: 20px;
  overflow: hidden;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

/* 玻璃态效果 */
.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
}

.animate-fade-in {
  animation: fadeInUp 0.5s ease-out;
  animation-fill-mode: both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 弹入动画 */
.bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.load-more-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.load-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.3) !important;
}
</style>
