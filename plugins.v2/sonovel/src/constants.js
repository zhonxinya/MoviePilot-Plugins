// Sonovel 插件常量定义

// API 端点
export const API_ENDPOINTS = {
  SEARCH: 'plugin/Sonovel/search',
  DOWNLOAD: 'plugin/Sonovel/download',
  HISTORY: 'plugin/Sonovel/history'
}

// 配置默认值
export const CONFIG_DEFAULTS = {
  API_URL: 'https://your-api-server.com',
  DEFAULT_FORMAT: 'epub',
  CACHE_TTL: 3600
}

// UI 常量
export const UI_CONSTANTS = {
  PAGE_SIZE: 20,
  MAX_HISTORY_ITEMS: 20,
  ANIMATION_DELAY_BASE: 0.05,
  NOTIFICATION_DURATION: 5000,
  LOAD_MORE_DELAY: 300
}

// 下载相关常量
export const DOWNLOAD_CONSTANTS = {
  DEFAULT_FORMAT: 'epub',
  DEFAULT_LANGUAGE: 'zh_CN'
}

// 通知类型
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// 通知图标映射
export const NOTIFICATION_ICONS = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information'
}

// 通知颜色映射
export const NOTIFICATION_COLORS = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info'
}
