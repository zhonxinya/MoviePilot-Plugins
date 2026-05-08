<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="2">
          <!-- 标题栏 -->
          <v-card-title class="text-h5 pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon start color="primary" size="large">mdi-book-search</v-icon>
              <span class="ml-2">起点图书搜索</span>
            </div>
            <v-btn
              icon
              variant="text"
              @click="showLoginDialog = true"
              :title="authStatus.logged_in ? '已登录' : '点击登录'"
            >
              <v-icon :color="authStatus.logged_in ? 'success' : 'grey'">
                {{ authStatus.logged_in ? 'mdi-account-check' : 'mdi-account' }}
              </v-icon>
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 搜索框 -->
            <v-row class="mb-4">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchKeyword"
                  label="搜索图书"
                  prepend-inner-icon="mdi-magnify"
                  placeholder="输入书名、作者或关键词"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  size="large"
                  block
                  :loading="isLoading"
                  @click="handleSearch"
                >
                  搜索
                </v-btn>
              </v-col>
            </v-row>

            <!-- 搜索结果 -->
            <div v-if="books.length > 0">
              <v-subheader class="px-0">
                <v-icon start>mdi-bookshelf</v-icon>
                搜索结果 ({{ books.length }}本)
              </v-subheader>

              <v-row>
                <v-col
                  v-for="book in books"
                  :key="book.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card hover elevation="2" @click="showBookDetail(book)">
                    <v-img
                      :src="book.cover || '/logo.png'"
                      height="200"
                      cover
                      class="align-end text-white"
                    >
                      <v-card-title class="text-subtitle-1">
                        {{ book.title }}
                      </v-card-title>
                    </v-img>

                    <v-card-text class="py-2">
                      <div class="text-caption text-medium-emphasis mb-1">
                        <v-icon size="small" start>mdi-account</v-icon>
                        {{ book.author }}
                      </div>
                      <div class="text-caption text-medium-emphasis mb-1">
                        <v-icon size="small" start>mdi-tag</v-icon>
                        {{ book.category }}
                      </div>
                      <div class="text-caption text-medium-emphasis mb-1">
                        <v-icon size="small" start>mdi-star</v-icon>
                        评分: {{ book.rating }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        <v-icon size="small" start>mdi-file-document</v-icon>
                        {{ book.word_count }} | {{ book.status }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- 空状态 -->
            <v-empty-state
              v-else-if="!isLoading && searched"
              title="未找到相关图书"
              text="请尝试其他关键词"
              icon="mdi-book-off"
            />

            <!-- 初始状态 -->
            <v-empty-state
              v-else-if="!isLoading && !searched"
              title="搜索起点图书"
              text="输入关键词开始搜索"
              icon="mdi-book-search"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 图书详情对话框 -->
    <v-dialog v-model="detailDialog" max-width="800">
      <v-card v-if="selectedBook">
        <v-card-title class="text-h5 pa-4">
          {{ selectedBook.title }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-img
                :src="selectedBook.cover || '/logo.png'"
                aspect-ratio="0.7"
                cover
                class="rounded-lg"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>作者</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedBook.author }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title>分类</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedBook.category }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-star</v-icon>
                  </template>
                  <v-list-item-title>评分</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedBook.rating }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-file-document</v-icon>
                  </template>
                  <v-list-item-title>字数</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedBook.word_count }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-clock-outline</v-icon>
                  </template>
                  <v-list-item-title>状态</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedBook.status }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-3" />

              <div class="text-body-2">
                <strong>简介：</strong>
                <p class="mt-2">{{ selectedBook.description }}</p>
              </div>

              <div v-if="selectedBook.tags && selectedBook.tags.length > 0" class="mt-3">
                <strong>标签：</strong>
                <v-chip
                  v-for="tag in selectedBook.tags"
                  :key="tag"
                  size="small"
                  class="ma-1"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="detailDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 登录对话框 -->
    <v-dialog v-model="showLoginDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon start color="primary">mdi-login</v-icon>
          起点登录
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            v-if="authStatus.logged_in"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            <div>当前已登录</div>
            <div class="text-caption">用户: {{ authStatus.username }}</div>
            <div class="text-caption">最后登录: {{ authStatus.last_login }}</div>
          </v-alert>

          <v-textarea
            v-model="cookieInput"
            label="Cookie"
            placeholder="请粘贴起点网站的Cookie..."
            rows="5"
            auto-grow
            hint="从浏览器开发者工具中复制Cookie"
            persistent-hint
          />

          <v-alert
            v-if="loginMessage"
            :type="loginMessageType"
            variant="tonal"
            class="mt-3"
          >
            {{ loginMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            v-if="authStatus.logged_in"
            color="error"
            variant="outlined"
            :loading="isLoggingOut"
            @click="handleLogout"
          >
            登出
          </v-btn>
          <v-btn
            color="primary"
            :loading="isLoggingIn"
            @click="handleLogin"
          >
            {{ authStatus.logged_in ? '更新Cookie' : '登录' }}
          </v-btn>
          <v-btn variant="text" @click="showLoginDialog = false">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  api: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['action', 'switch', 'close'])

// 调试信息
console.log('[QidianBook Page] ========== 组件加载 ==========')
console.log('[QidianBook Page] Props:', props)

// 搜索相关
const searchKeyword = ref('')
const books = ref([])
const isLoading = ref(false)
const searched = ref(false)

// 图书详情
const detailDialog = ref(false)
const selectedBook = ref(null)

// 认证相关
const showLoginDialog = ref(false)
const cookieInput = ref('')
const isLoggingIn = ref(false)
const isLoggingOut = ref(false)
const loginMessage = ref('')
const loginMessageType = ref('info')
const authStatus = ref({
  logged_in: false,
  username: null,
  cookie_valid: false,
  last_login: null
})

// 加载认证状态
async function loadAuthStatus() {
  try {
    const response = await props.api.get('plugin/QidianBook/auth/status')
    if (response.code === 200) {
      authStatus.value = response.data
    }
  } catch (error) {
    console.error('加载认证状态失败:', error)
  }
}

// 登录
async function handleLogin() {
  if (!cookieInput.value.trim()) {
    loginMessage.value = '请输入Cookie'
    loginMessageType.value = 'error'
    return
  }

  isLoggingIn.value = true
  loginMessage.value = ''

  try {
    const response = await props.api.post('plugin/QidianBook/auth/login', {
      cookie: cookieInput.value
    })

    if (response.code === 200) {
      loginMessage.value = '登录成功！'
      loginMessageType.value = 'success'
      await loadAuthStatus()
      setTimeout(() => {
        showLoginDialog.value = false
        loginMessage.value = ''
      }, 1500)
    } else {
      loginMessage.value = response.message || '登录失败'
      loginMessageType.value = 'error'
    }
  } catch (error) {
    console.error('登录出错:', error)
    loginMessage.value = '登录失败: ' + (error instanceof Error ? error.message : '未知错误')
    loginMessageType.value = 'error'
  } finally {
    isLoggingIn.value = false
  }
}

// 登出
async function handleLogout() {
  isLoggingOut.value = true
  loginMessage.value = ''

  try {
    const response = await props.api.post('plugin/QidianBook/auth/logout')

    if (response.code === 200) {
      loginMessage.value = '已登出'
      loginMessageType.value = 'success'
      await loadAuthStatus()
      cookieInput.value = ''
      setTimeout(() => {
        showLoginDialog.value = false
        loginMessage.value = ''
      }, 1500)
    } else {
      loginMessage.value = response.message || '登出失败'
      loginMessageType.value = 'error'
    }
  } catch (error) {
    console.error('登出出错:', error)
    loginMessage.value = '登出失败: ' + (error instanceof Error ? error.message : '未知错误')
    loginMessageType.value = 'error'
  } finally {
    isLoggingOut.value = false
  }
}

// 搜索图书
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    return
  }

  isLoading.value = true
  searched.value = true
  books.value = []

  try {
    const response = await props.api.get('plugin/QidianBook/search', {
      params: {
        keyword: searchKeyword.value,
        page: 1
      }
    })

    if (response.code === 200) {
      books.value = response.data?.books || []
    } else {
      console.error('搜索失败:', response.message)
    }
  } catch (error) {
    console.error('搜索出错:', error)
  } finally {
    isLoading.value = false
  }
}

// 显示图书详情
function showBookDetail(book) {
  selectedBook.value = book
  detailDialog.value = true
}

// 组件挂载时加载认证状态
onMounted(() => {
  loadAuthStatus()
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>
