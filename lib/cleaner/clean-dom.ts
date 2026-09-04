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

  // 3. Purge elements hidden via HTML attributes or inline styles
  // (Prevents indirect prompt injection payloads from being uncloaked when styles are stripped)
  const hiddenSelectors = [
    '[hidden]',
    '[aria-hidden="true"]',
    '[style*="display: none" i]',
    '[style*="display:none" i]',
    '[style*="visibility: hidden" i]',
    '[style*="visibility:hidden" i]',
    '[style*="font-size: 0" i]',
    '[style*="font-size:0" i]',
    '[style*="opacity: 0" i]',
    '[style*="opacity:0" i]',
  ]
  for (const selector of hiddenSelectors) {
    try {
      const hiddenEls = root.querySelectorAll(selector)
      hiddenEls.forEach((el) => el.remove())
    } catch {
      // Ignore selector errors
    }
  }

  // 4. Clean inline event handlers and malicious/styling attributes
  const cleanElementAttributes = (el: Element) => {
    const attrs = Array.from(el.attributes)
    for (const attr of attrs) {
      if (attr.name.startsWith('on') || attr.name === 'style') {
        el.removeAttribute(attr.name)
      }
    }
  }

  // If root is an Element, clean root itself
  if ('attributes' in root && (root as Element).attributes) {
    cleanElementAttributes(root as Element)
  }

  const allElements = root.querySelectorAll('*')
  allElements.forEach(cleanElementAttributes)
}
