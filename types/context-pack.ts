export interface TabItem {
  id: number
  title: string
  url: string
  normalizedUrl: string
  domain: string
  favIconUrl?: string
  isExtractable: boolean
  isSelected: boolean
}

export interface TabDomainGroup {
  domain: string
  items: TabItem[]
}

export interface ContextPackSource {
  id: string
  tabId: number
  title: string
  url: string
  author?: string
  publishedAt?: string
  markdown: string
  plainText: string
  wordCount: number
  estimatedTokens: number
  status: 'success' | 'error'
  errorMessage?: string
}

export interface ContextPack {
  id: string
  title: string
  totalSources: number
  successfulSources: number
  totalWords: number
  totalTokens: number
  sources: ContextPackSource[]
  capturedAt: number
  markdown: string
}

export interface BatchProgress {
  total: number
  current: number
  currentTitle: string
  status: 'idle' | 'extracting' | 'completed' | 'error'
}
