<script setup>
import { ref, onMounted } from 'vue'
import { CONFIG_DEFAULTS } from '../constants'

const props = defineProps({
  model: {
    type: Object,
    default: () => ({})
  },
  api: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:model'])

// 配置项
const config = ref({
  enabled: false,
  api_url: CONFIG_DEFAULTS.API_URL,
  default_format: CONFIG_DEFAULTS.DEFAULT_FORMAT
})

// 加载状态
const isLoading = ref(false)
const isSaving = ref(false)
const saveMessage = ref('')
const saveMessageType = ref('') // 'success' or 'error'

// 加载配置
async function loadConfig() {
  isLoading.value = true
  try {
    // 优先从 props.model 加载
    if (props.model && Object.keys(props.model).length > 0) {
      config.value = { ...config.value, ...props.model }
      console.log('[Config] 从 props 加载配置:', config.value)
    } else {
      // 尝试从 API 获取最新配置
      try {
        const response = await props.api.get('plugin/Sonovel/config')
        if (response.code === 200 && response.data) {
          config.value = {
            enabled: response.data.enabled || false,
            api_url: response.data.api_url || CONFIG_DEFAULTS.API_URL,
            default_format: response.data.default_format || CONFIG_DEFAULTS.DEFAULT_FORMAT
          }
          console.log('[Config] 从 API 加载配置:', config.value)
        }
      } catch (apiError) {
        console.warn('[Config] API 获取配置失败，使用默认值:', apiError)
      }
    }
  } catch (err) {
    console.error('[Config] 加载配置失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 保存配置
async function saveConfig() {
  isSaving.value = true
  saveMessage.value = ''
  
  try {
    // 验证 API URL 格式
    if (!config.value.api_url) {
      showSaveMessage('error', 'API 地址不能为空')
      isSaving.value = false
      return
    }
    
    if (!isValidUrl(config.value.api_url)) {
      showSaveMessage('error', 'API 地址格式不正确')
      isSaving.value = false
      return
    }
    
    // 通过 API 保存配置
    const response = await props.api.post('plugin/Sonovel/config', config.value)
    
    if (response.code === 200) {
      showSaveMessage('success', '配置保存成功')
      // 通知父组件配置已更新
      emit('update:model', config.value)
    } else {
      showSaveMessage('error', response.message || '保存失败')
    }
  } catch (error) {
    console.error('[Config] 保存配置失败:', error)
    showSaveMessage('error', error.message || '保存失败')
  } finally {
    isSaving.value = false
  }
}

// 显示保存消息
function showSaveMessage(type, message) {
  saveMessageType.value = type
  saveMessage.value = message
  
  // 3秒后自动清除消息
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}

// 验证 URL 格式
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" :loading="isLoading">
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon start color="primary">mdi-cog-outline</v-icon>
        SoNovel 插件配置
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text>
        <!-- 保存消息提示 -->
        <v-alert
          v-if="saveMessage"
          :type="saveMessageType"
          variant="tonal"
          density="compact"
          closable
          class="mb-4"
          @click:close="saveMessage = ''"
        >
          {{ saveMessage }}
        </v-alert>
        
        <v-form @submit.prevent="saveConfig">
          <!-- 启用开关 -->
          <v-switch
            v-model="config.enabled"
            label="启用插件"
            color="primary"
            inset
            class="mb-4"
          ></v-switch>
          
          <!-- API 地址 -->
          <v-text-field
            v-model="config.api_url"
            label="API 地址"
            placeholder="SoNovel API 服务器地址"
            prepend-inner-icon="mdi-server"
            variant="outlined"
            class="mb-4"
            :rules="[v => !!v || 'API 地址不能为空', v => isValidUrl(v) || 'URL 格式不正确']"
          ></v-text-field>
          
          <!-- 默认格式 -->
          <v-select
            v-model="config.default_format"
            :items="[
              { title: 'EPUB', value: 'epub' },
              { title: 'PDF', value: 'pdf' },
              { title: 'MOBI', value: 'mobi' },
              { title: 'TXT', value: 'txt' }
            ]"
            label="默认格式"
            prepend-inner-icon="mdi-file-document"
            variant="outlined"
            class="mb-4"
          ></v-select>
        </v-form>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save"
          :loading="isSaving"
          :disabled="isSaving"
          @click="saveConfig"
        >
          {{ isSaving ? '保存中...' : '保存配置' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
