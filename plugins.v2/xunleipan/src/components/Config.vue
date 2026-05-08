<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

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

const emit = defineEmits(['update:model', 'action', 'switch', 'close'])

// 调试信息
console.log('[XunleiPan Config] ========== 组件加载 ==========')
console.log('[XunleiPan Config] Props:', props)

const toast = useToast()

// 插件 ID (使用类名动态获取,分身友好)
const pluginId = 'XunleiPan'

// ===== 配置数据 =====
const config = ref({
  enabled: false,
  username: '',
  cookie: '',
  user_agent: '',
  timeout: 10,
  max_retries: 3,
  auto_refresh: false
})

// 标记 Cookie 是否被修改过
const cookieChanged = ref(false)

const saving = ref(false)
const testing = ref(false)
const guideLoading = ref(false)
const browserLoginLoading = ref(false)

// 表单验证规则
const rules = {
  timeout: [
    v => !!v || '请输入超时时间',
    v => (v >= 5 && v <= 120) || '超时时间应在5-120秒之间'
  ],
  max_retries: [
    v => !!v || '请输入重试次数',
    v => (v >= 1 && v <= 10) || '重试次数应在1-10次之间'
  ]
}

// ===== API 调用 =====
const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    let response
    if (method === 'GET') {
      response = await props.api.get(`plugin/${pluginId}${endpoint}`)
    } else if (method === 'POST') {
      response = await props.api.post(`plugin/${pluginId}${endpoint}`, data)
    }
    
    return response
  } catch (error: any) {
    toast.error(`API 调用失败: ${error.message}`)
    throw error
  }
}

