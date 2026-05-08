<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  api: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['action', 'switch', 'close'])

// 调试信息
console.log('[XunleiPan Config] ========== 组件加载 ==========')
console.log('[XunleiPan Config] Props:', props)

const toast = useToast()

// 插件 ID
const pluginId = 'XunleiPan'

// ===== 配置数据 =====
const config = ref({
  username: '',
  password: '',
  timeout: 10,
  max_retries: 3,
  auto_refresh: false
})

const saving = ref(false)
const testing = ref(false)

// ===== API 调用 =====
const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    const response = await fetch(`/api/v1/plugin/XunleiPan${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error: any) {
    toast.error(`API 调用失败: ${error.message}`)
    throw error
  }
}

// ===== 配置操作 =====
const loadConfig = async () => {
  try {
    const result = await apiCall('/config')
    if (result.code === 200 && result.data) {
      config.value = {
        ...config.value,
        ...result.data
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const saveConfig = async () => {
  // 验证必填字段
  if (!config.value.username || !config.value.password) {
    toast.error('请填写完整的账号信息')
    return
  }
  
  saving.value = true
  try {
    const result = await apiCall('/config', 'POST', config.value)
    if (result.code === 200) {
      toast.success('配置保存成功')
    } else {
      toast.error(result.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  if (!config.value.username || !config.value.password) {
    toast.error('请先填写账号信息')
    return
  }
  
  testing.value = true
  try {
    const result = await apiCall('/test_connection', 'POST', {
      username: config.value.username,
      password: config.value.password
    })
    
    if (result.code === 200) {
      toast.success('连接测试成功!')
    } else {
      toast.error(`连接失败: ${result.message}`)
    }
  } catch (error) {
    console.error('连接测试失败:', error)
  } finally {
    testing.value = false
  }
}

// ===== 生命周期 =====
onMounted(() => {
  loadConfig()
})
</script>

<template>
  <v-container fluid>
    <v-form ref="configForm">
      <!-- 账号配置 -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-account-key</v-icon>
          迅雷账号配置
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="config.username"
                label="用户名/手机号"
                placeholder="请输入迅雷账号"
                prepend-icon="mdi-account"
                :rules="[v => !!v || '请输入用户名']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="config.password"
                label="密码"
                type="password"
                placeholder="请输入密码"
                prepend-icon="mdi-lock"
                :rules="[v => !!v || '请输入密码']"
                required
              />
            </v-col>
          </v-row>
          
          <v-alert
            type="info"
            variant="tonal"
            class="mt-3"
          >
            <v-icon class="mr-2">mdi-information</v-icon>
            请确保输入的账号信息正确,插件将使用此账号登录迅雷网盘
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- 高级设置 -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon color="secondary" class="mr-2">mdi-cog</v-icon>
          高级设置
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="config.timeout"
                label="请求超时时间(秒)"
                type="number"
                min="5"
                max="120"
                prepend-icon="mdi-timer"
                hint="API 请求超时时间,建议 10-30 秒"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="config.max_retries"
                label="最大重试次数"
                type="number"
                min="1"
                max="10"
                prepend-icon="mdi-restart"
                hint="失败时的最大重试次数"
              />
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="config.auto_refresh"
                label="自动刷新任务状态"
                prepend-icon="mdi-autorenew"
                hint="开启后将每 30 秒自动刷新离线下载任务状态"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 功能说明 -->
      <v-card>
        <v-card-title>
          <v-icon color="success" class="mr-2">mdi-help-circle</v-icon>
          功能说明
        </v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-folder-outline</v-icon>
              </template>
              <v-list-item-title>文件浏览</v-list-item-title>
              <v-list-item-subtitle>
                支持浏览迅雷网盘中的文件和文件夹,查看文件大小、修改时间等信息
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-cloud-download-outline</v-icon>
              </template>
              <v-list-item-title>离线下载</v-list-item-title>
              <v-list-item-subtitle>
                支持添加 HTTP、HTTPS、FTP、磁力链接等离线下载任务到迅雷网盘
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-format-list-bulleted</v-icon>
              </template>
              <v-list-item-title>任务管理</v-list-item-title>
              <v-list-item-subtitle>
                查看离线下载任务列表,支持暂停、恢复、取消等操作
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>文件下载</v-list-item-title>
              <v-list-item-subtitle>
                从迅雷网盘下载文件到本地(需要配置下载器)
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- 操作按钮 -->
      <v-card-actions class="mt-4">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          size="large"
          @click="saveConfig"
          :loading="saving"
          prepend-icon="mdi-content-save"
        >
          保存配置
        </v-btn>
        <v-btn
          color="secondary"
          size="large"
          @click="testConnection"
          :loading="testing"
          prepend-icon="mdi-connection"
          class="ml-2"
        >
          测试连接
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-container>
</template>

<style scoped>
/* 无特殊样式 */
</style>
