import { describe, it, expect } from 'vitest'
import { normalizeUrl } from '../../lib/context/normalize-url'

describe('URL Normalizer', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeUrl('')).toBe('')
    expect(normalizeUrl('   ')).toBe('')
  })

  it('strips tracking parameters (utm_*, fbclid, gclid, etc.)', () => {
    const raw =
      'https://example.com/article?utm_source=twitter&utm_medium=social&utm_campaign=launch&fbclid=IwAR234&gclid=CjwKCA'
    const normalized = normalizeUrl(raw)
    expect(normalized).toBe('https://example.com/article')
  })

  it('preserves legitimate non-tracking query parameters', () => {
    const raw = 'https://example.com/search?q=machine+learning&page=2&utm_source=google'
    const normalized = normalizeUrl(raw)
    expect(normalized).toBe('https://example.com/search?page=2&q=machine+learning')
  })

  it('removes URL hash fragments', () => {
    const raw = 'https://example.com/docs#section-installation'
    const normalized = normalizeUrl(raw)
    expect(normalized).toBe('https://example.com/docs')
  })

  it('removes trailing slashes from pathnames', () => {
    const raw = 'https://example.com/blog/my-post/'
    const normalized = normalizeUrl(raw)
    expect(normalized).toBe('https://example.com/blog/my-post')
  })

  it('normalizes domain to lower case', () => {
    const raw = 'https://EXAMPLE.COM/Page'
    const normalized = normalizeUrl(raw)
    expect(normalized).toBe('https://example.com/Page')
  })

  it('deduplicates URLs that differ only in tracking params or trailing slash', () => {
    const url1 = 'https://news.ycombinator.com/item?id=12345&utm_medium=rss'
    const url2 = 'https://news.ycombinator.com/item?utm_source=hackernews&id=12345'

    expect(normalizeUrl(url1)).toBe(normalizeUrl(url2))
  })
})
