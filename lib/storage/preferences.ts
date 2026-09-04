import type { PromptPreset } from '../context/prompt-presets'

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  defaultCopyFormat: 'ai-context' | 'markdown' | 'plain-text'
  includeImages: boolean
  includeLinks: boolean
  normalizeHeadings: boolean
  defaultPromptPreset: string
  customPrompts: PromptPreset[]
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  defaultCopyFormat: 'ai-context',
  includeImages: true,
  includeLinks: true,
  normalizeHeadings: true,
  defaultPromptPreset: 'none',
  customPrompts: [],
}

const PREFS_KEY = 'context_lion_preferences'

export async function getPreferences(): Promise<UserPreferences> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      const res = await chrome.storage.sync.get(PREFS_KEY)
      return { ...DEFAULT_PREFERENCES, ...(res[PREFS_KEY] || {}) }
    }
  } catch (err) {
    console.warn('[ContextLion] Failed to read sync storage preferences:', err)
  }
  return DEFAULT_PREFERENCES
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      const current = await getPreferences()
      await chrome.storage.sync.set({
        [PREFS_KEY]: { ...current, ...prefs },
      })
    }
  } catch (err) {
    console.error('[ContextLion] Failed to save sync storage preferences:', err)
  }
}
