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
  PING: 'CONTEXT_LION_PING',
} as const

export type ExtractPageResponse = ExtensionResponse<RawExtraction>
export type PingResponse = ExtensionResponse<{ pong: boolean }>
