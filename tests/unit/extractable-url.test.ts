import { describe, it, expect } from 'vitest'
import { isExtractableUrl } from '../../lib/messages/client'

describe('isExtractableUrl web store host check', () => {
  it('blocks the Chrome Web Store host and its subdomains', () => {
    expect(isExtractableUrl('https://chromewebstore.google.com/detail/abc').ok).toBe(false)
    expect(isExtractableUrl('https://foo.chromewebstore.google.com/detail/abc').ok).toBe(false)
    expect(isExtractableUrl('https://ChromeWebStore.Google.COM/detail/abc').ok).toBe(false)
    expect(isExtractableUrl('https://user:pass@chromewebstore.google.com/detail/abc').ok).toBe(
      false
    )
  })

  it('blocks the legacy chrome.google.com/webstore path only', () => {
    expect(isExtractableUrl('https://chrome.google.com/webstore').ok).toBe(false)
    expect(isExtractableUrl('https://chrome.google.com/webstore/detail/abc').ok).toBe(false)
    expect(isExtractableUrl('https://chrome.google.com/webstore?hl=en').ok).toBe(false)
    expect(isExtractableUrl('https://chrome.google.com/docs').ok).toBe(true)
    expect(isExtractableUrl('https://chrome.google.com/webstoreevil').ok).toBe(true)
  })

  it('allows lookalike hosts and URLs that only embed the store string', () => {
    expect(isExtractableUrl('https://notchromewebstore.google.com/detail/abc').ok).toBe(true)
    expect(isExtractableUrl('https://chromewebstore.google.com.evil.example/detail/abc').ok).toBe(
      true
    )
    expect(
      isExtractableUrl('https://evil.example/?next=https://chromewebstore.google.com').ok
    ).toBe(true)
    expect(isExtractableUrl('https://evil.example/chromewebstore.google.com').ok).toBe(true)
    expect(isExtractableUrl('https://chromewebstore.google.com@evil.example/').ok).toBe(true)
    expect(isExtractableUrl('https://notchrome.google.com/webstore').ok).toBe(true)
    expect(isExtractableUrl('https://evil.example/chrome.google.com/webstore').ok).toBe(true)
    expect(isExtractableUrl('https://chrome.google.com.evil.example/webstore').ok).toBe(true)
  })

  it('still blocks restricted schemes and allows ordinary pages', () => {
    expect(isExtractableUrl('').ok).toBe(false)
    expect(isExtractableUrl('chrome://settings').ok).toBe(false)
    expect(isExtractableUrl('javascript:alert(1)').ok).toBe(false)
    expect(isExtractableUrl('https://example.com/article').ok).toBe(true)
  })
})
