import { describe, it, expect } from 'vitest'
import { estimateTokens, formatTokenEstimate } from '../../lib/context/token-estimator'

describe('Token Estimator module (Issue #11)', () => {
  it('handles empty text gracefully', () => {
    const stats = estimateTokens('')
    expect(stats.charCount).toBe(0)
    expect(stats.wordCount).toBe(0)
    expect(stats.estimatedTokens).toBe(0)
  })

  it('estimates pure English / Latin text accurately (~4 chars per token)', () => {
    const text = 'The quick brown fox jumps over the lazy dog.' // 44 chars
    const stats = estimateTokens(text)

    expect(stats.cjkCount).toBe(0)
    expect(stats.charCount).toBe(44)
    expect(stats.wordCount).toBe(9)
    // 44 / 4 = 11 tokens
    expect(stats.estimatedTokens).toBe(11)
  })

  it('estimates CJK text accurately (~1.2 tokens per character)', () => {
    // 12 Chinese characters
    const text = '大型語言模型語境分析架構技術驗證'
    const stats = estimateTokens(text)

    expect(stats.cjkCount).toBe(16)
    expect(stats.wordCount).toBe(16)
    // 16 * 1.2 = 19.2 -> 19 tokens
    expect(stats.estimatedTokens).toBe(19)
  })

  it('estimates mixed CJK and English text correctly', () => {
    const text = 'ContextLion 可以將網頁轉成 AI 語境。'
    const stats = estimateTokens(text)

    expect(stats.cjkCount).toBe(9)
    expect(stats.charCount).toBe(26)
    expect(stats.estimatedTokens).toBeGreaterThan(12)
  })

  it('formats token count with tilde indicator for estimate', () => {
    expect(formatTokenEstimate(4300)).toBe('~4,300')
    expect(formatTokenEstimate(120)).toBe('~120')
  })
})
