import type {
  TabItem,
  TabDomainGroup,
  ContextPackSource,
  ContextPack,
  BatchProgress,
} from '../../types/context-pack'
import { isExtractableUrl, requestTabExtraction } from '../messages/client'
import { normalizeUrl } from './normalize-url'
import { buildPageContext } from './context-builder'
import { createContextPack } from './context-pack-builder'
import type { MarkdownTransformOptions } from '../transformers/html-to-markdown'

/**
 * Extracts a clean domain name from a URL for grouping.
 */
export function extractDomain(url: string): string {
  if (!url) return 'other'
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./i, '') || parsed.protocol
  } catch {
    return 'other'
  }
}

/**
 * Queries all tabs in the current browser window and groups them by domain.
 */
export async function getExtractableTabs(): Promise<TabDomainGroup[]> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return []
  }

  const tabs = await chrome.tabs.query({ currentWindow: true })
  const domainMap = new Map<string, TabItem[]>()

  for (const tab of tabs) {
    if (tab.id === undefined) continue

    const url = tab.url || ''
    const domain = extractDomain(url)
    const check = isExtractableUrl(url)
    const normalized = normalizeUrl(url)

    const tabItem: TabItem = {
      id: tab.id,
      title: tab.title || 'Untitled',
      url,
      normalizedUrl: normalized,
      domain,
      favIconUrl: tab.favIconUrl,
      isExtractable: check.ok,
      isSelected: false,
    }

    const existing = domainMap.get(domain) || []
    existing.push(tabItem)
    domainMap.set(domain, existing)
  }

  // Convert map to sorted list of groups
  const groups: TabDomainGroup[] = []
  for (const [domain, items] of domainMap.entries()) {
    groups.push({ domain, items })
  }

  // Sort groups alphabetically by domain
  groups.sort((a, b) => a.domain.localeCompare(b.domain))

  return groups
}

/**
 * Extracts content from a single tab and transforms it into a ContextPackSource.
 * Fault-tolerant: returns an error status source instead of throwing.
 */
export async function extractSingleTabSource(
  tab: TabItem,
  transformOptions?: MarkdownTransformOptions
): Promise<ContextPackSource> {
  const sourceId = `src_${tab.id}_${Math.random().toString(36).substring(2, 7)}`

  if (!tab.isExtractable) {
    return {
      id: sourceId,
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
      markdown: '',
      plainText: '',
      wordCount: 0,
      estimatedTokens: 0,
      status: 'error',
      errorMessage: 'This page URL cannot be captured.',
    }
  }

  try {
    const res = await requestTabExtraction(tab.id)

    if (!res.success) {
      return {
        id: sourceId,
        tabId: tab.id,
        title: tab.title,
        url: tab.url,
        markdown: '',
        plainText: '',
        wordCount: 0,
        estimatedTokens: 0,
        status: 'error',
        errorMessage: res.error.message || 'Failed to extract tab content',
      }
    }

    const pageCtx = buildPageContext(res.data, transformOptions)

    return {
      id: sourceId,
      tabId: tab.id,
      title: pageCtx.title || tab.title,
      url: pageCtx.url || tab.url,
      author: pageCtx.author,
      publishedAt: pageCtx.publishedAt,
      markdown: pageCtx.markdown,
      plainText: pageCtx.plainText,
      wordCount: pageCtx.wordCount,
      estimatedTokens: pageCtx.estimatedTokens,
      status: 'success',
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      id: sourceId,
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
      markdown: '',
      plainText: '',
      wordCount: 0,
      estimatedTokens: 0,
      status: 'error',
      errorMessage: message,
    }
  }
}

export interface BatchExtractionOptions {
  packTitle?: string
  taskInstruction?: string
  transformOptions?: MarkdownTransformOptions
}

/**
 * Sequentially extracts a batch of tabs with live progress reporting.
 * Tab failures are captured as error sources without terminating the entire batch.
 */
export async function extractTabBatch(
  tabs: TabItem[],
  options?: BatchExtractionOptions,
  onProgress?: (progress: BatchProgress) => void
): Promise<ContextPack> {
  const sources: ContextPackSource[] = []
  const total = tabs.length

  if (total === 0) {
    return createContextPack(
      options?.packTitle || 'Empty Context Pack',
      [],
      options?.taskInstruction
    )
  }

  onProgress?.({
    total,
    current: 0,
    currentTitle: tabs[0]?.title || 'Starting batch...',
    status: 'extracting',
  })

  for (let i = 0; i < total; i++) {
    const tab = tabs[i]
    if (!tab) continue

    onProgress?.({
      total,
      current: i + 1,
      currentTitle: tab.title,
      status: 'extracting',
    })

    const source = await extractSingleTabSource(tab, options?.transformOptions)
    sources.push(source)

    // Slight microtask yield to keep browser responsive
    await new Promise((resolve) => setTimeout(resolve, 30))
  }

  const title =
    options?.packTitle ||
    `Context Pack (${sources.filter((s) => s.status === 'success').length} sources)`
  const pack = createContextPack(title, sources, options?.taskInstruction)

  onProgress?.({
    total,
    current: total,
    currentTitle: 'Done',
    status: 'completed',
  })

  return pack
}
