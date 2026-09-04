import { describe, it, expect } from 'vitest'
import { BUILTIN_PROMPT_PRESETS, formatPromptContext } from '../../lib/context/prompt-presets'

describe('Prompt Presets module (V1)', () => {
  it('contains all required preset tasks from specification (§3.2)', () => {
    const ids = BUILTIN_PROMPT_PRESETS.map((p) => p.id)

    expect(ids).toContain('none')
    expect(ids).toContain('summarize')
    expect(ids).toContain('explain')
    expect(ids).toContain('technical-analysis')
    expect(ids).toContain('create-notes')
    expect(ids).toContain('social-post')
    expect(ids).toContain('create-readme')
    expect(ids).toContain('code-review')
    expect(ids).toContain('research')
  })

  it('returns original AI context untouched when no instruction is provided', () => {
    const rawContext = '# Sample Title\n\nSource: https://example.com\n\n---'
    const formatted = formatPromptContext(rawContext, '')
    expect(formatted).toBe(rawContext)
  })

  it('prepends instruction block to AI context when instruction is specified', () => {
    const rawContext = '# Sample Title\n\nSource: https://example.com\n\n---\n\nBody content'
    const instruction = 'Summarize key arguments in 3 bullets.'
    const formatted = formatPromptContext(rawContext, instruction)

    expect(formatted).toBe(
      `# Task\nSummarize key arguments in 3 bullets.\n\n---\n\n# Sample Title\n\nSource: https://example.com\n\n---\n\nBody content`
    )
  })
})
