import { describe, it, expect } from 'vitest'
import { cleanDom } from '../../lib/cleaner/clean-dom'
import { removeNoise } from '../../lib/cleaner/remove-noise'

describe('Cleaner module', () => {
  it('removes nav, footer, script, style, and aside elements', () => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(
      `<html><body>
        <nav><a href="/">Home</a></nav>
        <main>
          <h1>Main Article</h1>
          <p>Body paragraph</p>
        </main>
        <aside>Sidebar ad</aside>
        <footer>Footer copyright</footer>
        <script>alert('noise')</script>
        <style>body { color: red; }</style>
      </body></html>`,
      'text/html'
    )

    cleanDom(doc)

    expect(doc.querySelector('nav')).toBeNull()
    expect(doc.querySelector('footer')).toBeNull()
    expect(doc.querySelector('aside')).toBeNull()
    expect(doc.querySelector('script')).toBeNull()
    expect(doc.querySelector('style')).toBeNull()
    expect(doc.querySelector('h1')?.textContent).toBe('Main Article')
    expect(doc.querySelector('p')?.textContent).toBe('Body paragraph')
  })

  it('removes noise and advertisement elements', () => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(
      `<div>
        <div class="ad-container">Ad banner</div>
        <div class="cookie-banner">Accept cookies</div>
        <div class="social-share">Share this</div>
        <p>Legitimate content</p>
      </div>`,
      'text/html'
    )

    removeNoise(doc)

    expect(doc.querySelector('.ad-container')).toBeNull()
    expect(doc.querySelector('.cookie-banner')).toBeNull()
    expect(doc.querySelector('.social-share')).toBeNull()
    expect(doc.querySelector('p')?.textContent).toBe('Legitimate content')
  })

  it('strips inline event handlers to prevent XSS', () => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(
      `<div><button onclick="badCode()">Click</button></div>`,
      'text/html'
    )

    cleanDom(doc)
    const button = doc.querySelector('button')
    expect(button?.getAttribute('onclick')).toBeNull()
  })
})
