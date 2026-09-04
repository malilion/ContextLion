import { describe, it, expect } from 'vitest'
import { normalizeHeadings } from '../../lib/transformers/heading-normalizer'

describe('Heading Normalizer module', () => {
  it('handles text without headings untouched', () => {
    const text = 'Just a normal paragraph without any headings.'
    expect(normalizeHeadings(text)).toBe(text)
  })

  it('shifts headings starting from h3 down to h2', () => {
    const input = `
### Section 1
Paragraph 1

#### Subsection A
Details

##### Sub-subsection 1
Deeper details
    `
    const output = normalizeHeadings(input)

    expect(output).toContain('## Section 1')
    expect(output).toContain('### Subsection A')
    expect(output).toContain('#### Sub-subsection 1')
    expect(output).not.toContain('#####')
  })

  it('shifts body h1 headings to h2 so document title remains the sole h1', () => {
    const input = `
# Main Chapter
Chapter introduction

## Section 1
Section details
    `
    const output = normalizeHeadings(input)

    expect(output).toContain('## Main Chapter')
    expect(output).toContain('### Section 1')
  })

  it('leaves headings starting at h2 unchanged', () => {
    const input = `
## Overview
Some overview

### Architecture
Some architecture
    `
    const output = normalizeHeadings(input)
    expect(output).toBe(input)
  })

  it('never touches hash symbols or comments inside fenced code blocks', () => {
    const input = `
### Practical Code

\`\`\`python
# This is a Python comment that must not become a heading
def hello():
    ### Another comment inside code
    return True
\`\`\`

#### Next Subsection
More content
    `
    const output = normalizeHeadings(input)

    expect(output).toContain('## Practical Code')
    expect(output).toContain('### Next Subsection')
    expect(output).toContain('# This is a Python comment that must not become a heading')
    expect(output).toContain('### Another comment inside code')
  })

  it('never touches hash symbols inside tilde fenced code blocks (~~~)', () => {
    const input = `
### Heading Outside

~~~bash
# Shell comment inside tilde code block
echo "hello"
~~~
    `
    const output = normalizeHeadings(input)
    expect(output).toContain('## Heading Outside')
    expect(output).toContain('# Shell comment inside tilde code block')
  })
})
