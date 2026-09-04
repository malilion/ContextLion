export interface DetectedLanguage {
  code: string
  name: string
}

// Unicode script regexes
const HANGUL_REGEX = /[\uac00-\ud7af]/g
const KANA_REGEX = /[\u3040-\u30ff]/g
const CJK_REGEX = /[\u4e00-\u9fff]/g
const CYRILLIC_REGEX = /[\u0400-\u04ff]/g
const ARABIC_REGEX = /[\u0600-\u06ff]/g

// Characteristic Traditional Chinese vs Simplified Chinese marker characters
const TRADITIONAL_MARKERS = /[這與體語點頁繁檔們處麼為後學開關動國實氣經頭總現]/g
const SIMPLIFIED_MARKERS = /[这与体语点页繁档们处么为后学开关动国实气经头总现]/g

// Common Latin stopwords
const EN_WORDS = /\b(the|and|is|in|to|of|that|it|for|on|with|as|this|by|from|at)\b/gi
const FR_WORDS = /\b(le|la|les|un|une|des|et|est|dans|pour|sur|avec|qui|que)\b/gi
const ES_WORDS = /\b(el|la|los|las|un|una|unos|y|en|por|con|para|que|del)\b/gi
const DE_WORDS = /\b(der|die|das|und|ist|in|den|von|zu|mit|sich|des|auf|für)\b/gi

/**
 * Detects the dominant language of a given text string using script distribution
 * and character/stopword heuristics. Zero external dependencies.
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) {
    return { code: 'unknown', name: 'Unknown' }
  }

  const sample = text.slice(0, 3000)

  // 1. Korean
  const hangulMatches = sample.match(HANGUL_REGEX)
  if (hangulMatches && hangulMatches.length > 5) {
    return { code: 'ko', name: 'Korean' }
  }

  // 2. Japanese
  const kanaMatches = sample.match(KANA_REGEX)
  if (kanaMatches && kanaMatches.length > 5) {
    return { code: 'ja', name: 'Japanese' }
  }

  // 3. Chinese (Traditional vs Simplified)
  const cjkMatches = sample.match(CJK_REGEX)
  if (cjkMatches && cjkMatches.length > 10) {
    const tradMatches = (sample.match(TRADITIONAL_MARKERS) || []).length
    const simpMatches = (sample.match(SIMPLIFIED_MARKERS) || []).length

    if (tradMatches >= simpMatches && tradMatches > 0) {
      return { code: 'zh-TW', name: '繁體中文' }
    } else if (simpMatches > tradMatches) {
      return { code: 'zh-CN', name: '简体中文' }
    }
    return { code: 'zh', name: 'Chinese' }
  }

  // 4. Cyrillic / Russian
  const cyrillicMatches = sample.match(CYRILLIC_REGEX)
  if (cyrillicMatches && cyrillicMatches.length > 10) {
    return { code: 'ru', name: 'Russian' }
  }

  // 5. Arabic
  const arabicMatches = sample.match(ARABIC_REGEX)
  if (arabicMatches && arabicMatches.length > 10) {
    return { code: 'ar', name: 'Arabic' }
  }

  // 6. Latin-based languages
  const frCount = (sample.match(FR_WORDS) || []).length
  const esCount = (sample.match(ES_WORDS) || []).length
  const deCount = (sample.match(DE_WORDS) || []).length
  const enCount = (sample.match(EN_WORDS) || []).length

  const counts = [
    { code: 'fr', name: 'French', score: frCount },
    { code: 'es', name: 'Spanish', score: esCount },
    { code: 'de', name: 'German', score: deCount },
    { code: 'en', name: 'English', score: enCount },
  ].sort((a, b) => b.score - a.score)

  const top = counts[0]
  if (top && top.score > 0) {
    return { code: top.code, name: top.name }
  }

  return { code: 'en', name: 'English' }
}