// ===== 配置操作 =====
const loadConfig = async () => {
  try {
    // 优先从 props.model 加载
    if (props.model && Object.keys(props.model).length > 0) {
      config.value = { ...config.value, ...props.model }
      console.log('[Config] 从 props.model 加载配置')

      // 兼容旧配置: 如果只有 password 字段, 将其视为 Cookie 会话
      if (!config.value.cookie && config.value.password && config.value.password !== '********') {
        config.value.cookie = config.value.password
        console.log('[Config] 已从旧 password 字段迁移 Cookie')
      }
    } else {
      // 尝试从 API 获取最新配置
      try {
        const result = await apiCall('/config')
        if (result.code === 200 && result.data) {
          config.value = {
            ...config.value,
            ...result.data
          }
          console.log('[Config] 从 API 加载配置')

          if (!config.value.cookie && config.value.password && config.value.password !== '********') {
            config.value.cookie = config.value.password
            console.log('[Config] 已从 API 旧 password 字段迁移 Cookie')
          }
        }
      } catch (apiError) {
        console.warn('[Config] API 获取配置失败，使用默认值:', apiError)
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const saveConfig = async () => {
  // 验证必填字段
  if (config.value.enabled && (!config.value.cookie || config.value.cookie === '********')) {
    toast.error('启用插件时必须导入浏览器 Cookie 会话')
    return
  }
  
  // 验证表单
  const form = document.querySelector('form')
  if (form && !form.checkValidity()) {
    toast.error('请检查输入格式')
    return
  }

  const timeoutValue = Number(config.value.timeout)
  if (!Number.isInteger(timeoutValue) || timeoutValue < 5 || timeoutValue > 120) {
    toast.error('请求超时时间必须是 5-120 之间的整数')
    return
  }

  const maxRetriesValue = Number(config.value.max_retries)
  if (!Number.isInteger(maxRetriesValue) || maxRetriesValue < 1 || maxRetriesValue > 10) {
    toast.error('最大重试次数必须是 1-10 之间的整数')
    return
  }
  
  saving.value = true
  try {
    // 准备要保存的配置
    const configToSave: any = {
      enabled: config.value.enabled,
      username: config.value.username.trim(),
      user_agent: config.value.user_agent.trim(),
      timeout: timeoutValue,
      max_retries: maxRetriesValue,
      auto_refresh: config.value.auto_refresh
    }
    
    // 仅在 Cookie 被编辑或清空时传递字段，避免覆盖后端已保存会话
    if (cookieChanged.value) {
      configToSave.cookie = config.value.cookie === '********' ? '' : config.value.cookie
      console.log('[Config] Cookie 已修改，将更新会话')
    } else if (config.value.cookie && config.value.cookie !== '********') {
      configToSave.cookie = config.value.cookie
    }
    
    const result = await apiCall('/config', 'POST', configToSave)
    if (result.code === 200) {
      toast.success('✅ 配置保存成功')
      console.log('[Config] 配置保存成功')
      // 通知父组件配置已更新
      emit('update:model', config.value)
      // 重置 Cookie 修改标记
      cookieChanged.value = false
    } else {
      toast.error(result.message || '❌ 保存失败')
      console.error('[Config] 保存失败:', result.message)
    }
  } catch (error: any) {
    console.error('[Config] 保存配置异常:', error)
    toast.error(error.message || '❌ 保存失败，请检查网络连接')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  const cookieValue = config.value.cookie === '********' ? '' : config.value.cookie
  if (!cookieValue) {
    toast.error('请先粘贴浏览器 Cookie 会话')
    return
  }
  
  testing.value = true
  try {
    const result = await apiCall('/test_connection', 'POST', {
      username: config.value.username,
      cookie: cookieValue,
      user_agent: config.value.user_agent
    })
    
    if (result.code === 200) {
      toast.success('✅ Cookie 会话测试成功!')
    } else {
      toast.error(`❌ 连接失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('连接测试失败:', error)
    toast.error(`❌ 连接测试失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

const openLoginGuide = async () => {
  guideLoading.value = true
  const loginWindow = window.open('', '_blank', 'noopener,noreferrer')
  try {
    const result = await apiCall('/login_guide')
    if (result.code === 200 && result.data?.login_url) {
      if (loginWindow) {
        loginWindow.location.href = result.data.login_url
      } else {
        window.location.href = result.data.login_url
      }
      toast.info(result.data.note || '已打开迅雷登录页，请在新页面完成登录后再采集会话')
    } else {
      if (loginWindow) {
        loginWindow.close()
      }
      toast.error(result.message || '无法获取登录页地址')
    }
  } catch (error: any) {
    console.error('打开登录页失败:', error)
    if (loginWindow) {
      loginWindow.close()
    }
    toast.error(error.message || '打开登录页失败')
  } finally {
    guideLoading.value = false
  }
}

const browserLogin = async () => {
  browserLoginLoading.value = true
  try {
    const result = await apiCall('/browser_login', 'POST', {
      wait_seconds: 180,
      login_url: 'https://pan.xunlei.com'
    })

    if (result.code === 200 && result.data) {
      config.value.cookie = result.data.cookie || ''
      config.value.user_agent = result.data.user_agent || ''
      cookieChanged.value = true
      emit('update:model', config.value)

      const accountText = result.data.account ? `，账号标识: ${result.data.account}` : ''
      toast.success(`✅ 浏览器会话采集成功${accountText}，请保存配置`)
    } else {
      const retryHint = result.data?.login_url ? `，可先打开 ${result.data.login_url} 手动登录` : ''
      toast.error(`❌ 浏览器登录失败: ${result.message || '未知错误'}${retryHint}`)
    }
  } catch (error: any) {
    console.error('浏览器登录失败:', error)
    toast.error(error.message || '浏览器登录失败')
  } finally {
    browserLoginLoading.value = false
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
      <!-- 插件状态 -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon color="success" class="mr-2">mdi-power</v-icon>
          插件状态
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="config.enabled"
                label="启用插件"
                prepend-icon="mdi-check-circle"
                hint="开启后插件将自动运行"
                persistent-hint
              />
            </v-col>
          </v-row>
          
          <v-alert
            v-if="config.enabled"
            type="success"
            variant="tonal"
            class="mt-3"
          >
            <v-icon class="mr-2">mdi-check-circle</v-icon>
            插件已启用，可以正常使用所有功能
          </v-alert>
          
          <v-alert
            v-else
            type="warning"
            variant="tonal"
            class="mt-3"
          >
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            插件已禁用，需要启用后才能使用功能
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- 账号配置 -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-account-key</v-icon>
          迅雷网盘会话配置
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="config.username"
                label="账号备注 / 手机号"
                placeholder="可选，仅用于备注"
                prepend-icon="mdi-account"
                clearable
              />
            </v-col>
          </v-row>
          
          <v-alert
            type="info"
            variant="tonal"
            class="mt-3"
          >
            <v-icon class="mr-2">mdi-information</v-icon>
            迅雷网页端当前公开页以手机验证登录 / 账号密码登录为主，没有稳定可见的二维码入口。请先打开登录页并在浏览器里完成登录，再由插件采集 Cookie 和 User-Agent；测试连接会直接校验该会话是否可访问网盘资源。
          </v-alert>

          <v-row class="mt-3">
            <v-col cols="12" md="6">
              <v-btn
                color="primary"
                block
                prepend-icon="mdi-open-in-new"
                :loading="guideLoading"
                @click="openLoginGuide"
              >
                打开登录页
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                color="secondary"
                block
                prepend-icon="mdi-web"
                :loading="browserLoginLoading"
                @click="browserLogin"
              >
                浏览器登录并采集
              </v-btn>
            </v-col>
          </v-row>

          <v-textarea
            v-model="config.cookie"
            label="浏览器 Cookie"
            placeholder="例如：SESSION=xxx; device=xxx; ..."
            prepend-icon="mdi-cookie"
            rows="5"
            auto-grow
            clearable
            class="mt-4"
            @input="cookieChanged = true"
            hint="粘贴浏览器登录后复制的完整 Cookie 字符串"
            persistent-hint
          />

          <v-textarea
            v-model="config.user_agent"
            label="浏览器 User-Agent"
            placeholder="登录后可自动采集，也可手动粘贴"
            prepend-icon="mdi-card-text-outline"
            rows="2"
            auto-grow
            clearable
            class="mt-4"
            hint="建议与浏览器登录时保持一致，便于会话校验"
            persistent-hint
          />
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
                :rules="rules.timeout"
                hint="API 请求超时时间，建议 10-30 秒"
                persistent-hint
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
                :rules="rules.max_retries"
                hint="失败时的最大重试次数"
                persistent-hint
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
                persistent-hint
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

            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-cookie</v-icon>
              </template>
              <v-list-item-title>Cookie 会话登录</v-list-item-title>
              <v-list-item-subtitle>
                在浏览器登录 pan.xunlei.com 后复制 Cookie 粘贴到配置中，插件会用该会话直接访问 api-pan.xunlei.com。
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
