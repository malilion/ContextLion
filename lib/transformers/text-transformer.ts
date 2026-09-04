/**
 * Strips markdown formatting to produce clean plain text.
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return ''

  return (
    markdown
      // Remove code blocks markers
      .replace(/```[\s\S]*?```/g, (match) => {
        // Keep code contents without fences
        return match.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '')
      })
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove images: ![alt](url) -> [alt]
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove links: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headers: # Header -> Header
      .replace(/^#{1,6}\s+/gm, '')
      // Remove blockquotes: > quote -> quote
      .replace(/^>\s+/gm, '')
      // Remove bold/italics
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Normalize newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}
