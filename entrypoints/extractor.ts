import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script'
import { extractDocument } from '../lib/extractor/extract-document'
import { MESSAGE_TYPES, type ExtensionMessage, type ExtensionResponse } from '../lib/messages/types'
import type { RawExtraction } from '../types/context'

export default defineUnlistedScript(() => {
  console.log('[ContextLion] Extractor script initialized.')

  // Synchronously register listener for extraction requests
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: ExtensionResponse<RawExtraction | { pong: boolean }>) => void
    ): boolean => {
      if (message && message.type === MESSAGE_TYPES.EXTRACT_PAGE) {
        try {
          const rawExtraction = extractDocument(document, window.location.href)
          const response: ExtensionResponse<RawExtraction> = {
            success: true,
            data: rawExtraction,
          }
          sendResponse(response)
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          const response: ExtensionResponse<RawExtraction> = {
            success: false,
            error: {
              code: 'EXTRACTION_FAILED',
              message: errorMessage || 'Failed to extract document contents',
            },
          }
          sendResponse(response)
        }
        return true
      }

      if (message && message.type === MESSAGE_TYPES.PING) {
        sendResponse({ success: true, data: { pong: true } })
        return true
      }

      return false
    }
  )
})
