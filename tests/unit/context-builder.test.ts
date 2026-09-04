import { describe, it, expect } from 'vitest'
import { buildAiContextMarkdown, buildPageContext } from '../../lib/context/context-builder'
import type { RawExtraction } from '../../types/context'

describe('Context Builder module', () => {
  it('builds AI Context markdown format according to specification (§5)', () => {
    const output = buildAiContextMarkdown({
      title: 'Guide to ContextLion',
      url: 'https://example.com/guide',
      author: 'Malilion Team',
      publishedAt: '2026-09-04',
      capturedAt: 1788534000000,
      markdown: '## Introduction\n\nContent here.',
    })

    expect(output).toContain('# Guide to ContextLion\n')
    expect(output).toContain('Source: https://example.com/guide')
    expect(output).toContain('Author: Malilion Team')
    expect(output).toContain('Published: 2026-09-04')
    expect(output).toContain('Captured: ')
    expect(output).toContain('---')
    expect(output).toContain('## Introduction\n\nContent here.')
  })

  it('builds PageContext with complete word, char, and token metrics', () => {
    const raw: RawExtraction = {
      metadata: {
        title: 'Sample Page',
        url: 'https://example.com',
      },
      contentHtml: '<h1>Sample Page</h1><p>This is a paragraph with several useful words.</p>',
      textContent: 'Sample Page This is a paragraph with several useful words.',
    }

    const context = buildPageContext(raw)

    expect(context.title).toBe('Sample Page')
    expect(context.url).toBe('https://example.com')
    expect(context.markdown).toContain('# Sample Page')
    expect(context.wordCount).toBeGreaterThan(5)
    expect(context.charCount).toBeGreaterThan(15)
    expect(context.estimatedTokens).toBeGreaterThan(0)
    expect(context.id).toMatch(/^ctx_\d+_[a-z0-9]+$/)
  })
})
