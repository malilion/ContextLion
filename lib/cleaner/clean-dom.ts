import { removeNoise } from './remove-noise'

const STRUCTURAL_NOISE_TAGS = [
  'script',
  'style',
  'noscript',
  'iframe',
  'object',
  'embed',
  'applet',
  'nav',
  'footer',
  'aside',
]

/**
 * Cleans a cloned DOM element or document by stripping non-content structural elements,
 * noise widgets, ads, and interactive scripts.
 */
export function cleanDom(root: Element | Document): void {
  // 1. Remove non-content structural tags
  for (const tag of STRUCTURAL_NOISE_TAGS) {
    const elements = root.querySelectorAll(tag)
    elements.forEach((el) => el.remove())
  }

  // 2. Remove noise and banner elements
  removeNoise(root)

  // 3. Clean inline event handlers and malicious attributes
  const allElements = root.querySelectorAll('*')
  allElements.forEach((el) => {
    // Remove inline event handlers
    const attrs = Array.from(el.attributes)
    for (const attr of attrs) {
      if (attr.name.startsWith('on') || attr.name === 'style') {
        el.removeAttribute(attr.name)
      }
    }
  })
}
