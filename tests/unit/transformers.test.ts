import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { htmlToMarkdown } from '../../lib/transformers/html-to-markdown'
import { markdownToPlainText } from '../../lib/transformers/text-transformer'

describe('Transformers module', () => {
  const readFixture = (name: string): string => {
    const filePath = path.resolve(__dirname, '../fixtures', name)
    return fs.readFileSync(filePath, 'utf-8')
  }

  it('converts basic headings, paragraphs, and lists into markdown', () => {
    const html = `
      <h2>Heading 2</h2>
      <p>This is a <strong>bold</strong> and <em>italic</em> paragraph with a <a href="https://example.com">link</a>.</p>
      <ul>
        <li>First item</li>
        <li>Second item</li>
      </ul>
    `
    const md = htmlToMarkdown(html)

    expect(md).toContain('## Heading 2')
    expect(md).toContain('**bold**')
    expect(md).toContain('*italic*')
    expect(md).toContain('[link](https://example.com)')
    expect(md).toContain('-   First item')
    expect(md).toContain('-   Second item')
  })

  it('normalizes heading depths by default (shifting h3 to h2)', () => {
    const html = `
      <h3>Section Heading</h3>
      <p>Section body.</p>
      <h4>Sub-section Heading</h4>
      <p>Sub-section body.</p>
    `
    const md = htmlToMarkdown(html)
    expect(md).toContain('## Section Heading')
    expect(md).toContain('### Sub-section Heading')
  })

  it('preserves fenced code blocks and language hints (Issue #9)', () => {
    const html = readFixture('article-with-code.html')
    const md = htmlToMarkdown(html)

    expect(md).toContain('```typescript')
    expect(md).toContain('interface Message<T>')
    expect(md).toContain('export function dispatch')
    expect(md).toContain('```python')
    expect(md).toContain('def calculate_tokens(text: str)')
  })

  it('preserves GFM tables properly (Issue #10)', () => {
    const html = readFixture('article-with-table.html')
    const md = htmlToMarkdown(html)

    expect(md).toContain('| Model | Latency (ms) | Throughput (tps) |')
    expect(md).toContain('| --- | --- | --- |')
    expect(md).toContain('| Flash-Lite | 120 | 150 |')
    expect(md).toContain('| Standard | 250 | 90 |')
    expect(md).toContain('| Pro | 480 | 45 |')
  })

  it('converts markdown to clean plain text', () => {
    const md = `
# Title

This is **bold** and [a link](https://example.com).

\`\`\`typescript
const a = 1;
\`\`\`

> A wisdom quote
    `
    const plain = markdownToPlainText(md)

    expect(plain).toContain('Title')
    expect(plain).toContain('This is bold and a link.')
    expect(plain).toContain('const a = 1;')
    expect(plain).toContain('A wisdom quote')
    expect(plain).not.toContain('```')
    expect(plain).not.toContain('**')
    expect(plain).not.toContain('#')
  })
})
