import type { TokenEstimation } from '../../types/context'

// Regex matching CJK Unified Ideographs, Hiragana, Katakana, and Hangul
const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g

/**
 * Estimates token count with separate heuristic rules for CJK characters and Latin text.
 * - CJK: ~1.2 tokens per character
 * - Latin / numbers / symbols: ~1 token per 4 characters
 */
export function estimateTokens(text: string): TokenEstimation {
  if (!text || text.trim() === '') {
    return {
      charCount: 0,
      wordCount: 0,
      cjkCount: 0,
      latinCount: 0,
      estimatedTokens: 0,
    }
  }

  const charCount = text.length

  // Match CJK characters
  const cjkMatches = text.match(CJK_REGEX)
  const cjkCount = cjkMatches ? cjkMatches.length : 0

  // Non-CJK portion
  const nonCjkText = text.replace(CJK_REGEX, ' ')
  const latinCount = charCount - cjkCount

  // Word count: split non-CJK by whitespace and add CJK characters (each CJK char counts as a word)
  const latinWords = nonCjkText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const wordCount = latinWords + cjkCount

  // Token calculation
  // CJK: ~1.2 tokens per character
  const cjkTokens = cjkCount * 1.2

  // Latin: ~1 token per 4 characters (excluding trailing redundant spaces)
  const latinTokens = latinCount / 4

  const totalTokens = Math.max(1, Math.round(cjkTokens + latinTokens))

  return {
    charCount,
    wordCount,
    cjkCount,
    latinCount,
    estimatedTokens: totalTokens,
  }
}

/**
 * Formats token count with approximation tilde, e.g. "~4,300 tokens"
 */
export function formatTokenEstimate(tokens: number): string {
  return `~${tokens.toLocaleString()}`
}
