/**
 * Normalizes Markdown heading depths so the document structure is consistent and clean.
 * - Leaves text inside fenced code blocks (``` ... ```) completely untouched.
 * - Re-bases the highest-level heading in the body to Level 2 (##), since Level 1 (#)
 *   is reserved for the document title.
 * - Shifts all deeper headings proportionately.
 */
export function normalizeHeadings(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return markdown
  }

  const lines = markdown.split('\n')
  let inCodeBlock = false

  // Step 1: Find all valid heading levels outside code blocks
  const headingLevels: number[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) continue

    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match && match[1]) {
      headingLevels.push(match[1].length)
    }
  }

  // If no headings found, nothing to normalize
  if (headingLevels.length === 0) {
    return markdown
  }

  const minLevel = Math.min(...headingLevels)

  // Target base level for top body headings is 2 (##)
  const targetBaseLevel = 2
  const shift = targetBaseLevel - minLevel

  // If already starting at level 2, no shift required
  if (shift === 0) {
    return markdown
  }

  // Step 2: Apply heading shift line by line
  inCodeBlock = false
  const normalizedLines = lines.map((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      return line
    }

    if (inCodeBlock) return line

    const match = line.match(/^(#{1,6})(\s+.+)$/)
    if (match && match[1] && match[2]) {
      const currentLevel = match[1].length
      const newLevel = Math.min(6, Math.max(1, currentLevel + shift))
      return `${'#'.repeat(newLevel)}${match[2]}`
    }

    return line
  })

  return normalizedLines.join('\n')
}
