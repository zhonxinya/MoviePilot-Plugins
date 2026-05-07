<script setup>
import { NOTIFICATION_TYPES, NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '../constants'

const props = defineProps({
  notifications: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['remove'])

// 获取通知图标
function getNotificationIcon(type) {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.info
}

// 获取通知颜色
function getNotificationColor(type) {
  return NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.info
}

// 移除通知
function handleRemove(id) {
  emit('remove', id)
}
</script>

<template>
  <div class="notification-container">
    <transition-group name="notification-slide">
      <v-alert
        v-for="notification in notifications"
        :key="notification.id"
        :type="getNotificationColor(notification.type)"
        :title="notification.title"
        :text="notification.message"
        closable
        density="comfortable"
        variant="tonal"
        border="start"
        class="mb-2 notification-alert"
        @click:close="handleRemove(notification.id)"
      >
        <template #prepend>
          <v-icon :icon="getNotificationIcon(notification.type)"></v-icon>
        </template>
      </v-alert>
    </transition-group>
  </div>
</template>

<style scoped>
/* 通知容器 */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
}

.notification-alert {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
}

/* 通知动画 */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s ease;
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
