import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveHistoryRecord,
  getHistoryRecords,
  deleteHistoryRecord,
  toggleFavoriteHistoryRecord,
  clearHistory,
} from '../../lib/storage/history'

describe('History Storage module', () => {
  let mockStorage: Record<string, unknown> = {}

  beforeEach(() => {
    mockStorage = {}
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (key: string) => {
            return { [key]: mockStorage[key] }
          }),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.assign(mockStorage, items)
          }),
          remove: vi.fn(async (key: string) => {
            delete mockStorage[key]
          }),
        },
      },
    })
  })

  it('saves and retrieves history records in descending order of time', async () => {
    await saveHistoryRecord({
      type: 'page',
      title: 'First Page',
      url: 'https://example.com/1',
      wordCount: 100,
      estimatedTokens: 120,
      markdown: '# First Page',
      capturedAt: 1000,
    })

    await saveHistoryRecord({
      type: 'pack',
      title: 'Second Pack',
      itemCount: 3,
      wordCount: 500,
      estimatedTokens: 600,
      markdown: '# Context Pack',
      capturedAt: 2000,
    })

    const records = await getHistoryRecords()
    expect(records).toHaveLength(2)
    expect(records[0]?.title).toBe('Second Pack')
    expect(records[1]?.title).toBe('First Page')
  })

  it('toggles favorite status of a record', async () => {
    const saved = await saveHistoryRecord({
      type: 'page',
      title: 'Doc to Favorite',
      url: 'https://example.com/doc',
      wordCount: 50,
      estimatedTokens: 60,
      markdown: '# Doc',
    })

    expect(saved.isFavorite).toBe(false)

    const isFavNow = await toggleFavoriteHistoryRecord(saved.id)
    expect(isFavNow).toBe(true)

    const records = await getHistoryRecords()
    expect(records[0]?.isFavorite).toBe(true)
  })

  it('deletes a specific history record', async () => {
    const r1 = await saveHistoryRecord({
      type: 'page',
      title: 'Item 1',
      markdown: '# 1',
      wordCount: 1,
      estimatedTokens: 1,
    })
    const r2 = await saveHistoryRecord({
      type: 'page',
      title: 'Item 2',
      markdown: '# 2',
      wordCount: 2,
      estimatedTokens: 2,
    })

    await deleteHistoryRecord(r1.id)
    const records = await getHistoryRecords()
    expect(records).toHaveLength(1)
    expect(records[0]?.id).toBe(r2.id)
  })

  it('clears history while optionally preserving favorites', async () => {
    const fav = await saveHistoryRecord({
      type: 'page',
      title: 'Keeper',
      markdown: '# Keep',
      wordCount: 1,
      estimatedTokens: 1,
      isFavorite: true,
    })
    await saveHistoryRecord({
      type: 'page',
      title: 'Throwaway',
      markdown: '# Bye',
      wordCount: 1,
      estimatedTokens: 1,
      isFavorite: false,
    })

    await clearHistory(true)
    let records = await getHistoryRecords()
    expect(records).toHaveLength(1)
    expect(records[0]?.id).toBe(fav.id)

    await clearHistory(false)
    records = await getHistoryRecords()
    expect(records).toHaveLength(0)
  })
})
