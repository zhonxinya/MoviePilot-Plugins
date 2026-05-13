<template>
  <v-card hover elevation="3" class="h-100 rounded-lg overflow-hidden" style="max-width: 280px;">
    <!-- 封面图片 -->
    <v-img
      :src="loadedImageUrl"
      height="280"
      cover
      class="bg-grey-lighten-3"
      gradient="to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2)"
    >
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0 pa-4 text-center" align="center" justify="center">
          <div v-if="loading" class="d-flex flex-column align-center justify-center">
            <v-progress-circular indeterminate color="grey-lighten-5" />
            <div class="text-caption text-grey-lighten-4 mt-2">加载封面中</div>
          </div>
          <div v-else class="d-flex flex-column align-center justify-center">
            <v-icon color="grey-lighten-4" size="large">mdi-image-off-outline</v-icon>
            <div class="text-caption text-grey-lighten-4 mt-2">{{ imageError || '暂无封面' }}</div>
          </div>
        </v-row>
      </template>
      
      <!-- 自定义徽章(如收藏/在读标记) -->
      <slot name="badge" :book="book"></slot>
    </v-img>
    
    <!-- 书籍信息 -->
    <v-card-item class="py-2 px-2">
      <v-card-title class="text-body-2 font-weight-bold line-clamp-2" style="min-height: 40px;">
        {{ book.title }}
      </v-card-title>
      <v-card-subtitle class="text-caption text-blue-accent-4 line-clamp-1 mt-1">
        {{ book.author }}
      </v-card-subtitle>
    </v-card-item>
    
    <!-- 标签 -->
    <v-card-text class="pb-2 px-2">
      <div v-if="book.tags || book.tag" class="tags-container">
        <v-chip-group column density="compact" class="ma-0 tag-group">
          <!-- 出版社标签 -->
          <v-chip 
            v-if="book.publisher" 
            size="x-small" 
            variant="flat"
            color="info"
            prepend-icon="mdi-domain"
            class="tag-chip publisher-tag mb-1"
          >
            {{ book.publisher }}
          </v-chip>
          
          <!-- 单标签兼容 -->
          <v-chip 
            v-if="!book.tags && book.tag" 
            size="x-small" 
            variant="tonal"
            color="primary"
            prepend-icon="mdi-tag-outline"
            class="tag-chip single-tag"
          >
            {{ book.tag }}
          </v-chip>
          
          <!-- 多标签显示(最多显示3个) -->
          <template v-if="book.tags && Array.isArray(book.tags)">
            <v-chip 
              v-for="(tag, idx) in book.tags.slice(0, 3)" 
              :key="idx"
              size="x-small" 
              variant="tonal"
              :color="getTagColor(Number(idx))"
              prepend-icon="mdi-tag-outline"
              class="tag-chip multi-tag"
            >
              {{ tag }}
            </v-chip>
            <!-- 更多标签提示 -->
            <v-chip 
              v-if="book.tags.length > 3"
              size="x-small"
              variant="outlined"
              color="grey"
              class="tag-chip more-tags"
            >
              +{{ book.tags.length - 3 }}
            </v-chip>
          </template>
        </v-chip-group>
      </div>
    </v-card-text>
    
    <!-- 操作按钮 -->
    <v-card-actions class="pb-2 px-2">
      <!-- 自定义操作按钮 -->
      <slot name="actions" :book="book">
        <!-- 默认按钮 -->
        <v-btn
          size="x-small"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-information-outline"
          @click="$emit('detail', book.id)"
        >
          详情
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="showFavorite"
          size="x-small"
          :color="isFavorited ? 'red' : 'grey'"
          :variant="isFavorited ? 'flat' : 'tonal'"
          :icon="isFavorited ? 'mdi-heart' : 'mdi-heart-outline'"
          @click="$emit('toggle-favorite', book.id)"
        />
      </slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useImageLoader } from '../utils/imageLoader'

interface Props {
  book: any
  coverUrl: string
  api: any
  isFavorited?: boolean
  showFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorited: false,
  showFavorite: true
})

// 使用图片加载器异步加载图片
const { imageUrl: loadedImageUrl, loading, error: imageError } = useImageLoader(props.coverUrl, props.api)

// 获取标签颜色(循环使用不同颜色)
const getTagColor = (index: number): string => {
  const colors = ['primary', 'success', 'warning', 'deep-purple', 'teal', 'pink', 'indigo']
  return colors[index % colors.length]
}

defineEmits<{
  detail: [bookId: number]
  'toggle-favorite': [bookId: number]
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签容器 */
.tags-container {
  min-height: 28px;
}

/* 标签组样式 */
.tag-group {
  gap: 4px;
}

/* 标签样式美化 */
.tag-chip {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  letter-spacing: 0.4px;
  font-size: 11px;
  border-radius: 12px !important;
  padding: 0 8px !important;
  height: 20px !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.tag-chip:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.tag-chip:active {
  transform: translateY(-1px) scale(1.02);
}

/* 标签图标样式 */
.tag-chip .v-icon {
  margin-right: 4px !important;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.tag-chip:hover .v-icon {
  transform: rotate(15deg) scale(1.1);
  opacity: 1;
}

/* 出版社标签特殊样式 */
.publisher-tag {
  background: linear-gradient(135deg, rgba(var(--v-theme-info), 0.2), rgba(var(--v-theme-info), 0.08));
  border: 1px solid rgba(var(--v-theme-info), 0.4);
  box-shadow: 0 2px 6px rgba(var(--v-theme-info), 0.15);
}

.publisher-tag:hover {
  box-shadow: 0 6px 12px rgba(var(--v-theme-info), 0.3);
}

/* 单标签样式 */
.single-tag {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.2), rgba(var(--v-theme-primary), 0.08));
  border: 1px solid rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 2px 6px rgba(var(--v-theme-primary), 0.15);
}

.single-tag:hover {
  box-shadow: 0 6px 12px rgba(var(--v-theme-primary), 0.3);
}

/* 多标签样式 */
.multi-tag {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 更多标签提示 */
.more-tags {
  font-style: italic;
  font-weight: 700;
  opacity: 0.75;
  border-width: 1.5px;
}

.more-tags:hover {
  opacity: 1;
  background: rgba(var(--v-theme-grey), 0.1);
}

/* 标签文本溢出处理 */
.tag-chip .v-chip__content {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
