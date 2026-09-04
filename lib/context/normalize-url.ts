const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^gbraid$/i,
  /^wbraid$/i,
  /^msclkid$/i,
  /^mc_[ce]id$/i,
  /^_g[al]$/i,
  /^yclid$/i,
  /^_hs(enc|mi)$/i,
  /^spm$/i,
  /^scm$/i,
  /^ref$/i,
  /^ref_/i,
  /^igshid$/i,
]

/**
 * Normalizes a URL by stripping tracking parameters, hash anchors,
 * sorting query parameters, and normalizing trailing slashes.
 * Used to avoid duplicate page extractions across multiple tabs.
 */
export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl || !rawUrl.trim()) {
    return ''
  }

  try {
    const parsed = new URL(rawUrl.trim())

    // Filter out tracking query params
    const cleanParams = new URLSearchParams()
    const sortedKeys = Array.from(parsed.searchParams.keys()).sort()

    for (const key of sortedKeys) {
      const isTracking = TRACKING_PARAM_PATTERNS.some((p) => p.test(key))
      if (!isTracking) {
        const values = parsed.searchParams.getAll(key)
        for (const val of values) {
          cleanParams.append(key, val)
        }
      }
    }

    // Clean pathname
    let pathname = parsed.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }

    const searchStr = cleanParams.toString()
    const query = searchStr ? `?${searchStr}` : ''

    // Reconstruct clean canonical URL (excluding hash fragments)
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${pathname}${query}`
  } catch {
    // If URL parsing fails, return trimmed raw URL
    return rawUrl.trim()
  }
}
