<template>
  <v-container fluid class="xunleipan-page">
    <!-- 顶部工具栏 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-cloud-download</v-icon>
            迅雷网盘 - 文件管理
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="showOfflineDownloadDialog = true"
              prepend-icon="mdi-plus"
            >
              添加离线下载
            </v-btn>
            <v-btn
              color="secondary"
              @click="refreshFiles"
              :loading="loading"
              prepend-icon="mdi-refresh"
              class="ml-2"
            >
              刷新
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- 面包屑导航 -->
    <v-row class="mb-3">
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbItems" divider="/">
          <template v-slot:prepend>
            <v-breadcrumbs-item @click="navigateToRoot">
              <v-icon>mdi-home</v-icon>
              根目录
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-col>
    </v-row>

    <!-- 文件列表 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="fileList"
              :loading="loading"
              loading-text="加载中..."
              no-data-text="暂无文件"
              hover
              density="comfortable"
            >
              <!-- 文件名 -->
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    :color="item.is_folder ? 'amber' : 'blue'"
                    class="mr-2"
                  >
                    {{ item.is_folder ? 'mdi-folder' : getFileIcon(item.name) }}
                  </v-icon>
                  <span
                    :class="{ 'cursor-pointer': item.is_folder }"
                    @click="item.is_folder && navigateToFolder(item)"
                  >
                    {{ item.name }}
                  </span>
                </div>
              </template>

              <!-- 文件大小 -->
              <template v-slot:item.size="{ item }">
                {{ formatFileSize(item.size) }}
              </template>

              <!-- 修改时间 -->
              <template v-slot:item.modified_time="{ item }">
                {{ formatDate(item.modified_time) }}
              </template>

              <!-- 操作 -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  v-if="!item.is_folder"
                  size="small"
                  color="primary"
                  variant="text"
                  @click="downloadFile(item)"
                  prepend-icon="mdi-download"
                >
                  下载
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  @click="deleteFile(item)"
                  prepend-icon="mdi-delete"
                >
                  删除
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 离线下载对话框 -->
    <v-dialog v-model="showOfflineDownloadDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-link-plus</v-icon>
          添加离线下载任务
        </v-card-title>
        <v-card-text>
          <v-form ref="downloadForm">
            <v-text-field
              v-model="downloadUrl"
              label="下载链接"
              placeholder="支持 HTTP、HTTPS、FTP、磁力链接等"
              required
              rules="[v => !!v || '请输入下载链接']"
            />
            <v-text-field
              v-model="savePath"
              label="保存路径(可选)"
              placeholder="留空则保存到当前目录"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showOfflineDownloadDialog = false">
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="submitOfflineDownload"
            :loading="submitting"
          >
            提交
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 下载任务列表对话框 -->
    <v-dialog v-model="showTaskListDialog" max-width="800">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-format-list-bulleted</v-icon>
          离线下载任务列表
          <v-spacer></v-spacer>
          <v-btn
            size="small"
            color="secondary"
            @click="refreshTasks"
            prepend-icon="mdi-refresh"
          >
            刷新
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="taskHeaders"
            :items="taskList"
            :loading="taskLoading"
            loading-text="加载中..."
            no-data-text="暂无任务"
            hover
            density="comfortable"
          >
            <!-- 任务状态 -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getTaskStatusColor(item.status)"
                size="small"
              >
                {{ getTaskStatusText(item.status) }}
              </v-chip>
            </template>

            <!-- 进度 -->
            <template v-slot:item.progress="{ item }">
              <v-progress-linear
                :model-value="item.progress"
                height="20"
                striped
              >
                <strong>{{ Math.round(item.progress) }}%</strong>
              </v-progress-linear>
            </template>

            <!-- 操作 -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                v-if="item.status === 'downloading'"
                size="small"
                color="warning"
                variant="text"
                @click="pauseTask(item)"
                prepend-icon="mdi-pause"
              >
                暂停
              </v-btn>
              <v-btn
                v-if="item.status === 'paused'"
                size="small"
                color="success"
                variant="text"
                @click="resumeTask(item)"
                prepend-icon="mdi-play"
              >
                继续
              </v-btn>
              <v-btn
                size="small"
                color="error"
                variant="text"
                @click="cancelTask(item)"
                prepend-icon="mdi-cancel"
              >
                取消
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showTaskListDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

// ===== 状态管理 =====
const loading = ref(false)
const submitting = ref(false)
const taskLoading = ref(false)
const currentPath = ref('/')
const fileList = ref<any[]>([])
const taskList = ref<any[]>([])
const showOfflineDownloadDialog = ref(false)
const showTaskListDialog = ref(false)
const downloadUrl = ref('')
const savePath = ref('')

// ===== 计算属性 =====
const breadcrumbItems = computed(() => {
  const paths = currentPath.value.split('/').filter(p => p)
  return paths.map((path, index) => ({
    title: path,
    href: `/${paths.slice(0, index + 1).join('/')}`
  }))
})

