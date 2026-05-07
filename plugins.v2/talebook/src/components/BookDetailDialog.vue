<template>
  <v-dialog v-model="dialogVisible" max-width="900" transition="dialog-bottom-transition">
    <v-card v-if="book" class="rounded-xl overflow-hidden">
      <!-- 顶部工具栏 -->
      <v-toolbar density="compact" color="primary" dark>
        <v-toolbar-title class="text-h6 font-weight-bold">{{ book.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" @click="dialogVisible = false" variant="text"></v-btn>
      </v-toolbar>
      
      <v-card-text class="pa-6">
        <v-row>
          <!-- 左侧：封面图片 -->
          <v-col cols="12" md="4">
            <v-card flat class="elevation-3 rounded-xl overflow-hidden">
              <v-img
                :src="coverUrl"
                height="400"
                cover
                class="bg-grey-lighten-3"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary" />
                  </v-row>
                </template>
              </v-img>
              
              <!-- 收藏按钮覆盖层 -->
              <v-card-actions class="position-absolute bottom-0 w-100" style="background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);">
                <v-spacer />
                <v-btn
                  size="large"
                  :color="isFavorited ? 'red' : 'white'"
                  :variant="isFavorited ? 'flat' : 'outlined'"
                  :icon="isFavorited ? 'mdi-heart' : 'mdi-heart-outline'"
                  @click="$emit('toggle-favorite', book.id)"
                  class="mb-2 mr-2"
                />
              </v-card-actions>
            </v-card>
          </v-col>
          
          <!-- 右侧：详细信息 -->
          <v-col cols="12" md="8">
            <!-- 基本信息卡片 -->
            <v-card flat class="mb-4">
              <v-card-title class="text-h5 font-weight-bold mb-2">{{ book.title }}</v-card-title>
              <v-card-subtitle class="text-body-1 text-blue-accent-4 mb-3">
                <v-icon start size="small">mdi-account</v-icon>
                {{ book.author || '未知作者' }}
              </v-card-subtitle>
              
              <v-divider class="mb-3"></v-divider>
              
              <!-- 元数据网格 -->
              <v-row dense>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-medium-emphasis mb-1">出版社</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon start size="x-small" color="info">mdi-bookshelf</v-icon>
                    {{ book.publisher || '未知' }}
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-medium-emphasis mb-1">出版日期</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon start size="x-small" color="success">mdi-calendar</v-icon>
                    {{ book.pubdate || '未知' }}
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-medium-emphasis mb-1">语言</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon start size="x-small" color="warning">mdi-translate</v-icon>
                    {{ book.language || '中文' }}
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-medium-emphasis mb-1">文件格式</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon start size="x-small" color="purple">mdi-file-document</v-icon>
                    {{ book.format || 'EPUB' }}
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-medium-emphasis mb-1">文件大小</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon start size="x-small" color="teal">mdi-database</v-icon>
                    {{ book.size ? formatFileSize(book.size) : '未知' }}
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-medium-emphasis mb-1">ISBN</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon start size="x-small" color="deep-purple">mdi-barcode</v-icon>
                    {{ book.isbn || '无' }}
                  </div>
                </v-col>
              </v-row>
              
              <!-- 标签 -->
              <div class="mt-4" v-if="book.tags || book.tag">
                <div class="text-caption text-medium-emphasis mb-2">标签</div>
                <v-chip-group column>
                  <v-chip
                    v-for="tag in (book.tags || [book.tag])"
                    :key="tag"
                    size="small"
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-tag"
                  >
                    {{ tag }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-card>
            
            <!-- 简介卡片 -->
            <v-card flat v-if="book.comments" class="mb-4">
              <v-card-title class="text-h6 font-weight-bold d-flex align-center py-2">
                <v-icon start color="primary">mdi-text-box-outline</v-icon>
                内容简介
              </v-card-title>
              <v-card-text class="text-body-2 text-medium-emphasis pt-0">
                <div class="line-clamp-8" style="line-height: 1.8;">
                  {{ book.comments }}
                </div>
              </v-card-text>
            </v-card>
            
            <!-- 操作按钮 -->
            <v-card flat>
              <v-card-actions class="px-0">
                <v-spacer />
                <v-btn
                  color="success"
                  size="large"
                  variant="elevated"
                  prepend-icon="mdi-download-box"
                  :loading="isDownloading"
                  @click="$emit('download', book.id)"
                  class="elevation-2"
                >
                  下载图书
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  book: any | null
  coverUrl: string
  isFavorited?: boolean
  isDownloading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorited: false,
  isDownloading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'toggle-favorite': [bookId: number]
  download: [bookId: number]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '未知'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}
</script>

<style scoped>
.line-clamp-8 {
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
