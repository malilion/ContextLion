import { describe, it, expect } from 'vitest'
import { detectLanguage } from '../../lib/transformers/language-detector'

describe('Language Detector module (V1)', () => {
  it('handles empty input gracefully', () => {
    const res = detectLanguage('')
    expect(res.code).toBe('unknown')
  })

  it('detects English text correctly', () => {
    const text =
      'The modern browser architecture relies on isolated processes and service workers for extensions.'
    const res = detectLanguage(text)
    expect(res.code).toBe('en')
    expect(res.name).toBe('English')
  })

  it('detects Traditional Chinese correctly', () => {
    const text =
      '這是一個關於網頁內容擷取與人工智慧語境處理的技術規範，旨在保留完整的繁體中文字元結構與標籤樣式。'
    const res = detectLanguage(text)
    expect(res.code).toBe('zh-TW')
    expect(res.name).toBe('繁體中文')
  })

  it('detects Simplified Chinese correctly', () => {
    const text =
      '这是一个关于网页内容提取与人工智能语境处理的技术规范，旨在保留完整的简体中文字符结构与标签样式。'
    const res = detectLanguage(text)
    expect(res.code).toBe('zh-CN')
    expect(res.name).toBe('简体中文')
  })

  it('detects Japanese correctly', () => {
    const text =
      'ウェブページからクリーンなMarkdownを抽出するブラウザ拡張機能です。AIコンテキストを生成します。'
    const res = detectLanguage(text)
    expect(res.code).toBe('ja')
    expect(res.name).toBe('Japanese')
  })

  it('detects Korean correctly', () => {
    const text =
      '웹 페이지에서 깔끔한 마크다운을 추출하는 브라우저 확장 프로그램입니다. AI 컨텍스트를 생성합니다.'
    const res = detectLanguage(text)
    expect(res.code).toBe('ko')
    expect(res.name).toBe('Korean')
  })
})
