/**
 * Talebook 图片加载工具
 * 
 * 功能:
 * 1. 通过 props.api 获取图片(自动携带认证 token)
 * 2. 转换为 Blob URL
 * 3. 浏览器缓存管理
 */

import { ref, watch, onUnmounted, unref, type MaybeRefOrGetter } from 'vue'

// 图片缓存 Map: URL -> Blob URL
const imageCache = new Map<string, string>()

// 正在加载的图片 Promise Map: URL -> Promise<Blob URL>
const loadingImages = new Map<string, Promise<string>>()

export type ImageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface LoadImageOptions {
  useCache?: boolean
}

interface LoadedImageResult {
  url: string
  fromCache: boolean
}

async function readBlobPreview(blob: Blob, maxLength: number = 200): Promise<string> {
  try {
    const text = await blob.text()
    return text.slice(0, maxLength)
  } catch {
    return ''
  }
}

async function parseBlobError(blob: Blob): Promise<unknown> {
  try {
    const text = await blob.text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isImageBlob(blob: Blob): boolean {
  return blob instanceof Blob && blob.size > 0 && blob.type.startsWith('image/')
}

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
  options: LoadImageOptions = {}
): Promise<LoadedImageResult> {
  const useCache = options.useCache ?? true

  if (!imageUrl) {
    console.warn('[ImageLoader] 图片 URL 为空')
    return { url: '', fromCache: false }
  }

  if (!api || typeof api.get !== 'function') {
    console.error('[ImageLoader] API 对象无效:', api)
    return { url: '', fromCache: false }
  }

  // 检查缓存
  if (useCache && imageCache.has(imageUrl)) {
    const cachedUrl = imageCache.get(imageUrl)!
    // Blob URL 可以直接使用,无需验证
    console.log('[ImageLoader] 使用缓存图片:', imageUrl)
    return { url: cachedUrl, fromCache: true }
  }

  // 检查是否正在加载中
  if (loadingImages.has(imageUrl)) {
    const url = await loadingImages.get(imageUrl)!
    return { url, fromCache: useCache && imageCache.has(imageUrl) }
  }

  // 开始加载
  const loadPromise = (async () => {
    try {
      console.log('[ImageLoader] 加载图片:', imageUrl)
      
      // imageUrl 已经是后端代理 URL（由 getCoverUrl 生成）
      // 格式: /plugin/Talebook/image/proxy?url=xxx
      // 直接使用该 URL 请求即可
      console.log('[ImageLoader] 使用代理 URL:', imageUrl)
      
      // 使用 axios 通过后端代理获取图片 blob
      // responseType: 'blob' 告诉 axios 返回二进制数据
      let response
      try {
        response = await api.get(imageUrl, {
          responseType: 'blob'
        })
        console.log('[ImageLoader] 响应状态:', response?.status)
        console.log('[ImageLoader] 响应头:', response?.headers)
      } catch (error: any) {
        console.error('[ImageLoader] axios 请求失败:', error.message)
        if (error.response) {
          console.error('[ImageLoader] 错误响应状态:', error.response.status)
          console.error('[ImageLoader] 错误响应数据:', error.response.data)
        }
        throw error
      }
      
      // 检查响应数据是否存在
      const blob = response instanceof Blob
        ? response
        : response?.data instanceof Blob
          ? response.data
          : null

      if (!blob) {
        console.error('[ImageLoader] 响应数据为空', {
          hasResponse: !!response,
          responseType: typeof response,
          responseKeys: response && typeof response === 'object' ? Object.keys(response) : []
        })
        return ''
      }

      const responseStatus = response?.status ?? 200
      const responseHeaders = response?.headers ?? {}
      console.log('[ImageLoader] 响应数据类型:', typeof blob, blob.constructor?.name)
      console.log('[ImageLoader] 响应数据大小:', blob.size || 'unknown')
      
      // 验证是否为 Blob 对象
      if (!(blob instanceof Blob)) {
        console.error('[ImageLoader] 响应数据不是 Blob 对象:', blob)
        // 尝试解析为 JSON 错误信息
        if (blob instanceof ArrayBuffer || typeof blob === 'string') {
          try {
            const text = typeof blob === 'string' ? blob : new TextDecoder().decode(blob)
            const errorData = JSON.parse(text)
            console.error('[ImageLoader] 后端返回错误:', errorData)
          } catch (e) {
            console.error('[ImageLoader] 无法解析错误响应')
          }
        }
        return ''
      }

      if (!isImageBlob(blob)) {
        const parsedError = await parseBlobError(blob)
        const preview = parsedError ? JSON.stringify(parsedError) : await readBlobPreview(blob)
        console.error('[ImageLoader] 响应 Blob 不是有效图片:', {
          status: responseStatus,
          contentType: blob.type || responseHeaders?.['content-type'] || 'unknown',
          size: blob.size,
          preview
        })
        
        // 如果是 JSON 错误响应,抛出具体错误信息
        if (blob.type === 'application/json' && parsedError) {
          const errorObj = parsedError as any
          throw new Error(errorObj.message || `图片加载失败: ${errorObj.code || '未知错误'}`)
        }
        
        return ''
      }
      
      // 检查 Blob 是否为空
      if (blob.size === 0) {
        console.error('[ImageLoader] Blob 数据为空')
        return ''
      }
      
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

  const url = await loadPromise
  return {
    url,
    fromCache: false
  }
}

/**
 * 预加载多张图片
 * 
 * @param imageUrls - 图片 URL 数组
 * @param useCache - 是否使用缓存
 */
export async function preloadImages(
  imageUrls: string[],
  api: any,
  options: LoadImageOptions = {}
): Promise<void> {
  const promises = imageUrls.map(url => loadImage(url, api, options))
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
function resolveImageSource(imageSource: MaybeRefOrGetter<string>): string {
  if (typeof imageSource === 'function') {
    return (imageSource as () => string)()
  }

  return unref(imageSource)
}

export function useImageLoader(imageSource: MaybeRefOrGetter<string>, api: any) {
  const loadedUrl = ref<string>('')
  const loading = ref<boolean>(false)
  const error = ref<string>('')
  const status = ref<ImageLoadStatus>('idle')

  let cancelled = false
  let requestVersion = 0
  let currentUrl = ''
  let currentFromCache = true

  const revokeCurrentUrl = () => {
    if (currentUrl && !currentFromCache) {
      URL.revokeObjectURL(currentUrl)
    }

    currentUrl = ''
    currentFromCache = true
  }

  const runLoad = async (currentImageUrl: string) => {
    const currentRequest = ++requestVersion

    if (!currentImageUrl || !api || cancelled) {
      revokeCurrentUrl()
      loadedUrl.value = ''
      error.value = ''
      loading.value = false
      status.value = 'idle'
      return
    }

    loading.value = true
    error.value = ''
    status.value = 'loading'

    try {
      const { url, fromCache } = await loadImage(currentImageUrl, api)
      if (!cancelled && currentRequest === requestVersion) {
        revokeCurrentUrl()
        loadedUrl.value = url
        currentUrl = url
        currentFromCache = fromCache
        if (!url) {
          error.value = '加载失败'
          status.value = 'error'
        } else {
          status.value = 'loaded'
        }
      }
    } catch (e) {
      if (!cancelled && currentRequest === requestVersion) {
        error.value = String(e)
        status.value = 'error'
      }
    } finally {
      if (!cancelled && currentRequest === requestVersion) {
        loading.value = false
      }
    }
  }

  const stop = watch(
    () => resolveImageSource(imageSource),
    runLoad,
    { immediate: true }
  )

  onUnmounted(() => {
    cancelled = true
    stop()
    revokeCurrentUrl()
  })

  return {
    imageUrl: loadedUrl,
    loading,
    error,
    status,
    reload: () => runLoad(resolveImageSource(imageSource))
  }
}
