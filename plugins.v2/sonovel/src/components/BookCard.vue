<script setup>
const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['download'])

// 格式化更新时间
function formatUpdateTime(timeStr) {
  if (!timeStr) return ''
  
  // 如果是时间戳，转换为日期
  if (/^\d+$/.test(timeStr)) {
    const date = new Date(parseInt(timeStr))
    return date.toLocaleDateString('zh-CN')
  }
  
  // 如果已经是日期字符串，直接返回
  return timeStr
}

// 截断简介文本
function truncateDescription(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<template>
  <v-card hover class="result-card h-100" elevation="4">
    <!-- 封面图片 -->
    <div class="cover-wrapper">
      <v-img
        v-if="book.coverUrl"
        :src="book.coverUrl"
        height="240"
        cover
        class="gradient-overlay zoom-on-hover"
        lazy-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect fill='%23f0f0f0' width='100' height='140'/%3E%3Ctext x='50' y='70' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle'%3E加载中...%3C/text%3E%3C/svg%3E"
        transition="fade-transition"
      ></v-img>
      <div v-else class="no-cover-placeholder animated-gradient">
        <v-avatar size="80" color="white" class="elevation-6 bounce-animation">
          <v-icon size="40" color="primary">mdi-book-outline</v-icon>
        </v-avatar>
      </div>
      
      <!-- 书源标签 -->
      <div class="source-badge glass-badge">
        <v-chip 
          v-if="!book.sources || book.sources.length === 0"
          size="small" 
          color="white" 
          variant="flat" 
          prepend-icon="mdi-book-open-page-variant" 
          class="font-weight-medium"
        >
          {{ book.sourceName }}
        </v-chip>
        <v-chip 
          v-else
          size="small" 
          color="amber" 
          variant="flat" 
          prepend-icon="mdi-link-variant"
          class="font-weight-medium"
        >
          {{ book.sources.length + 1 }} 个书源
        </v-chip>
      </div>
    </div>
    
    <!-- 书籍信息 -->
    <v-card-title class="text-subtitle-1 font-weight-bold text-truncate-2 py-3 px-4">
      {{ book.bookName }}
    </v-card-title>
    
    <v-card-subtitle class="pb-2 d-flex align-center px-4">
      <v-avatar size="22" color="primary" variant="tonal" class="mr-2">
        <v-icon size="14" color="primary">mdi-account</v-icon>
      </v-avatar>
      <span class="text-body-2 font-weight-medium">{{ book.author }}</span>
    </v-card-subtitle>
    
    <v-card-text class="pt-0 px-4">
      <!-- 分类和状态 -->
      <div class="mb-3 d-flex align-center justify-space-between">
        <div class="text-caption d-flex align-center category-tag">
          <v-icon size="small" icon="mdi-tag-outline" color="secondary" class="mr-1"></v-icon>
          {{ book.category || '未分类' }}
        </div>
        <v-chip 
          v-if="book.status" 
          size="x-small" 
          :color="book.status === '连载中' ? 'warning' : 'success'"
          variant="tonal"
          class="font-weight-medium"
        >
          {{ book.status }}
        </v-chip>
      </div>
      
      <!-- 最新章节 -->
      <div v-if="book.latestChapter" class="text-caption d-flex align-center pa-2 rounded-lg bg-primary-lighten-5 chapter-info mb-2">
        <v-icon size="small" icon="mdi-newspaper-variant-outline" color="primary" class="mr-2"></v-icon>
        <span class="text-truncate font-weight-medium">{{ book.latestChapter }}</span>
      </div>
      
      <!-- 更新时间 -->
      <div v-if="book.lastUpdateTime" class="text-caption d-flex align-center mb-2 update-time-info">
        <v-icon size="x-small" icon="mdi-clock-outline" color="grey" class="mr-1"></v-icon>
        <span class="text-grey">更新于: {{ formatUpdateTime(book.lastUpdateTime) }}</span>
      </div>
      
      <!-- 简介 -->
      <div v-if="book.description" class="text-caption description-box mb-2">
        <v-icon size="x-small" icon="mdi-text-short" color="info" class="mr-1"></v-icon>
        <span class="description-text">{{ truncateDescription(book.description, 60) }}</span>
      </div>
      
      <!-- 多源提示 -->
      <div v-if="book.sources && book.sources.length > 0" class="mt-2 text-caption d-flex align-center multi-source-hint">
        <v-icon size="x-small" icon="mdi-information-outline" color="info" class="mr-1"></v-icon>
        <span class="text-info">来自 {{ book.sources.length + 1 }} 个不同书源</span>
      </div>
    </v-card-text>
    
    <v-divider class="mx-4"></v-divider>
    
    <!-- 下载按钮 -->
    <v-card-actions class="px-4 py-3">
      <v-spacer></v-spacer>
      <v-btn
        size="default"
        color="primary"
        variant="flat"
        prepend-icon="mdi-download-circle"
        @click="$emit('download', book)"
        block
        elevation="3"
        class="download-action-btn font-weight-bold"
      >
        下载电子书
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.result-card {
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: white;
}

.result-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3) !important;
}

.cover-wrapper {
  position: relative;
  overflow: hidden;
}

.gradient-overlay::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  pointer-events: none;
}

/* 悬停缩放效果 */
.zoom-on-hover {
  transition: transform 0.4s ease;
}

.result-card:hover .zoom-on-hover {
  transform: scale(1.05);
}

/* 动画渐变背景 */
.animated-gradient {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 弹跳动画 */
.bounce-animation {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.source-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

/* 玻璃态标签 */
.glass-badge {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px;
  transition: all 0.3s ease;
}

.result-card:hover .glass-badge {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.download-action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.download-action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.5) !important;
}

/* 分类标签 */
.category-tag {
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 6px;
  display: inline-flex;
}

/* 章节信息 */
.chapter-info {
  border-left: 3px solid #667eea;
  transition: all 0.3s ease;
}

.chapter-info:hover {
  background: rgba(102, 126, 234, 0.12) !important;
  border-left-width: 4px;
}

/* 多源提示 */
.multi-source-hint {
  padding: 4px 8px;
  background: rgba(33, 150, 243, 0.08);
  border-radius: 6px;
  border-left: 3px solid #2196f3;
}

/* 更新时间信息 */
.update-time-info {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
}

/* 简介框 */
.description-box {
  padding: 8px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 3px solid #667eea;
  line-height: 1.5;
}

.description-text {
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
