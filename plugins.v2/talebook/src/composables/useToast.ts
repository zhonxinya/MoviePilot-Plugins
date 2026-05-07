import { ref } from 'vue'

interface SnackbarState {
  show: boolean
  message: string
  color: string
  icon: string
  timeout: number
}

const snackbar = ref<SnackbarState>({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
  timeout: 3000
})

/**
 * 显示 Toast 通知
 * @param message - 通知消息
 * @param type - 通知类型: success | error | warning | info
 * @param timeout - 显示时长(毫秒),默认3000
 */
export function useToast() {
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    timeout: number = 3000
  ) => {
    const configMap = {
      success: {
        color: 'success',
        icon: 'mdi-check-circle'
      },
      error: {
        color: 'error',
        icon: 'mdi-alert-circle'
      },
      warning: {
        color: 'warning',
        icon: 'mdi-alert'
      },
      info: {
        color: 'info',
        icon: 'mdi-information'
      }
    }

    const config = configMap[type]
    
    snackbar.value = {
      show: true,
      message,
      color: config.color,
      icon: config.icon,
      timeout
    }
  }

  const hideToast = () => {
    snackbar.value.show = false
  }

  return {
    snackbar,
    showToast,
    hideToast
  }
}
