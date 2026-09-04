import { describe, it, expect } from 'vitest'
import { buildContextPackMarkdown, createContextPack } from '../../lib/context/context-pack-builder'
import type { ContextPackSource } from '../../types/context-pack'

describe('Context Pack Builder', () => {
  const mockSources: ContextPackSource[] = [
    {
      id: 'src_1',
      tabId: 101,
      title: 'Guide to TypeScript',
      url: 'https://example.com/ts-guide',
      author: 'Jane Doe',
      publishedAt: '2026-01-15',
      markdown: 'TypeScript extends JavaScript by adding types to the language.',
      plainText: 'TypeScript extends JavaScript by adding types to the language.',
      wordCount: 9,
      estimatedTokens: 11,
      status: 'success',
    },
    {
      id: 'src_2',
      tabId: 102,
      title: 'Vue 3 Cheatsheet',
      url: 'https://vuejs.org/cheatsheet',
      markdown: 'Composition API setup script rules.',
      plainText: 'Composition API setup script rules.',
      wordCount: 5,
      estimatedTokens: 6,
      status: 'success',
    },
    {
      id: 'src_3',
      tabId: 103,
      title: 'Restricted Internal Dashboard',
      url: 'chrome://settings',
      markdown: '',
      plainText: '',
      wordCount: 0,
      estimatedTokens: 0,
      status: 'error',
      errorMessage: 'Browser internal page cannot be captured',
    },
  ]

  it('correctly aggregates metrics and counts in createContextPack', () => {
    const pack = createContextPack('Frontend Research', mockSources)

    expect(pack.title).toBe('Frontend Research')
    expect(pack.totalSources).toBe(3)
    expect(pack.successfulSources).toBe(2)
    expect(pack.totalWords).toBe(14)
    expect(pack.totalTokens).toBe(17)
    expect(pack.id).toMatch(/^pack_\d+_[a-z0-9]+$/)
  })

  it('formats standardized markdown with header, sources, and metadata', () => {
    const pack = createContextPack('Frontend Research', mockSources)
    const md = pack.markdown

    expect(md).toContain('# Context Pack: Frontend Research')
    expect(md).toContain('Sources: 2 of 3 captured')
    expect(md).toContain('Total Estimated Tokens:')

    // Source 1
    expect(md).toContain('## Source 1: Guide to TypeScript')
    expect(md).toContain('Source: https://example.com/ts-guide')
    expect(md).toContain('Author: Jane Doe')
    expect(md).toContain('Published: 2026-01-15')
    expect(md).toContain('TypeScript extends JavaScript by adding types to the language.')

    // Source 2
    expect(md).toContain('## Source 2: Vue 3 Cheatsheet')
    expect(md).toContain('Source: https://vuejs.org/cheatsheet')
    expect(md).toContain('Composition API setup script rules.')

    // Source 3 (Error state)
    expect(md).toContain('## Source 3: Restricted Internal Dashboard')
    expect(md).toContain('⚠️ Extraction Failed: Browser internal page cannot be captured')
  })

  it('appends Task instruction when provided', () => {
    const instruction = 'Compare the architectural paradigms of TypeScript and Vue 3.'
    const pack = createContextPack('Frontend Research', mockSources, instruction)

    expect(pack.markdown).toContain('## Task')
    expect(pack.markdown).toContain(instruction)
  })
})
