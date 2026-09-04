export interface PageMetadata {
  title: string
  url: string
  author?: string
  publishedAt?: string
  description?: string
}

export interface RawExtraction {
  metadata: PageMetadata
  contentHtml: string
  textContent: string
}

export interface PageContext {
  id: string
  title: string
  url: string
  author?: string
  publishedAt?: string
  description?: string
  markdown: string
  plainText: string
  wordCount: number
  charCount: number
  estimatedTokens: number
  capturedAt: number
}

export interface TokenEstimation {
  charCount: number
  wordCount: number
  cjkCount: number
  latinCount: number
  estimatedTokens: number
}
