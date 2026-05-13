<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" :loading="isLoading">
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon start color="primary">mdi-cog-outline</v-icon>
        Talebook 插件配置
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
          
          <!-- 服务器地址 -->
          <v-text-field
            v-model="config.server_url"
            label="Talebook 服务器地址"
            placeholder="http://192.168.1.100:8080"
            prepend-inner-icon="mdi-server"
            variant="outlined"
            class="mb-4"
            :rules="[rules.required, rules.url]"
          ></v-text-field>
          
          <!-- 用户名和密码 -->
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="config.username"
                label="用户名"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="config.password"
                label="密码"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <!-- SSL 验证选项 -->
          <v-switch
            v-model="config.verify_ssl"
            label="启用 SSL 证书验证"
            hint="如果 Talebook 使用自签名证书,请关闭此选项"
            persistent-hint
            color="primary"
            class="mb-4"
          ></v-switch>
          
          <!-- 扫描路径 -->
          <!-- 本地扫描路径配置已移除, 插件将始终使用远端 Talebook 扫描接口 -->
        </v-form>
        
        <!-- 连接测试 -->
        <v-card v-if="config.server_url" variant="tonal" class="mt-4">
          <v-card-title class="text-subtitle-1">
            <v-icon start color="primary">mdi-connection</v-icon>
            连接测试
          </v-card-title>
          <v-card-text>
            <v-btn
              color="success"
              variant="tonal"
              prepend-icon="mdi-test-tube"
              :loading="testing"
              @click="testConnection"
            >
              测试连接
            </v-btn>
            
            <v-alert
              v-if="testResult"
              :type="testResult.success ? 'success' : 'error'"
              variant="tonal"
              density="compact"
              class="mt-3"
            >
              {{ testResult.message }}
            </v-alert>
          </v-card-text>
        </v-card>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Props - 接收 MoviePilot-Frontend 传递的参数
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

// 插件 ID
const PLUGIN_ID = 'Talebook'

// 配置数据
const config = ref({
  enabled: false,
  server_url: '',
  username: '',
  password: '',
  verify_ssl: true  // 默认启用 SSL 验证
})

// 状态
const isLoading = ref(false)
const isSaving = ref(false)
const saveMessage = ref('')
const saveMessageType = ref<'success' | 'error' | 'info' | 'warning'>('info')
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

// 验证规则
const rules = {
  required: (value: string) => !!value || '此项为必填项',
  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return '请输入有效的 URL 地址'
    }
  }
}

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
        const response = await props.api.get(`plugin/${PLUGIN_ID}/config`)
        if (response.code === 200 && response.data) {
          config.value = {
            enabled: response.data.enabled || false,
            server_url: response.data.server_url || '',
            username: response.data.username || '',
            password: response.data.password || '',
            verify_ssl: response.data.verify_ssl !== undefined ? response.data.verify_ssl : true
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
    // 验证必填字段
    if (!config.value.server_url) {
      showSaveMessage('error', '服务器地址不能为空')
      isSaving.value = false
      return
    }
    
    if (!isValidUrl(config.value.server_url)) {
      showSaveMessage('error', '服务器地址格式不正确')
      isSaving.value = false
      return
    }
    
    if (!config.value.username || !config.value.password) {
      showSaveMessage('error', '用户名和密码不能为空')
      isSaving.value = false
      return
    }
    
    // 通过 API 保存配置
    const response = await props.api.post(`plugin/${PLUGIN_ID}/config`, config.value)
    
    if (response.code === 200) {
      showSaveMessage('success', '配置保存成功')
      // 通知父组件配置已更新
      emit('update:model', config.value)
    } else {
      showSaveMessage('error', response.message || '保存失败')
    }
  } catch (error: any) {
    console.error('[Config] 保存配置失败:', error)
    showSaveMessage('error', error.message || '保存失败')
  } finally {
    isSaving.value = false
  }
}

// 显示保存消息
function showSaveMessage(type: 'success' | 'error', message: string) {
  saveMessageType.value = type
  saveMessage.value = message
  
  // 3秒后自动清除消息
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}

// 验证 URL 格式
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 测试连接
async function testConnection() {
  if (!config.value.server_url) {
    testResult.value = {
      success: false,
      message: '请先填写服务器地址'
    }
    return
  }
  
  if (!config.value.username || !config.value.password) {
    testResult.value = {
      success: false,
      message: '请先填写用户名和密码'
    }
    return
  }
  
  testing.value = true
  testResult.value = null
  
  try {
    // 先保存配置,确保后端有最新的配置
    await saveConfig()
    
    // 调用后端 API 测试连接
    const response = await props.api.get(`plugin/${PLUGIN_ID}/test_connection`)
    
    if (response.code === 200) {
      const resultData = response.data
      
      if (resultData.success) {
        // 连接成功
        const userInfo = resultData.user_info
        let message = '✅ 连接成功!'
        
        if (userInfo && userInfo.name) {
          message += `\n用户: ${userInfo.name}`
        }
        if (userInfo && userInfo.email) {
          message += ` (${userInfo.email})`
        }
        
        testResult.value = {
          success: true,
          message: message
        }
      } else {
        // 连接失败
        testResult.value = {
          success: false,
          message: `❌ ${response.message}`
        }
      }
    } else {
      testResult.value = {
        success: false,
        message: `❌ 请求失败: ${response.message}`
      }
    }
  } catch (error: any) {
    console.error('[Config] 测试连接失败:', error)
    testResult.value = {
      success: false,
      message: `❌ 测试失败: ${error.message || '未知错误'}`
    }
  } finally {
    testing.value = false
  }
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
