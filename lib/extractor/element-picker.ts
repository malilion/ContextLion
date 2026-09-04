import DOMPurify from 'dompurify'
import type { RawExtraction } from '../../types/context'
import { extractMetadata } from './extract-metadata'
import { cleanDom } from '../cleaner/clean-dom'

const OVERLAY_ID = '__context_lion_picker_overlay'
const BANNER_ID = '__context_lion_picker_banner'

let isPickerActive = false

/**
 * Starts interactive visual element picker on the current webpage.
 */
export function startElementPicker(onPicked?: (extraction: RawExtraction) => void): boolean {
  if (isPickerActive) return false
  isPickerActive = true

  // 1. Create Highlight Box
  let overlay = document.getElementById(OVERLAY_ID)
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = OVERLAY_ID
    overlay.setAttribute(
      'style',
      `
      position: fixed;
      pointer-events: none;
      border: 2px solid #f59e0b;
      background-color: rgba(245, 158, 11, 0.16);
      border-radius: 6px;
      z-index: 2147483646;
      transition: all 0.06s ease;
      display: none;
    `
    )
    document.body.appendChild(overlay)
  }

  // 2. Create Floating Banner
  let banner = document.getElementById(BANNER_ID)
  if (!banner) {
    banner = document.createElement('div')
    banner.id = BANNER_ID
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">🦁</span>
        <span><strong>ContextLion</strong>: Click any element to extract</span>
        <span style="opacity: 0.7; font-size: 11px; margin-left: 4px;">(ESC to cancel)</span>
      </div>
    `
    banner.setAttribute(
      'style',
      `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid #f59e0b;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.3);
      padding: 8px 18px;
      border-radius: 9999px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      z-index: 2147483647;
      cursor: default;
      user-select: none;
    `
    )
    document.body.appendChild(banner)
  }

  let currentTarget: HTMLElement | null = null

  function updateOverlay(el: HTMLElement) {
    if (!overlay) return
    const rect = el.getBoundingClientRect()
    overlay.style.display = 'block'
    overlay.style.top = `${rect.top}px`
    overlay.style.left = `${rect.left}px`
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`
  }

  function handleMouseMove(e: MouseEvent) {
    const target = e.target as HTMLElement | null
    if (!target || target === overlay || target === banner || banner?.contains(target)) {
      return
    }
    currentTarget = target
    updateOverlay(target)
  }

  function handleScroll() {
    if (currentTarget) {
      updateOverlay(currentTarget)
    }
  }

  function cleanup() {
    isPickerActive = false
    window.removeEventListener('mousemove', handleMouseMove, true)
    window.removeEventListener('click', handleClick, true)
    window.removeEventListener('keydown', handleKeyDown, true)
    window.removeEventListener('scroll', handleScroll, true)
    overlay?.remove()
    banner?.remove()
  }

  function showCapturedToast(title: string) {
    const toast = document.createElement('div')
    toast.setAttribute(
      'style',
      `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #064e3b;
      color: #a7f3d0;
      border: 1px solid #059669;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      padding: 10px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      z-index: 2147483647;
      transition: opacity 0.3s ease;
    `
    )

    const wrapper = document.createElement('div')
    wrapper.style.display = 'flex'
    wrapper.style.alignItems = 'center'
    wrapper.style.gap = '8px'

    const checkIcon = document.createElement('span')
    checkIcon.style.color = '#34d399'
    checkIcon.style.fontWeight = 'bold'
    checkIcon.textContent = '✓'

    const textSpan = document.createElement('span')
    textSpan.textContent = `Element captured! (${title.slice(0, 30)})`

    wrapper.appendChild(checkIcon)
    wrapper.appendChild(textSpan)
    toast.appendChild(wrapper)

    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 2500)
  }

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null
    if (target === banner || banner?.contains(target)) {
      return
    }
    if (!currentTarget) return
    e.preventDefault()
    e.stopPropagation()

    // Clone element and strip picker UI if present
    const clonedEl = currentTarget.cloneNode(true) as HTMLElement
    clonedEl.querySelector(`#${OVERLAY_ID}`)?.remove()
    clonedEl.querySelector(`#${BANNER_ID}`)?.remove()
    cleanDom(clonedEl)

    const rawHtml = clonedEl.innerHTML.trim()
    const rawText = clonedEl.textContent?.trim() || ''

    const baseMetadata = extractMetadata(document, window.location.href)
    const tagName = currentTarget.tagName.toLowerCase()
    const metadata = {
      ...baseMetadata,
      title: `${baseMetadata.title} (<${tagName}> Element)`,
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

    const rawExtraction: RawExtraction = {
      metadata,
      contentHtml: sanitizedHtml || `<p>${rawText}</p>`,
      textContent: rawText,
    }

    // Save to local storage for popup retrieval
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ lastPickedElement: rawExtraction })
    }

    showCapturedToast(metadata.title)
    if (onPicked) onPicked(rawExtraction)
    cleanup()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cleanup()
    }
  }

  window.addEventListener('mousemove', handleMouseMove, true)
  window.addEventListener('click', handleClick, true)
  window.addEventListener('keydown', handleKeyDown, true)
  window.addEventListener('scroll', handleScroll, true)

  return true
}
