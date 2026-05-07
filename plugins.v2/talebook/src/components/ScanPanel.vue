<template>
  <div>
    <!-- 扫描进度显示 -->
    <v-card v-if="scanning" class="mb-6 elevation-4">
      <v-card-title class="text-subtitle-1 py-3">
        <v-icon start color="primary" class="animate-spin">mdi-loading</v-icon>
        {{ progress.stepName }}
      </v-card-title>
      <v-card-text class="pa-5">
        <!-- 步骤指示器 -->
        <v-stepper :model-value="progress.step" alt-labels class="elevation-0">
          <template v-slot:item.1>
            <v-alert type="info" variant="tonal">
              {{ progress.message }}
            </v-alert>
          </template>
          <template v-slot:item.2>
            <v-alert type="info" variant="tonal">
              {{ progress.message }}
            </v-alert>
          </template>
          <template v-slot:item.3>
            <v-alert type="success" variant="tonal">
              {{ progress.message }}
            </v-alert>
          </template>
          <template v-slot:item.4>
            <v-alert type="success" variant="tonal">
              {{ progress.message }}
            </v-alert>
          </template>
        </v-stepper>
        
        <!-- 详细信息 -->
        <v-divider class="my-4"></v-divider>
        <div v-if="progress.details.totalFiles !== undefined" class="mt-3">
          <v-row>
            <v-col cols="6" md="3">
              <v-card variant="outlined" class="text-center py-3 rounded-xl">
                <div class="text-h5 font-weight-bold text-grey-darken-2">{{ progress.details.totalFiles }}</div>
                <div class="text-caption text-grey mt-1">总文件数</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card variant="outlined" class="text-center py-3 rounded-xl" color="info">
                <div class="text-h5 font-weight-bold">{{ progress.details.newFiles || 0 }}</div>
                <div class="text-caption mt-1">新增文件</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card variant="outlined" class="text-center py-3 rounded-xl" color="warning">
                <div class="text-h5 font-weight-bold">{{ progress.details.existFiles || 0 }}</div>
                <div class="text-caption mt-1">已存在</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card variant="outlined" class="text-center py-3 rounded-xl" color="success">
                <div class="text-h5 font-weight-bold">{{ progress.details.importedCount || 0 }}</div>
                <div class="text-caption mt-1">已导入</div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- 操作按钮 -->
    <v-card class="mb-6 elevation-4">
      <v-card-text class="pa-5">
        <v-row>
          <v-col cols="12" md="6">
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              prepend-icon="mdi-play-circle"
              :loading="scanning"
              block
              @click="$emit('scan')"
            >
              一键扫描导入
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              color="secondary"
              variant="tonal"
              size="large"
              prepend-icon="mdi-history"
              block
              @click="$emit('view-recent')"
            >
              查看最近添加
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface ScanProgress {
  step: number
  stepName: string
  message: string
  details: {
    totalFiles?: number
    newFiles?: number
    existFiles?: number
    importedCount?: number
  }
}

interface Props {
  scanning: boolean
  progress: ScanProgress
}

defineProps<Props>()

defineEmits<{
  scan: []
  'view-recent': []
}>()
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
