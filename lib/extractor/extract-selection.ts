import DOMPurify from 'dompurify'
import type { RawExtraction } from '../../types/context'
import { extractMetadata } from './extract-metadata'
import { cleanDom } from '../cleaner/clean-dom'

/**
 * Escapes HTML-significant characters so untrusted text cannot break out
 * of its element context if the resulting HTML is ever rendered.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Extracts currently highlighted/selected content from the active document.
 * Returns null if there is no active selection.
 */
export function extractSelection(doc: Document, win: Window): RawExtraction | null {
  const selection = win.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null
  }

  const range = selection.getRangeAt(0)
  const clonedFragment = range.cloneContents()

  // Container to hold cloned fragment
  const container = doc.createElement('div')
  container.appendChild(clonedFragment)

  // Strip scripts, styles, and noise
  cleanDom(container)

  const rawHtml = container.innerHTML.trim()
  const rawText = container.textContent?.trim() || ''

  if (!rawHtml && !rawText) {
    return null
  }

  const baseMetadata = extractMetadata(doc, win.location.href)
  const metadata = {
    ...baseMetadata,
    title: `${baseMetadata.title} (Selection)`,
  }

  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
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
    contentHtml: sanitizedHtml || `<p>${escapeHtml(rawText)}</p>`,
    textContent: rawText,
  }
}
