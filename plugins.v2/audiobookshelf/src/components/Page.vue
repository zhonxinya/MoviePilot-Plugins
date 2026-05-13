<template>
  <v-container fluid class="pa-4">
    <!-- 标题卡片 -->
    <v-card class="mb-6 elevation-4">
      <v-card-title class="text-h5 bg-primary text-white d-flex align-center justify-space-between py-4 px-6">
        <div class="d-flex align-center">
          <v-icon start color="white" class="mr-3">mdi-bookshelf</v-icon>
          Audiobookshelf 有声书和播客管理
        </div>
        <v-btn
          icon
          variant="text"
          color="white"
          size="small"
          @click="handleClose"
          title="关闭页面"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle class="text-grey-darken-1 pa-3">
        管理 Audiobookshelf 库、作者、系列和播客
      </v-card-subtitle>
    </v-card>

    <!-- 标签页导航 -->
    <v-card class="mb-6 elevation-4">
      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab value="libraries">
          <v-icon start>mdi-library</v-icon>
          库管理
        </v-tab>
        <v-tab value="authors">
          <v-icon start>mdi-account-multiple</v-icon>
          作者管理
        </v-tab>
        <v-tab value="podcasts">
          <v-icon start>mdi-podcast</v-icon>
          播客管理
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- 标签页内容 -->
    <v-window v-model="activeTab">
      <!-- 库管理标签页 -->
      <v-window-item value="libraries">
        <LibrariesPanel :api="api" />
      </v-window-item>

      <!-- 作者管理标签页 -->
      <v-window-item value="authors">
        <AuthorsPanel :api="api" />
      </v-window-item>

      <!-- 播客管理标签页 -->
      <v-window-item value="podcasts">
        <PodcastsPanel :api="api" />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LibrariesPanel from './LibrariesPanel.vue'
import AuthorsPanel from './AuthorsPanel.vue'
import PodcastsPanel from './PodcastsPanel.vue'

// Props
const props = defineProps({
  api: {
    type: Object,
    default: () => ({})
  }
})

// 激活的标签页
const activeTab = ref('libraries')

// 关闭页面
function handleClose() {
  // 通知父组件关闭
  window.dispatchEvent(new CustomEvent('plugin-close'))
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
