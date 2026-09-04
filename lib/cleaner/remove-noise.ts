/**
 * Noise removal heuristics for ads, cookie banners, social share buttons,
 * newsletter popups, and non-content widgets.
 */

const NOISE_SELECTORS = [
  // Ads & sponsored
  '.advertisement',
  '.ad-container',
  '.ad-wrapper',
  '.ad-banner',
  '[id*="google_ads"]',
  '[class*="google_ads"]',
  '.sponsored-content',
  '.outbrain',
  '.taboola',
  'ins.adsbygoogle',

  // Cookie & consent notices
  '#cookie-notice',
  '#cookie-banner',
  '.cookie-banner',
  '.cookie-consent',
  '.consent-modal',
  '[aria-label*="cookie" i]',
  '[aria-label*="consent" i]',

  // Social share bars & floating toolbars
  '.share-buttons',
  '.social-share',
  '.share-bar',
  '.sharing-container',
  '.post-shares',

  // Newsletters & modals
  '.newsletter-signup',
  '.subscribe-modal',
  '.subscription-form',
  '.popup-overlay',

  // Comments sections (typically not primary article body)
  '#comments',
  '.comments-area',
  '.disqus-thread',

  // Miscellaneous tracking & empty elements
  'noscript',
  '.sr-only',
  '.visually-hidden',
]

/**
 * Removes elements matching common noise patterns.
 */
export function removeNoise(root: Element | Document): void {
  for (const selector of NOISE_SELECTORS) {
    try {
      const elements = root.querySelectorAll(selector)
      elements.forEach((el) => el.remove())
    } catch {
      // Ignore invalid selector in older engines
    }
  }
}
