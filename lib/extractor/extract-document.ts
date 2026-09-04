import { Readability } from '@mozilla/readability'
import DOMPurify from 'dompurify'
import type { RawExtraction } from '../../types/context'
import { extractMetadata } from './extract-metadata'
import { cleanDom } from '../cleaner/clean-dom'

/**
 * Extracts page metadata and main content from the document.
 * CRITICAL RULE: Readability mutates the DOM, so we ALWAYS clone the document
 * using document.cloneNode(true) before passing it to Readability or modifying it.
 */
export function extractDocument(doc: Document, urlFallback?: string): RawExtraction {
  // 1. Extract metadata before mutating clone
  const metadata = extractMetadata(doc, urlFallback)

  // 2. Clone the document to prevent Readability and cleaners from mutating the live page
  const clonedDoc = doc.cloneNode(true) as Document

  // 3. Apply cleaning rules to the clone
  cleanDom(clonedDoc)

  // 4. Run Readability on the cleaned clone
  let contentHtml = ''
  let textContent = ''

  try {
    const reader = new Readability(clonedDoc, {
      charThreshold: 50,
      classesToPreserve: [
        'language-',
        'highlight',
        'code',
        'code-block',
        'table',
        'table-bordered',
      ],
    })
    const article = reader.parse()

    if (article && article.content) {
      contentHtml = article.content
      textContent = article.textContent || ''
      if (!metadata.title || metadata.title === 'Untitled') {
        metadata.title = article.title || metadata.title
      }
      if (!metadata.author && article.byline) {
        metadata.author = article.byline
      }
    }
  } catch (err) {
    console.warn('[ContextLion] Readability parsing failed, falling back to body:', err)
  }

  // 5. Fallback if Readability returned null (e.g. reference docs, dashboards, short pages)
  if (!contentHtml) {
    const mainTarget =
      clonedDoc.querySelector('main') ||
      clonedDoc.querySelector('article') ||
      clonedDoc.querySelector('[role="main"]') ||
      clonedDoc.body

    if (mainTarget) {
      contentHtml = mainTarget.innerHTML
      textContent = mainTarget.textContent || ''
    }
  }

  // 6. Sanitize the HTML output
  const sanitizedHtml = DOMPurify.sanitize(contentHtml, {
    WHOLE_DOCUMENT: false,
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'blockquote',
      'pre',
      'code',
      'em',
      'strong',
      'b',
      'i',
      'u',
      'strike',
      'ul',
      'ol',
      'li',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'a',
      'img',
      'hr',
      'br',
      'span',
      'div',
      'section',
      'article',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'align'],
  })

  return {
    metadata,
    contentHtml: sanitizedHtml,
    textContent: textContent.trim(),
  }
}