const headers = [
  { title: '文件名', key: 'name', sortable: true },
  { title: '大小', key: 'size', sortable: true },
  { title: '修改时间', key: 'modified_time', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

const taskHeaders = [
  { title: '任务名称', key: 'name', sortable: true },
  { title: '状态', key: 'status', sortable: true },
  { title: '进度', key: 'progress', sortable: true },
  { title: '速度', key: 'speed', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
]

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

// ===== 文件操作 =====
const loadFiles = async () => {
  loading.value = true
  try {
    const result = await apiCall(`/files?path=${encodeURIComponent(currentPath.value)}`)
    if (result.code === 200) {
      fileList.value = result.data.files || []
    } else {
      toast.error(result.message || '加载文件列表失败')
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshFiles = () => {
  loadFiles()
}

const navigateToFolder = (folder: any) => {
  currentPath.value = folder.path
  loadFiles()
}

const navigateToRoot = () => {
  currentPath.value = '/'
  loadFiles()
}

const downloadFile = async (file: any) => {
  try {
    const result = await apiCall(`/download/${file.id}`, 'POST')
    if (result.code === 200) {
      toast.success('开始下载')
    } else {
      toast.error(result.message || '下载失败')
    }
  } catch (error) {
    console.error('下载文件失败:', error)
  }
}

const deleteFile = async (file: any) => {
  if (!confirm(`确定要删除 "${file.name}" 吗?`)) {
    return
  }
  
  try {
    const result = await apiCall(`/delete/${file.id}`, 'POST')
    if (result.code === 200) {
      toast.success('删除成功')
      loadFiles()
    } else {
      toast.error(result.message || '删除失败')
    }
  } catch (error) {
    console.error('删除文件失败:', error)
  }
}

// ===== 离线下载 =====
const submitOfflineDownload = async () => {
  if (!downloadUrl.value) {
    toast.error('请输入下载链接')
    return
  }
  
  submitting.value = true
  try {
    const result = await apiCall('/offline_download', 'POST', {
      url: downloadUrl.value,
      save_path: savePath.value || currentPath.value
    })
    
    if (result.code === 200) {
      toast.success('离线下载任务已提交')
      showOfflineDownloadDialog.value = false
      downloadUrl.value = ''
      savePath.value = ''
      // 自动打开任务列表
      showTaskListDialog.value = true
      loadTasks()
    } else {
      toast.error(result.message || '提交失败')
    }
  } catch (error) {
    console.error('提交离线下载失败:', error)
  } finally {
    submitting.value = false
  }
}

// ===== 任务管理 =====
const loadTasks = async () => {
  taskLoading.value = true
  try {
    const result = await apiCall('/tasks')
    if (result.code === 200) {
      taskList.value = result.data.tasks || []
    } else {
      toast.error(result.message || '加载任务列表失败')
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
  } finally {
    taskLoading.value = false
  }
}

const refreshTasks = () => {
  loadTasks()
}

const pauseTask = async (task: any) => {
  try {
    const result = await apiCall(`/task/${task.id}/pause`, 'POST')
    if (result.code === 200) {
      toast.success('任务已暂停')
      loadTasks()
    } else {
      toast.error(result.message || '暂停失败')
    }
  } catch (error) {
    console.error('暂停任务失败:', error)
  }
}

const resumeTask = async (task: any) => {
  try {
    const result = await apiCall(`/task/${task.id}/resume`, 'POST')
    if (result.code === 200) {
      toast.success('任务已恢复')
      loadTasks()
    } else {
      toast.error(result.message || '恢复失败')
    }
  } catch (error) {
    console.error('恢复任务失败:', error)
  }
}

const cancelTask = async (task: any) => {
  if (!confirm(`确定要取消任务 "${task.name}" 吗?`)) {
    return
  }
  
  try {
    const result = await apiCall(`/task/${task.id}/cancel`, 'POST')
    if (result.code === 200) {
      toast.success('任务已取消')
      loadTasks()
    } else {
      toast.error(result.message || '取消失败')
    }
  } catch (error) {
    console.error('取消任务失败:', error)
  }
}

// ===== 工具函数 =====
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    'mp4': 'mdi-movie',
    'mkv': 'mdi-movie',
    'avi': 'mdi-movie',
    'mp3': 'mdi-music',
    'flac': 'mdi-music',
    'jpg': 'mdi-image',
    'png': 'mdi-image',
    'pdf': 'mdi-file-pdf',
    'doc': 'mdi-file-word',
    'docx': 'mdi-file-word',
    'xls': 'mdi-file-excel',
    'xlsx': 'mdi-file-excel',
    'zip': 'mdi-zip-box',
    'rar': 'mdi-zip-box',
    '7z': 'mdi-zip-box'
  }
  return iconMap[ext || ''] || 'mdi-file'
}

const getTaskStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'downloading': 'primary',
    'completed': 'success',
    'failed': 'error',
    'paused': 'warning',
    'waiting': 'grey'
  }
  return colorMap[status] || 'grey'
}

const getTaskStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'downloading': '下载中',
    'completed': '已完成',
    'failed': '失败',
    'paused': '已暂停',
    'waiting': '等待中'
  }
  return textMap[status] || status
}

// ===== 生命周期 =====
onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.xunleipan-page {
  padding: 20px;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}
</style>
