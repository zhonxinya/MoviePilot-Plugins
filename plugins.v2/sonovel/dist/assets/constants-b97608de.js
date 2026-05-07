const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

// Sonovel 插件常量定义


// 配置默认值
const CONFIG_DEFAULTS = {
  API_URL: 'https://your-api-server.com',
  DEFAULT_FORMAT: 'epub',
  CACHE_TTL: 3600
};

// UI 常量
const UI_CONSTANTS = {
  PAGE_SIZE: 20,
  MAX_HISTORY_ITEMS: 20,
  ANIMATION_DELAY_BASE: 0.05,
  NOTIFICATION_DURATION: 5000,
  LOAD_MORE_DELAY: 300
};

// 通知图标映射
const NOTIFICATION_ICONS = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information'
};

// 通知颜色映射
const NOTIFICATION_COLORS = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info'
};

export { CONFIG_DEFAULTS as C, NOTIFICATION_ICONS as N, UI_CONSTANTS as U, _export_sfc as _, NOTIFICATION_COLORS as a };
