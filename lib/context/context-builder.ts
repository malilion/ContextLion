import type { PageContext, RawExtraction } from '../../types/context'
import { htmlToMarkdown, type MarkdownTransformOptions } from '../transformers/html-to-markdown'
import { markdownToPlainText } from '../transformers/text-transformer'
import { estimateTokens } from './token-estimator'

/**
 * Builds the standardized AI Context format with metadata header.
 */
export function buildAiContextMarkdown(page: {
  title: string
  url: string
  author?: string
  publishedAt?: string
  capturedAt: number
  markdown: string
}): string {
  const lines: string[] = []

  // Title
  lines.push(`# ${page.title || 'Untitled'}`)
  lines.push('')

  // Metadata
  if (page.url) {
    lines.push(`Source: ${page.url}`)
  }
  if (page.author) {
    lines.push(`Author: ${page.author}`)
  }
  if (page.publishedAt) {
    lines.push(`Published: ${page.publishedAt}`)
  }

  const capturedDateStr =
    new Date(page.capturedAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  lines.push(`Captured: ${capturedDateStr}`)

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push(page.markdown)

  return lines.join('\n')
}

/**
 * Constructs a full PageContext from raw extraction data.
 */
export function buildPageContext(
  raw: RawExtraction,
  options?: MarkdownTransformOptions
): PageContext {
  const capturedAt = Date.now()
  const markdown = htmlToMarkdown(raw.contentHtml, options)
  const plainText = markdownToPlainText(markdown) || raw.textContent

  const stats = estimateTokens(markdown)

  const id = `ctx_${capturedAt}_${Math.random().toString(36).substring(2, 9)}`

  return {
    id,
    title: raw.metadata.title,
    url: raw.metadata.url,
    author: raw.metadata.author,
    publishedAt: raw.metadata.publishedAt,
    description: raw.metadata.description,
    markdown,
    plainText,
    wordCount: stats.wordCount,
    charCount: stats.charCount,
    estimatedTokens: stats.estimatedTokens,
    capturedAt,
  }
}
