export const NO_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4='

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

export function buildProxyImageUrl(imageUrl: string, serverUrl: string, apiBasePath: string): string {
  if (!imageUrl) {
    return NO_COVER_PLACEHOLDER
  }

  let resolvedUrl = imageUrl
  if (resolvedUrl.startsWith('/') && !isAbsoluteUrl(resolvedUrl) && serverUrl) {
    resolvedUrl = `${serverUrl}${resolvedUrl}`
  }

  return `${apiBasePath}?url=${encodeURIComponent(resolvedUrl)}`
}