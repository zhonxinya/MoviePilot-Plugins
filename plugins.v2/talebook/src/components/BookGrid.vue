<template>
  <v-card class="elevation-4">
    <v-card-title class="d-flex align-center py-3">
      <v-icon start color="primary">{{ icon }}</v-icon>
      {{ title }}
      <v-spacer></v-spacer>
      <v-chip color="primary" size="small">{{ books.length }} 本</v-chip>
      <v-btn
        v-if="showRefresh"
        size="small"
        variant="text"
        icon="mdi-refresh"
        @click="$emit('refresh')"
        :loading="loading"
        class="ml-2"
      />
    </v-card-title>
    <v-card-text class="pa-3">
      <v-row dense>
        <v-col
          v-for="book in books"
          :key="book.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
          xl="2"
        >
          <BookCard
            :book="book"
            :cover-url="getCoverUrl(book)"
            :api="api"
            :is-favorited="favoriteBookIds.has(book.id)"
            :is-downloading="downloadingBookId === book.id"
            :show-favorite="showFavorite"
            @detail="$emit('detail', $event)"
            @toggle-favorite="$emit('toggle-favorite', $event)"
            @download="$emit('download', $event)"
          >
            <!-- 允许父组件插入自定义内容(如收藏/在读标记) -->
            <template #badge="{ book }">
              <slot name="badge" :book="book"></slot>
            </template>
            <template #actions="{ book }">
              <slot name="actions" :book="book"></slot>
            </template>
          </BookCard>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import BookCard from './BookCard.vue'

interface Props {
  books: any[]
  title: string
  icon: string
  api: any
  favoriteBookIds: Set<number>
  downloadingBookId?: number | null
  loading?: boolean
  showRefresh?: boolean
  showFavorite?: boolean
  getCoverUrl: (book: any) => string
}

withDefaults(defineProps<Props>(), {
  downloadingBookId: null,
  loading: false,
  showRefresh: false,
  showFavorite: true
})

defineEmits<{
  detail: [bookId: number]
  'toggle-favorite': [bookId: number]
  download: [bookId: number]
  refresh: []
}>()
</script>
