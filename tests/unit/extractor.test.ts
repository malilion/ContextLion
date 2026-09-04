import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { extractMetadata } from '../../lib/extractor/extract-metadata'
import { extractDocument } from '../../lib/extractor/extract-document'

describe('Extractor module', () => {
  const readFixture = (name: string): Document => {
    const filePath = path.resolve(__dirname, '../fixtures', name)
    const html = fs.readFileSync(filePath, 'utf-8')
    const parser = new DOMParser()
    return parser.parseFromString(html, 'text/html')
  }

  it('extracts metadata correctly from article-simple.html', () => {
    const doc = readFixture('article-simple.html')
    const metadata = extractMetadata(doc)

    expect(metadata.title).toBe('Understanding Modern Browser Extensions - Deep Dive')
    expect(metadata.url).toBe('https://example.com/articles/modern-browser-extensions')
    expect(metadata.description).toBe('A comprehensive architectural guide to Manifest V3.')
    expect(metadata.author).toBe('Alex Lion')
    expect(metadata.publishedAt).toBe('2026-05-12')
  })

  it('extracts CJK metadata and JSON-LD author correctly', () => {
    const doc = readFixture('article-cjk.html')
    const metadata = extractMetadata(doc)

    expect(metadata.title).toBe('繁體中文網頁擷取與人工智慧語境架構')
    expect(metadata.author).toBe('張小獅')
    expect(metadata.publishedAt).toBe('2026-09-04')
  })

  it('NEVER mutates the original DOM when extracting (uses cloned DOM)', () => {
    const doc = readFixture('article-simple.html')
    const navBefore = doc.querySelector('nav')
    expect(navBefore).not.toBeNull()

    const result = extractDocument(doc)

    // Original DOM should still have its nav and footer intact
    expect(doc.querySelector('nav')).not.toBeNull()
    expect(doc.querySelector('footer')).not.toBeNull()

    // But extraction content should NOT have nav or footer
    expect(result.contentHtml).not.toContain('navbar')
    expect(result.contentHtml).not.toContain('site-footer')
    expect(result.contentHtml).toContain('Manifest V3')
  })

  it('handles SPA empty or minimal shell gracefully', () => {
    const doc = readFixture('spa-empty.html')
    const result = extractDocument(doc)

    expect(result.metadata.title).toBe('Single Page App Shell')
    expect(result.textContent).toContain('Loading dynamic application')
  })
})
