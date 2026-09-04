import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

export interface MarkdownTransformOptions {
  includeImages?: boolean
  includeLinks?: boolean
}

/**
 * Creates and configures a TurndownService instance with GFM tables and custom code block rules.
 */
export function createTurndownService(options: MarkdownTransformOptions = {}): TurndownService {
  const service = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
  })

  // Enable GFM (tables, task lists, strikethrough)
  service.use(gfm)

  // Custom rule for fenced code blocks with language support
  service.addRule('fencedCodeBlock', {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        node.firstElementChild !== null &&
        node.firstElementChild.nodeName === 'CODE'
      )
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement
      const codeEl = el.firstElementChild as HTMLElement
      const className = codeEl?.getAttribute('class') || el.getAttribute('class') || ''
      const langMatch = className.match(/(?:language-|lang-)(\S+)/)
      const lang = langMatch ? langMatch[1] : ''
      const codeText = codeEl?.textContent || ''

      return `\n\n\`\`\`${lang}\n${codeText.replace(/\n+$/, '')}\n\`\`\`\n\n`
    },
  })

  // Standalone pre tag (no inner code tag)
  service.addRule('standalonePre', {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        (node.firstElementChild === null || node.firstElementChild.nodeName !== 'CODE')
      )
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement
      const codeText = el.textContent || ''
      return `\n\n\`\`\`\n${codeText.replace(/\n+$/, '')}\n\`\`\`\n\n`
    },
  })

  // Optional: Exclude images if configured
  if (options.includeImages === false) {
    service.addRule('stripImages', {
      filter: 'img',
      replacement: (content, node) => {
        const alt = (node as HTMLElement).getAttribute('alt') || ''
        return alt ? `[Image: ${alt}]` : ''
      },
    })
  }

  // Optional: Exclude links if configured
  if (options.includeLinks === false) {
    service.addRule('stripLinks', {
      filter: 'a',
      replacement: (content) => content,
    })
  }

  return service
}

/**
 * Normalizes markdown whitespace, removes excess blank lines, and trims ends.
 */
export function normalizeMarkdown(markdown: string): string {
  return (
    markdown
      .replace(/\r\n/g, '\n')
      // Remove trailing spaces on lines
      .replace(/[ \t]+$/gm, '')
      // Collapse 3 or more consecutive newlines into 2
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

/**
 * Converts sanitized HTML to clean, standardized Markdown.
 */
export function htmlToMarkdown(html: string, options: MarkdownTransformOptions = {}): string {
  if (!html || !html.trim()) {
    return ''
  }

  // Handle full document HTML strings by extracting body contents
  let content = html.trim()
  if (
    typeof DOMParser !== 'undefined' &&
    (content.includes('<!DOCTYPE') || content.includes('<html') || content.includes('<body'))
  ) {
    try {
      const parser = new DOMParser()
      const parsedDoc = parser.parseFromString(content, 'text/html')
      if (parsedDoc.body) {
        content = parsedDoc.body.innerHTML
      }
    } catch {
      // Keep original content if DOMParser fails
    }
  }

  const service = createTurndownService(options)
  const rawMarkdown = service.turndown(content)
  return normalizeMarkdown(rawMarkdown)
}
