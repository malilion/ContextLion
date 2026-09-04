import { MESSAGE_TYPES, type ExtensionMessage, type ExtensionResponse } from './types'
import type { RawExtraction } from '../../types/context'

const RESTRICTED_SCHEMES = [
  'chrome:',
  'chrome-extension:',
  'edge:',
  'about:',
  'devtools:',
  'view-source:',
  'chrome-untrusted:',
]

export interface ActiveTabInfo {
  id: number
  url: string
  title: string
}

/**
 * Gets information about the currently active tab.
 */
export async function getActiveTab(): Promise<ActiveTabInfo> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    throw new Error('Chrome extension APIs are not available.')
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab || tab.id === undefined) {
    throw new Error('No active browser tab found.')
  }

  return {
    id: tab.id,
    url: tab.url || '',
    title: tab.title || '',
  }
}

/**
 * Validates if the tab URL can be injected and extracted.
 */
export function isExtractableUrl(url: string): { ok: boolean; reason?: string } {
  if (!url) {
    return { ok: false, reason: 'Tab has no valid URL.' }
  }

  for (const scheme of RESTRICTED_SCHEMES) {
    if (url.startsWith(scheme)) {
      return {
        ok: false,
        reason: 'Browser internal and system pages cannot be extracted.',
      }
    }
  }

  if (url.includes('chromewebstore.google.com') || url.includes('chrome.google.com/webstore')) {
    return {
      ok: false,
      reason: 'Chrome Web Store prohibits extension script injection.',
    }
  }

  return { ok: true }
}

/**
 * Requests page content extraction from the active tab.
 * Injects content script via chrome.scripting if it is not already running.
 */
export async function requestPageExtraction(): Promise<ExtensionResponse<RawExtraction>> {
  try {
    const tab = await getActiveTab()
    const check = isExtractableUrl(tab.url)
    if (!check.ok) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: check.reason || 'This page cannot be captured.',
        },
      }
    }

    const message: ExtensionMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: MESSAGE_TYPES.EXTRACT_PAGE,
      timestamp: Date.now(),
    }

    // Try sending message to existing content script
    try {
      const res = (await chrome.tabs.sendMessage(
        tab.id,
        message
      )) as ExtensionResponse<RawExtraction>
      if (res) return res
    } catch {
      // Content script may not be injected yet, proceed to injection
    }

    // Inject the extractor script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['extractor.js'],
      })
    } catch (injectErr: unknown) {
      const injectMsg = injectErr instanceof Error ? injectErr.message : String(injectErr)
      return {
        success: false,
        error: {
          code: 'INJECTION_FAILED',
          message: `Could not inject extractor script: ${injectMsg}`,
        },
      }
    }

    // Give content script a brief moment to initialize
    await new Promise((resolve) => setTimeout(resolve, 80))

    // Retry sending message
    try {
      const res = (await chrome.tabs.sendMessage(
        tab.id,
        message
      )) as ExtensionResponse<RawExtraction>
      if (res) return res
      return {
        success: false,
        error: {
          code: 'NO_RESPONSE',
          message: 'The page content script did not return any extraction data.',
        },
      }
    } catch (msgErr: unknown) {
      const errText = msgErr instanceof Error ? msgErr.message : String(msgErr)
      return {
        success: false,
        error: {
          code: 'COMMUNICATION_ERROR',
          message: `Failed to communicate with page: ${errText}`,
        },
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: msg,
      },
    }
  }
}
