import type { PageMetadata } from '../../types/context'

function sanitizeHttpUrl(rawUrl?: string | null, baseUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) return ''
  try {
    const base = baseUrl && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))
      ? baseUrl
      : undefined
    const parsed = new URL(rawUrl.trim(), base)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href
    }
  } catch {
    // Ignore URL parse error
  }
  return ''
}

/**
 * Extracts metadata (title, url, description, author, publish date) from a DOM Document.
 * Looks into OpenGraph, Twitter Cards, standard meta tags, canonical links, and JSON-LD.
 */
export function extractMetadata(doc: Document, fallbackUrl?: string): PageMetadata {
  const getMeta = (...selectors: string[]): string | undefined => {
    for (const sel of selectors) {
      const el = doc.querySelector(sel)
      if (el) {
        const content = el.getAttribute('content') || el.getAttribute('value')
        if (content && content.trim()) {
          return content.trim()
        }
      }
    }
    return undefined
  }

  // 1. Title
  const title =
    getMeta('meta[property="og:title"]', 'meta[name="twitter:title"]', 'meta[name="title"]') ||
    doc.title?.trim() ||
    doc.querySelector('h1')?.textContent?.trim() ||
    'Untitled'

  // 2. URL (strictly sanitized to http/https protocols)
  const fallback =
    fallbackUrl !== undefined
      ? fallbackUrl
      : typeof window !== 'undefined'
        ? window.location?.href
        : ''
  const baseHref = fallback || doc.baseURI
  const ogUrl = getMeta('meta[property="og:url"]')
  const canonicalEl = doc.querySelector('link[rel="canonical"]')
  const canonicalUrl = canonicalEl?.getAttribute('href')

  const url =
    sanitizeHttpUrl(ogUrl, baseHref) ||
    sanitizeHttpUrl(canonicalUrl, baseHref) ||
    sanitizeHttpUrl(fallback) ||
    ''

  // 3. Description
  const description = getMeta(
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]'
  )

  // 4. Author
  let author = getMeta(
    'meta[name="author"]',
    'meta[property="article:author"]',
    'meta[name="twitter:creator"]'
  )

  // 5. Published Date
  let publishedAt = getMeta(
    'meta[property="article:published_time"]',
    'meta[name="date"]',
    'meta[name="pubdate"]',
    'meta[name="publishdate"]',
    'meta[name="DC.date.issued"]'
  )

  if (!publishedAt) {
    const timeEl = doc.querySelector('time[datetime]')
    if (timeEl) {
      publishedAt = timeEl.getAttribute('datetime') || timeEl.textContent?.trim()
    }
  }

  // 6. JSON-LD structured data fallback for author and date
  try {
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]')
    for (const script of Array.from(jsonLdScripts)) {
      if (!script.textContent) continue
      const data = JSON.parse(script.textContent)
      const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data]

      for (const item of graph) {
        if (!author && item.author) {
          if (typeof item.author === 'string') {
            author = item.author
          } else if (typeof item.author === 'object' && item.author.name) {
            author = item.author.name
          } else if (Array.isArray(item.author) && item.author[0]?.name) {
            author = item.author[0].name
          }
        }

        if (!publishedAt && (item.datePublished || item.dateCreated)) {
          publishedAt = item.datePublished || item.dateCreated
        }
      }
    }
  } catch {
    // JSON-LD parsing error can be ignored safely
  }

  // Format publishedAt to ISO or clean string if possible
  if (publishedAt) {
    try {
      const parsedDate = new Date(publishedAt)
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString().split('T')[0]
      }
    } catch {
      // keep raw string
    }
  }

  return {
    title,
    url,
    description: description || undefined,
    author: author || undefined,
    publishedAt: publishedAt || undefined,
  }
}
