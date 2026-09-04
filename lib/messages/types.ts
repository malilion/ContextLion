import type { RawExtraction } from '../../types/context'

export type ExtensionMessage<T = unknown> = {
  id: string
  type: string
  payload?: T
  timestamp: number
}

export type ExtensionResponse<T = unknown> =
  { success: true; data: T } | { success: false; error: { code: string; message: string } }

export const MESSAGE_TYPES = {
  EXTRACT_PAGE: 'CONTEXT_LION_EXTRACT_PAGE',
  EXTRACT_SELECTION: 'CONTEXT_LION_EXTRACT_SELECTION',
  START_ELEMENT_PICKER: 'CONTEXT_LION_START_ELEMENT_PICKER',
  PING: 'CONTEXT_LION_PING',
} as const

export type ExtractPageResponse = ExtensionResponse<RawExtraction>
export type ExtractSelectionResponse = ExtensionResponse<RawExtraction | null>
export type StartPickerResponse = ExtensionResponse<{ active: boolean }>
export type PingResponse = ExtensionResponse<{ pong: boolean }>
