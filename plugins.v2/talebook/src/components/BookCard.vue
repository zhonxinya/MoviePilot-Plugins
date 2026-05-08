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
    <v-card-text class="pb-1 px-2">
      <v-chip-group column density="compact">
        <v-chip v-if="book.publisher" size="x-small" variant="tonal" color="info" class="mb-1">
          {{ book.publisher }}
        </v-chip>
        <v-chip v-if="book.tag" size="x-small" variant="tonal" color="success">
          {{ book.tag }}
        </v-chip>
      </v-chip-group>
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
        <v-btn
          size="x-small"
          color="success"
          variant="flat"
          prepend-icon="mdi-download-box"
          :loading="isDownloading"
          @click="$emit('download', book.id)"
        >
          下载
        </v-btn>
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
  isDownloading?: boolean
  showFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorited: false,
  isDownloading: false,
  showFavorite: true
})

// 使用图片加载器异步加载图片
const { imageUrl: loadedImageUrl, loading, error: imageError } = useImageLoader(props.coverUrl, props.api)

defineEmits<{
  detail: [bookId: number]
  'toggle-favorite': [bookId: number]
  download: [bookId: number]
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
</style>
