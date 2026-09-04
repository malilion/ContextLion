import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script'
import { extractDocument } from '../lib/extractor/extract-document'
import { extractSelection } from '../lib/extractor/extract-selection'
import { startElementPicker } from '../lib/extractor/element-picker'
import { MESSAGE_TYPES, type ExtensionMessage, type ExtensionResponse } from '../lib/messages/types'
import type { RawExtraction } from '../types/context'

export default defineUnlistedScript(() => {
  console.log('[ContextLion] Extractor script initialized.')

  // Synchronously register listener for extraction requests
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (
        response: ExtensionResponse<RawExtraction | { pong: boolean } | { active: boolean } | null>
      ) => void
    ): boolean => {
      // Security defense-in-depth: Verify sender is our own extension
      if (sender.id && sender.id !== chrome.runtime.id) {
        return false
      }

      // 1. Full Page Extraction
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

      // 2. Selection Extraction
      if (message && message.type === MESSAGE_TYPES.EXTRACT_SELECTION) {
        try {
          const selectionExtraction = extractSelection(document, window)
          sendResponse({
            success: true,
            data: selectionExtraction,
          })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          sendResponse({
            success: false,
            error: {
              code: 'SELECTION_EXTRACTION_FAILED',
              message: errorMessage || 'Failed to extract current selection',
            },
          })
        }
        return true
      }

      // 3. Start Visual Element Picker
      if (message && message.type === MESSAGE_TYPES.START_ELEMENT_PICKER) {
        try {
          const started = startElementPicker()
          sendResponse({
            success: true,
            data: { active: started },
          })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          sendResponse({
            success: false,
            error: {
              code: 'PICKER_START_FAILED',
              message: errorMessage || 'Failed to start element picker',
            },
          })
        }
        return true
      }

      // 4. Ping
      if (message && message.type === MESSAGE_TYPES.PING) {
        sendResponse({ success: true, data: { pong: true } })
        return true
      }

      return false
    }
  )
})
