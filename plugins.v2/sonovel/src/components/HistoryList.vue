<script setup>
const props = defineProps({
  history: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['search', 'delete', 'clearAll'])

// 点击历史记录进行搜索
function handleSearch(keyword) {
  emit('search', keyword)
}

// 删除单条记录
function handleDelete(index) {
  emit('delete', index)
}

// 清空所有历史
function handleClearAll() {
  emit('clearAll')
}
</script>

<template>
  <div>
    <v-card v-if="history.length > 0" class="history-card" elevation="6">
      <v-card-title class="d-flex align-center py-4 bg-gradient-secondary">
        <v-avatar size="44" color="white" class="mr-3 elevation-3">
          <v-icon icon="mdi-history" size="24" color="success"></v-icon>
        </v-avatar>
        <div>
          <span class="text-h6 font-weight-bold text-white d-block">搜索历史记录</span>
          <span class="text-caption text-white-opacity">查看和管理您的搜索历史</span>
        </div>
      </v-card-title>
      <v-card-text class="pa-5">
        <v-table hover class="history-table">
          <thead>
            <tr>
              <th class="text-left">
                <v-icon size="small" class="mr-1">mdi-magnify</v-icon>
                关键词
              </th>
              <th class="text-center">
                <v-icon size="small" class="mr-1">mdi-format-list-numbered</v-icon>
                结果数
              </th>
              <th class="text-right">
                <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                时间
              </th>
              <th class="text-center" style="width: 120px;">
                <v-icon size="small" class="mr-1">mdi-cog</v-icon>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in history" :key="index" class="history-row">
              <td class="font-weight-medium">
                <v-chip 
                  size="small" 
                  color="primary" 
                  variant="tonal"
                  @click="handleSearch(record.keyword)"
                  class="cursor-pointer"
                >
                  {{ record.keyword }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ record.count }}
                </v-chip>
              </td>
              <td class="text-right text-grey">{{ record.timestamp }}</td>
              <td class="text-center">
                <v-btn 
                  size="x-small" 
                  variant="text" 
                  color="error"
                  icon="mdi-delete"
                  @click="handleDelete(index)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="error" 
          variant="outlined"
          prepend-icon="mdi-delete-sweep"
          @click="handleClearAll"
          elevation="2"
        >
          清空全部历史
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <v-card v-else class="empty-state-card" elevation="4">
      <v-card-text class="text-center py-16">
        <div class="empty-icon-wrapper mb-6">
          <v-icon size="80" color="grey-lighten-2" class="floating-animation">mdi-history-remove</v-icon>
        </div>
        <h3 class="text-h4 mb-4 font-weight-bold text-grey-darken-2">暂无搜索历史</h3>
        <p class="text-body-1 text-grey-darken-1 mb-6">开始搜索后，历史记录将显示在这里</p>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-arrow-up-bold"
          size="large"
          elevation="4"
          @click="$emit('goToSearch')"
          class="cta-button"
        >
          去搜索
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.bg-gradient-secondary {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.text-white-opacity {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 浮动动画 */
.floating-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.empty-state-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  animation: fadeIn 0.5s ease-in;
}

.empty-icon-wrapper {
  display: inline-block;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.cta-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4) !important;
}

.history-card {
  border-radius: 20px;
  overflow: hidden;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.history-table {
  border-radius: 8px;
  overflow: hidden;
}

.history-table thead tr {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.history-table th {
  font-weight: 600;
  color: #667eea;
  font-size: 0.875rem;
}

.history-row:hover {
  background: rgba(102, 126, 234, 0.05);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
