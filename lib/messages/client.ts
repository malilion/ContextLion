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
 * Sends a message to a tab with an enforced timeout.
 */
export async function sendMessageWithTimeout<T>(
  tabId: number,
  message: unknown,
  timeoutMs = 12000
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Extraction timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([
      chrome.tabs.sendMessage(tabId, message) as Promise<T>,
      timeoutPromise,
    ])
  } finally {
    clearTimeout(timer!)
  }
}

/**
 * Ensures extractor script is injected into the target tab.
 * Supports Chrome MV3 (chrome.scripting) and Firefox MV2 (chrome.tabs.executeScript).
 */
async function ensureScriptInjected(tabId: number): Promise<void> {
  try {
    const pingRes = await sendMessageWithTimeout<ExtensionResponse<{ pong: boolean }>>(
      tabId,
      {
        id: `ping_${Date.now()}`,
        type: MESSAGE_TYPES.PING,
        timestamp: Date.now(),
      },
      800
    )
    if (pingRes && pingRes.success) return
  } catch {
    // Need injection
  }

  if (typeof chrome.scripting !== 'undefined' && chrome.scripting.executeScript) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['extractor.js'],
    })
  } else if (
    typeof chrome.tabs !== 'undefined' &&
    typeof (chrome.tabs as { executeScript?: Function }).executeScript === 'function'
  ) {
    await (
      chrome.tabs as unknown as {
        executeScript: (tabId: number, details: { file: string }) => Promise<unknown>
      }
    ).executeScript(tabId, {
      file: 'extractor.js',
    })
  } else {
    throw new Error('Script execution API is unavailable.')
  }

  // Brief pause for script initialization
  await new Promise((resolve) => setTimeout(resolve, 80))
}

/**
 * Requests full page content extraction from a specific tab ID.
 */
export async function requestTabExtraction(
  tabId: number
): Promise<ExtensionResponse<RawExtraction>> {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      throw new Error('Chrome extension APIs are not available.')
    }

    const tab = await chrome.tabs.get(tabId)
    const check = isExtractableUrl(tab.url || '')
    if (!check.ok) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: check.reason || 'This page cannot be captured.',
        },
      }
    }

    await ensureScriptInjected(tabId)

    const message: ExtensionMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: MESSAGE_TYPES.EXTRACT_PAGE,
      timestamp: Date.now(),
    }

    const res = await sendMessageWithTimeout<ExtensionResponse<RawExtraction>>(
      tabId,
      message,
      12000
    )
    if (res) return res

    return {
      success: false,
      error: {
        code: 'NO_RESPONSE',
        message: 'The page extractor did not return any extraction data.',
      },
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

/**
 * Requests full page content extraction from the active tab.
 */
export async function requestPageExtraction(): Promise<ExtensionResponse<RawExtraction>> {
  try {
    const tab = await getActiveTab()
    return await requestTabExtraction(tab.id)
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

/**
 * Requests extraction of current text selection from the active tab.
 */
export async function requestSelectionExtraction(): Promise<
  ExtensionResponse<RawExtraction | null>
> {
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

    await ensureScriptInjected(tab.id)

    const message: ExtensionMessage = {
      id: `sel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: MESSAGE_TYPES.EXTRACT_SELECTION,
      timestamp: Date.now(),
    }

    const res = (await chrome.tabs.sendMessage(
      tab.id,
      message
    )) as ExtensionResponse<RawExtraction | null>
    return res
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: {
        code: 'SELECTION_ERROR',
        message: msg,
      },
    }
  }
}

/**
 * Triggers interactive visual element picker on the active tab.
 */
export async function requestStartElementPicker(): Promise<ExtensionResponse<{ active: boolean }>> {
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

    await ensureScriptInjected(tab.id)

    const message: ExtensionMessage = {
      id: `pick_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: MESSAGE_TYPES.START_ELEMENT_PICKER,
      timestamp: Date.now(),
    }

    const res = (await chrome.tabs.sendMessage(tab.id, message)) as ExtensionResponse<{
      active: boolean
    }>
    return res
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: {
        code: 'PICKER_ERROR',
        message: msg,
      },
    }
  }
}

/**
 * Checks and clears any last element captured by the visual element picker.
 */
export async function checkLastPickedElement(): Promise<RawExtraction | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get('lastPickedElement')
      if (res && res.lastPickedElement) {
        // Clear after reading
        await chrome.storage.local.remove('lastPickedElement')
        return res.lastPickedElement as RawExtraction
      }
    }
  } catch {
    // Ignore error
  }
  return null
}
