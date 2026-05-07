<script setup>
import { ref } from 'vue'

const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['search', 'update:searchKeyword'])

// 本地搜索关键词
const localKeyword = ref(props.searchKeyword)

// 执行搜索
function handleSearch() {
  emit('search', localKeyword.value)
}

// 同步父组件的 keyword 变化
function syncKeyword(value) {
  localKeyword.value = value
  emit('update:searchKeyword', value)
}

// 关闭按钮
function handleClose() {
  emit('close')
}
</script>

<template>
  <v-card class="mb-6 search-header-card" elevation="8">
    <div class="header-gradient-bg"></div>
    <div class="header-particles"></div>
    <v-card-item class="position-relative" style="z-index: 1;">
      <v-card-title class="d-flex align-center py-4">
        <v-avatar size="56" color="white" class="mr-3 elevation-6 pulse-animation">
          <v-icon icon="mdi-book-search" size="30" color="primary"></v-icon>
        </v-avatar>
        <div>
          <span class="text-h4 font-weight-black text-white d-block letter-spacing-tight">SoNovel 图书搜索</span>
          <span class="text-subtitle-2 text-white-opacity mt-1 d-block">聚合多书源 · 一键搜索海量电子书</span>
        </div>
      </v-card-title>
      <template #append>
        <v-btn icon color="white" variant="text" @click="handleClose" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-card-item>
    <v-card-text class="position-relative pt-2 pb-4">
      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" border="start">
        <v-icon start>mdi-alert-circle-outline</v-icon>
        {{ error }}
      </v-alert>
      
      <v-row>
        <v-col cols="12" md="9">
          <v-text-field
            :model-value="localKeyword"
            label="搜索关键词"
            placeholder="请输入书名、作者或关键词..."
            prepend-inner-icon="mdi-magnify"
            clearable
            variant="solo-filled"
            density="comfortable"
            bg-color="rgba(255, 255, 255, 0.95)"
            @update:model-value="syncKeyword"
            @keyup.enter="handleSearch"
            hide-details
            class="search-field glow-effect"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-btn
            color="white"
            size="x-large"
            block
            prepend-icon="mdi-search-web"
            :loading="isLoading"
            @click="handleSearch"
            elevation="6"
            class="search-action-btn text-primary font-weight-bold shimmer-effect"
          >
            开始搜索
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.search-header-card {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-header-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3) !important;
}

.header-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0.95;
  z-index: 0;
}

.header-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}

.text-white-opacity {
  color: rgba(255, 255, 255, 0.9) !important;
}

.letter-spacing-tight {
  letter-spacing: -0.5px;
}

/* 脉冲动画 */
.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.search-field :deep(.v-field) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.search-field :deep(.v-field--focused) {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

/* 发光效果 */
.glow-effect :deep(.v-field) {
  transition: all 0.3s ease;
}

.glow-effect :deep(.v-field--focused) {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4), 0 8px 24px rgba(102, 126, 234, 0.3);
}

/* 闪烁效果 */
.shimmer-effect {
  position: relative;
  overflow: hidden;
}

.shimmer-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.shimmer-effect:hover::before {
  left: 100%;
}

.search-action-btn {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}

.search-action-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 28px rgba(255, 255, 255, 0.4) !important;
}

@media (max-width: 600px) {
  .search-header-card :deep(.v-card-title) {
    padding: 16px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
