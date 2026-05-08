<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" :loading="isLoading">
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon start color="primary">mdi-cog-outline</v-icon>
        起点图书插件配置
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
          
          <!-- 搜索超时时间 -->
          <v-text-field
            v-model.number="config.search_timeout"
            label="搜索超时时间（秒）"
            type="number"
            :min="5"
            :max="60"
            prepend-inner-icon="mdi-clock-outline"
            variant="outlined"
            hint="设置HTTP请求的超时时间"
            persistent-hint
            class="mb-4"
          ></v-text-field>
          
          <!-- 最大结果数 -->
          <v-text-field
            v-model.number="config.max_results"
            label="最大返回结果数"
            type="number"
            :min="1"
            :max="100"
            prepend-inner-icon="mdi-format-list-numbered"
            variant="outlined"
            hint="每次搜索最多返回的图书数量"
            persistent-hint
            class="mb-4"
          ></v-text-field>
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
  search_timeout: CONFIG_DEFAULTS.search_timeout,
  max_results: CONFIG_DEFAULTS.max_results
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
        const response = await props.api.get('plugin/QidianBook/config')
        if (response.code === 200 && response.data) {
          config.value = {
            enabled: response.data.enabled ?? false,
            search_timeout: response.data.search_timeout ?? CONFIG_DEFAULTS.search_timeout,
            max_results: response.data.max_results ?? CONFIG_DEFAULTS.max_results
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
    // 验证配置
    if (config.value.search_timeout < 5 || config.value.search_timeout > 60) {
      showSaveMessage('error', '搜索超时时间必须在 5-60 秒之间')
      isSaving.value = false
      return
    }
    
    if (config.value.max_results < 1 || config.value.max_results > 100) {
      showSaveMessage('error', '最大结果数必须在 1-100 之间')
      isSaving.value = false
      return
    }
    
    // 通过 API 保存配置
    const response = await props.api.post('plugin/QidianBook/config', config.value)
    
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

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
