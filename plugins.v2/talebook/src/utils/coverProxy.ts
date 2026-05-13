export const NO_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4='

export type BookCoverVariant = 'card' | 'detail'

export interface CoverSource {
  url: string
  field: string | null
}

const COVER_FIELD_PRIORITIES: Record<BookCoverVariant, string[]> = {
  card: ['cover_url', 'coverUrl', 'thumb', 'img'],
  detail: ['cover_url', 'coverUrl', 'img', 'thumb']
}

function isBookLike(book: unknown): book is Record<string, unknown> {
  return !!book && typeof book === 'object'
}

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

export function resolveCoverSource(book: unknown, variant: BookCoverVariant = 'card'): CoverSource {
  if (!isBookLike(book)) {
    return { url: '', field: null }
  }

  const fields = COVER_FIELD_PRIORITIES[variant]
  for (const field of fields) {
    const value = book[field]
    if (typeof value === 'string' && value.trim()) {
      return { url: value.trim(), field }
    }
  }

  return { url: '', field: null }
}

export function buildProxyImageUrl(imageUrl: string, serverUrl: string, apiBasePath: string): string {
  if (!imageUrl) {
    return NO_COVER_PLACEHOLDER
  }

  let resolvedUrl = imageUrl
  if (resolvedUrl.startsWith('/') && !isAbsoluteUrl(resolvedUrl) && serverUrl) {
    resolvedUrl = `${serverUrl}${resolvedUrl}`
  }

  // 🔄 关键修复: 添加时间戳参数,防止浏览器缓存旧图片
  // 当后端清除缓存后,新图片需要立即显示
  const timestamp = Date.now()
  return `${apiBasePath}?url=${encodeURIComponent(resolvedUrl)}&t=${timestamp}`
}

export function buildBookCoverUrl(
  book: unknown,
  serverUrl: string,
  apiBasePath: string,
  variant: BookCoverVariant = 'card'
): string {
  const { url } = resolveCoverSource(book, variant)

  if (!url) {
    return NO_COVER_PLACEHOLDER
  }

  return buildProxyImageUrl(url, serverUrl, apiBasePath)
}