export interface PromptPreset {
  id: string
  label: string
  description: string
  instruction: string
}

export const BUILTIN_PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'none',
    label: 'Standard Context',
    description: 'Direct AI Context without task framing',
    instruction: '',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Concise bulleted summary and takeaways',
    instruction:
      'Summarize the key points, core arguments, and takeaways from this content in a concise, bulleted format.',
  },
  {
    id: 'explain',
    label: 'Explain',
    description: 'Clear, simple explanation for a technical audience',
    instruction:
      'Explain the concepts, logic, and significance of this content clearly and simply for a technical audience.',
  },
  {
    id: 'technical-analysis',
    label: 'Technical Analysis',
    description: 'Architecture, trade-offs, and implementation details',
    instruction:
      'Provide a rigorous technical analysis of the architecture, trade-offs, bottlenecks, and implementation details.',
  },
  {
    id: 'create-notes',
    label: 'Create Notes',
    description: 'Structured personal notes with action items',
    instruction:
      'Synthesize this content into structured personal reference notes with key concepts, notable quotes, and practical action items.',
  },
  {
    id: 'social-post',
    label: 'Generate Social Post',
    description: 'Engaging Twitter thread or LinkedIn summary',
    instruction:
      'Draft an engaging social media post / Twitter thread summarizing the most compelling insights from this content.',
  },
  {
    id: 'create-readme',
    label: 'Create README',
    description: 'Structured GitHub README markdown documentation',
    instruction:
      'Convert this technical document or specification into a clean, well-structured GitHub README file with sections and code snippets.',
  },
  {
    id: 'code-review',
    label: 'Code Review Context',
    description: 'Evaluate code for performance and security',
    instruction:
      'Review the code and architecture within this context for performance, security vulnerabilities, edge cases, and design patterns.',
  },
  {
    id: 'research',
    label: 'Research Context',
    description: 'Extract methodologies, citations, and questions',
    instruction:
      'Extract the core methodologies, findings, cited concepts, and open questions for further academic or technical research.',
  },
]

/**
 * Combines an AI context document with task framing instructions.
 */
export function formatPromptContext(aiContext: string, instruction?: string): string {
  if (!instruction || !instruction.trim()) {
    return aiContext
  }

  return `# Task\n${instruction.trim()}\n\n---\n\n${aiContext}`
}
