<script setup>
const props = defineProps({
  currentTab: {
    type: String,
    required: true
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  historyCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:currentTab'])

// 更新标签页
function updateTab(value) {
  emit('update:currentTab', value)
}
</script>

<template>
  <v-card class="mb-6 tab-navigation-card" elevation="6">
    <v-tabs
      :model-value="currentTab"
      color="primary"
      centered
      bg-color="transparent"
      class="tab-navigation"
      @update:model-value="updateTab"
    >
      <v-tab value="search" prepend-icon="mdi-magnify">
        搜索结果
        <v-badge v-if="resultsCount > 0" :content="resultsCount" inline color="success" size="small"></v-badge>
      </v-tab>
      <v-tab value="history" prepend-icon="mdi-history">
        搜索历史
        <v-badge v-if="historyCount > 0" :content="historyCount" inline color="info" size="small"></v-badge>
      </v-tab>
      <v-tab value="cache" prepend-icon="mdi-database">
        缓存管理
      </v-tab>
    </v-tabs>
  </v-card>
</template>

<style scoped>
.tab-navigation-card {
  border-radius: 16px;
  overflow: hidden;
}

.tab-navigation :deep(.v-tab) {
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.tab-navigation :deep(.v-tab--selected) {
  transform: scale(1.05);
}
</style>
