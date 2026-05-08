/**
 * Talebook 图片加载工具
 * 
 * 功能:
 * 1. 通过 props.api 获取图片(自动携带认证 token)
 * 2. 转换为 Blob URL
 * 3. 浏览器缓存管理
 */

import { ref, onMounted, onUnmounted } from 'vue'

// 图片缓存 Map: URL -> Blob URL
const imageCache = new Map<string, string>()

// 正在加载的图片 Promise Map: URL -> Promise<Blob URL>
const loadingImages = new Map<string, Promise<string>>()

/**
 * 加载图片并返回 Blob URL
 * 
 * @param imageUrl - 图片 URL (相对路径或完整 URL)
 * @param api - MoviePilot-Frontend 的 API 对象(axios 实例)
 * @param useCache - 是否使用缓存 (默认 true)
 * @returns Blob URL 或空字符串(失败时)
 */
export async function loadImage(
  imageUrl: string,
  api: any,
  useCache: boolean = true
): Promise<string> {
  if (!imageUrl) {
    console.warn('[ImageLoader] 图片 URL 为空')
    return ''
  }

  if (!api || typeof api.get !== 'function') {
    console.error('[ImageLoader] API 对象无效:', api)
    return ''
  }

  // 检查缓存
  if (useCache && imageCache.has(imageUrl)) {
    const cachedUrl = imageCache.get(imageUrl)!
    // 验证 Blob URL 是否仍然有效
    try {
      const response = await fetch(cachedUrl)
      if (response.ok) {
        return cachedUrl
      }
    } catch {
      // Blob URL 失效,清除缓存
      imageCache.delete(imageUrl)
    }
  }

  // 检查是否正在加载中
  if (loadingImages.has(imageUrl)) {
    return loadingImages.get(imageUrl)!
  }

  // 开始加载
  const loadPromise = (async () => {
    try {
      console.log('[ImageLoader] 加载图片:', imageUrl)
      
      // 构建完整 URL
      let fullUrl = imageUrl
      if (imageUrl.startsWith('/')) {
        // 相对路径,拼接当前域名
        fullUrl = `${window.location.origin}${imageUrl}`
      }

      console.log('[ImageLoader] 请求 URL:', fullUrl)
      
      // 使用 axios 获取图片 blob
      // responseType: 'blob' 告诉 axios 返回二进制数据
      const response = await api.get(fullUrl, {
        responseType: 'blob'
      })

      console.log('[ImageLoader] 响应状态:', response.status)
      
      // 获取 Blob 数据
      const blob = response.data
      
      // 创建 Blob URL
      const blobUrl = URL.createObjectURL(blob)
      
      // 存入缓存
      if (useCache) {
        imageCache.set(imageUrl, blobUrl)
      }

      console.log('[ImageLoader] 图片加载成功:', imageUrl, '大小:', blob.size, 'bytes')
      return blobUrl
    } catch (error) {
      console.error('[ImageLoader] 图片加载失败:', imageUrl, error)
      return ''
    } finally {
      // 移除加载状态
      loadingImages.delete(imageUrl)
    }
  })()

  // 记录加载状态
  loadingImages.set(imageUrl, loadPromise)
  
  return loadPromise
}

/**
 * 预加载多张图片
 * 
 * @param imageUrls - 图片 URL 数组
 * @param useCache - 是否使用缓存
 */
export async function preloadImages(
  imageUrls: string[],
  useCache: boolean = true
): Promise<void> {
  const promises = imageUrls.map(url => loadImage(url, useCache))
  await Promise.allSettled(promises)
}

/**
 * 清除图片缓存
 * 
 * @param imageUrl - 可选,指定清除某个图片缓存,不传则清除所有
 */
export function clearImageCache(imageUrl?: string): void {
  if (imageUrl) {
    const blobUrl = imageCache.get(imageUrl)
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      imageCache.delete(imageUrl)
    }
  } else {
    // 清除所有缓存
    imageCache.forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl)
    })
    imageCache.clear()
  }
  
  console.log('[ImageLoader] 缓存已清除')
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): { count: number; urls: string[] } {
  return {
    count: imageCache.size,
    urls: Array.from(imageCache.keys())
  }
}

/**
 * Vue 组合式 API: 响应式图片加载
 * 
 * @example
 * ```typescript
 * const { imageUrl, loading, error } = useImageLoader(book.thumb, props.api)
 * ```
 */
export function useImageLoader(imageUrl: string, api: any) {
  const loadedUrl = ref<string>('')
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  let cancelled = false

  const load = async () => {
    if (!imageUrl || !api || cancelled) return
    
    loading.value = true
    error.value = ''
    
    try {
      const url = await loadImage(imageUrl, api)
      if (!cancelled) {
        loadedUrl.value = url
        if (!url) {
          error.value = '加载失败'
        }
      }
    } catch (e) {
      if (!cancelled) {
        error.value = String(e)
      }
    } finally {
      if (!cancelled) {
        loading.value = false
      }
    }
  }

  onMounted(() => {
    load()
  })

  onUnmounted(() => {
    cancelled = true
  })

  return {
    imageUrl: loadedUrl,
    loading,
    error,
    reload: load
  }
}
