import type { ContextPack, ContextPackSource } from '../../types/context-pack'
import { formatTokenEstimate } from './token-estimator'

/**
 * Builds the consolidated Markdown document for a Context Pack.
 * Conforms to ContextLion v1.2 §3.3 specification.
 */
export function buildContextPackMarkdown(
  pack: Omit<ContextPack, 'markdown'>,
  taskInstruction?: string
): string {
  const lines: string[] = []

  // Pack Header
  lines.push(`# Context Pack: ${pack.title || 'Multi-Tab Bundle'}`)
  lines.push('')

  const capturedDateStr =
    new Date(pack.capturedAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'

  lines.push(`Sources: ${pack.successfulSources} of ${pack.totalSources} captured`)
  lines.push(`Captured: ${capturedDateStr}`)
  lines.push(`Total Estimated Tokens: ~${formatTokenEstimate(pack.totalTokens)}`)
  lines.push('')

  // Sources
  let sourceIndex = 1
  for (const src of pack.sources) {
    lines.push('---')
    lines.push('')
    lines.push(`## Source ${sourceIndex}: ${src.title || 'Untitled Source'}`)

    if (src.url) {
      lines.push(`Source: ${src.url}`)
    }
    if (src.author) {
      lines.push(`Author: ${src.author}`)
    }
    if (src.publishedAt) {
      lines.push(`Published: ${src.publishedAt}`)
    }

    lines.push('')

    if (src.status === 'error') {
      lines.push(`> ⚠️ Extraction Failed: ${src.errorMessage || 'Unable to read content'}`)
    } else {
      lines.push(src.markdown.trim() || '*[Empty content]*')
    }

    lines.push('')
    sourceIndex++
  }

  // Task directive if provided
  if (taskInstruction && taskInstruction.trim()) {
    lines.push('---')
    lines.push('')
    lines.push('## Task')
    lines.push(taskInstruction.trim())
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Factory to construct a full ContextPack object from an array of sources.
 */
export function createContextPack(
  title: string,
  sources: ContextPackSource[],
  taskInstruction?: string
): ContextPack {
  const capturedAt = Date.now()
  const successfulSources = sources.filter((s) => s.status === 'success')

  const totalWords = successfulSources.reduce((acc, s) => acc + s.wordCount, 0)
  const totalTokens = successfulSources.reduce((acc, s) => acc + s.estimatedTokens, 0)

  const partialPack: Omit<ContextPack, 'markdown'> = {
    id: `pack_${capturedAt}_${Math.random().toString(36).substring(2, 9)}`,
    title: title || `Context Pack (${successfulSources.length} sources)`,
    totalSources: sources.length,
    successfulSources: successfulSources.length,
    totalWords,
    totalTokens,
    sources,
    capturedAt,
  }

  const markdown = buildContextPackMarkdown(partialPack, taskInstruction)

  return {
    ...partialPack,
    markdown,
  }
}
