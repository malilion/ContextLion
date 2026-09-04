export interface HistoryRecord {
  id: string
  type: 'page' | 'pack'
  title: string
  url?: string
  capturedAt: number
  wordCount: number
  estimatedTokens: number
  isFavorite?: boolean
  itemCount?: number
  markdown: string
}

const HISTORY_STORAGE_KEY = 'context_lion_history'
const MAX_HISTORY_ITEMS = 50

/**
 * Retrieves all saved history records from local extension storage.
 */
export async function getHistoryRecords(): Promise<HistoryRecord[]> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get(HISTORY_STORAGE_KEY)
      const list = (res[HISTORY_STORAGE_KEY] as HistoryRecord[]) || []
      return list.sort((a, b) => b.capturedAt - a.capturedAt)
    }
  } catch (err) {
    console.warn('[ContextLion] Failed to retrieve history:', err)
  }
  return []
}

/**
 * Saves or updates a history record in local storage.
 * Automatically caps total non-favorite records to stay within storage limits.
 * Deduplicates page records by URL to prevent clutter.
 */
export async function saveHistoryRecord(
  item: Omit<HistoryRecord, 'id' | 'capturedAt'> & { id?: string; capturedAt?: number }
): Promise<HistoryRecord> {
  const current = await getHistoryRecords()

  // If a record with the same URL (for pages) or same ID exists, update it
  let existing = item.id ? current.find((r) => r.id === item.id) : undefined
  if (!existing && item.type === 'page' && item.url) {
    existing = current.find((r) => r.type === 'page' && r.url === item.url)
  }

  const id =
    existing?.id || item.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const capturedAt = item.capturedAt || Date.now()
  const isFavorite =
    item.isFavorite !== undefined ? item.isFavorite : (existing?.isFavorite ?? false)

  const record: HistoryRecord = {
    ...item,
    id,
    capturedAt,
    isFavorite,
  }

  // Remove existing with same id if updating
  const filtered = current.filter((r) => r.id !== id)
  filtered.unshift(record)

  // Cap size while preserving favorites
  let trimmed = filtered
  if (trimmed.length > MAX_HISTORY_ITEMS) {
    const favorites = trimmed.filter((r) => r.isFavorite)
    const nonFavorites = trimmed.filter((r) => !r.isFavorite)
    const allowedNonFav = Math.max(0, MAX_HISTORY_ITEMS - favorites.length)
    trimmed = [...favorites, ...nonFavorites.slice(0, allowedNonFav)].sort(
      (a, b) => b.capturedAt - a.capturedAt
    )
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({
        [HISTORY_STORAGE_KEY]: trimmed,
      })
    }
  } catch (err) {
    console.error('[ContextLion] Failed to persist history item:', err)
  }

  return record
}

/**
 * Deletes a single history record by its ID.
 */
export async function deleteHistoryRecord(id: string): Promise<void> {
  const current = await getHistoryRecords()
  const filtered = current.filter((r) => r.id !== id)

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({
        [HISTORY_STORAGE_KEY]: filtered,
      })
    }
  } catch (err) {
    console.error('[ContextLion] Failed to delete history item:', err)
  }
}

/**
 * Toggles the favorite status of a history record.
 */
export async function toggleFavoriteHistoryRecord(id: string): Promise<boolean> {
  const current = await getHistoryRecords()
  const target = current.find((r) => r.id === id)
  if (!target) return false

  target.isFavorite = !target.isFavorite

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({
        [HISTORY_STORAGE_KEY]: current,
      })
    }
  } catch (err) {
    console.error('[ContextLion] Failed to toggle favorite:', err)
  }

  return target.isFavorite
}

/**
 * Clears history records, optionally preserving favorite entries.
 */
export async function clearHistory(preserveFavorites = true): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      if (preserveFavorites) {
        const current = await getHistoryRecords()
        const favoritesOnly = current.filter((r) => r.isFavorite)
        await chrome.storage.local.set({
          [HISTORY_STORAGE_KEY]: favoritesOnly,
        })
      } else {
        await chrome.storage.local.remove(HISTORY_STORAGE_KEY)
      }
    }
  } catch (err) {
    console.error('[ContextLion] Failed to clear history:', err)
  }
}
