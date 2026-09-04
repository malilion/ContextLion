import { describe, it, expect } from 'vitest'
import { extractSelection } from '../../lib/extractor/extract-selection'

describe('Selection Extractor module (V1)', () => {
  it('returns null when window has no active selection', () => {
    const parser = new DOMParser()
    const doc = parser.parseFromString('<html><body><p>Hello world</p></body></html>', 'text/html')

    const fakeWindow = {
      location: { href: 'https://example.com' },
      getSelection: () => null,
    } as unknown as Window

    const res = extractSelection(doc, fakeWindow)
    expect(res).toBeNull()
  })

  it('extracts highlighted text when selection exists', () => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(
      '<html><head><title>Test Page</title></head><body><p id="target">Selected paragraph content</p></body></html>',
      'text/html'
    )

    const target = doc.getElementById('target')!
    const range = doc.createRange()
    range.selectNodeContents(target)

    const fakeWindow = {
      location: { href: 'https://example.com/test' },
      getSelection: () => ({
        rangeCount: 1,
        isCollapsed: false,
        getRangeAt: () => range,
      }),
    } as unknown as Window

    const res = extractSelection(doc, fakeWindow)
    expect(res).not.toBeNull()
    expect(res?.textContent).toBe('Selected paragraph content')
    expect(res?.metadata.title).toContain('(Selection)')
    expect(res?.contentHtml).toContain('Selected paragraph content')
  })
})
