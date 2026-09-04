<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Sparkles,
  Copy,
  Download,
  FileText,
  FileCode,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  RefreshCw,
  Crosshair,
  Layers,
  Globe,
  Sliders,
  Package,
  History,
  Search,
  Star,
  Trash2,
  X,
  FolderArchive,
  AlertCircle,
} from 'lucide-vue-next'

import type { PageContext, RawExtraction } from '../../types/context'
import type { TabItem, TabDomainGroup, ContextPack, BatchProgress } from '../../types/context-pack'
import {
  requestPageExtraction,
  requestSelectionExtraction,
  requestStartElementPicker,
  checkLastPickedElement,
} from '../../lib/messages/client'
import { buildPageContext, buildAiContextMarkdown } from '../../lib/context/context-builder'
import { formatTokenEstimate } from '../../lib/context/token-estimator'
import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from '../../lib/storage/preferences'
import {
  saveHistoryRecord,
  getHistoryRecords,
  deleteHistoryRecord,
  toggleFavoriteHistoryRecord,
  type HistoryRecord,
} from '../../lib/storage/history'
import {
  BUILTIN_PROMPT_PRESETS,
  formatPromptContext,
  type PromptPreset,
} from '../../lib/context/prompt-presets'
import { detectLanguage, type DetectedLanguage } from '../../lib/transformers/language-detector'
import { getExtractableTabs, extractTabBatch } from '../../lib/context/batch-extractor'
import { exportContextPackToZip } from '../../lib/export/zip-exporter'

// Components
import Button from '../../components/ui/Button.vue'
import IconButton from '../../components/ui/IconButton.vue'
import Badge from '../../components/ui/Badge.vue'
import Toast from '../../components/ui/Toast.vue'
import LoadingState from '../../components/ui/LoadingState.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import ErrorState from '../../components/ui/ErrorState.vue'
import CodeBlock from '../../components/ui/CodeBlock.vue'

// Reactive state
type ViewState = 'loading' | 'success' | 'empty' | 'error' | 'permission_denied'
type ExtractionMode = 'page' | 'selection' | 'picker' | 'pack'
type PackState = 'select' | 'extracting' | 'result'

const state = ref<ViewState>('loading')
const mode = ref<ExtractionMode>('page')
const packState = ref<PackState>('select')
const errorMessage = ref('')
const errorCode = ref('')
const pageContext = ref<PageContext | null>(null)
const detectedLang = ref<DetectedLanguage | null>(null)
const selectedPresetId = ref('none')

// UI controls
const showPreview = ref(false)
const showSettings = ref(false)
const showHistory = ref(false)
const previewTab = ref<'ai' | 'markdown' | 'plain'>('ai')
const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
  show: false,
  message: '',
  type: 'success',
})

// Preferences
const preferences = ref<UserPreferences>({
  theme: 'dark',
  defaultCopyFormat: 'ai-context',
  includeImages: true,
  includeLinks: true,
  normalizeHeadings: true,
  defaultPromptPreset: 'none',
  customPrompts: [],
})

// Context Pack state
const tabGroups = ref<TabDomainGroup[]>([])
const packSearchQuery = ref('')
const batchProgress = ref<BatchProgress | null>(null)
const currentPack = ref<ContextPack | null>(null)
const customPackTitle = ref('')

// History state
const historyRecords = ref<HistoryRecord[]>([])
const historyFilter = ref<'all' | 'favorites'>('all')

// Combined presets
const allPresets = computed<PromptPreset[]>(() => {
  return [...BUILTIN_PROMPT_PRESETS, ...(preferences.value.customPrompts || [])]
})

const FALLBACK_PRESET: PromptPreset = {
  id: 'none',
  label: 'Standard Context',
  description: 'Direct AI Context without task framing',
  instruction: '',
}

const activePreset = computed<PromptPreset>(() => {
  return allPresets.value.find((p) => p.id === selectedPresetId.value) || FALLBACK_PRESET
})

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2400)
}

// Full AI Context text (with prompt instructions applied if selected)
const aiContextText = computed(() => {
  if (!pageContext.value) return ''
  const baseAi = buildAiContextMarkdown({
    title: pageContext.value.title,
    url: pageContext.value.url,
    author: pageContext.value.author,
    publishedAt: pageContext.value.publishedAt,
    capturedAt: pageContext.value.capturedAt,
    markdown: pageContext.value.markdown,
  })

  return formatPromptContext(baseAi, activePreset.value.instruction)
})

// Active preview content
const previewContent = computed(() => {
  if (!pageContext.value) return ''
  if (previewTab.value === 'ai') return aiContextText.value
  if (previewTab.value === 'markdown') return pageContext.value.markdown
  return pageContext.value.plainText
})

// Tab selection computeds
const filteredTabGroups = computed(() => {
  const query = packSearchQuery.value.trim().toLowerCase()
  if (!query) return tabGroups.value

  const results: TabDomainGroup[] = []
  for (const group of tabGroups.value) {
    const matchingItems = group.items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        group.domain.toLowerCase().includes(query)
    )
    if (matchingItems.length > 0) {
      results.push({ domain: group.domain, items: matchingItems })
    }
  }
  return results
})

const allExtractableTabs = computed<TabItem[]>(() => {
  const tabs: TabItem[] = []
  for (const group of tabGroups.value) {
    for (const item of group.items) {
      if (item.isExtractable) tabs.push(item)
    }
  }
  return tabs
})

const selectedExtractableTabs = computed<TabItem[]>(() => {
  return allExtractableTabs.value.filter((t) => t.isSelected)
})

// Filtered History computeds
const filteredHistoryRecords = computed(() => {
  let list = historyRecords.value
  if (historyFilter.value === 'favorites') {
    list = list.filter((r) => r.isFavorite)
  }
  return list
})

async function reloadHistory() {
  historyRecords.value = await getHistoryRecords()
}

async function handleExtractionResult(raw: RawExtraction) {
  const context = buildPageContext(raw, {
    includeImages: preferences.value.includeImages,
    includeLinks: preferences.value.includeLinks,
    normalizeHeadings: preferences.value.normalizeHeadings,
  })

  if (!context.markdown.trim() && !context.plainText.trim()) {
    state.value = 'empty'
    return
  }

  pageContext.value = context
  detectedLang.value = detectLanguage(context.markdown)
  state.value = 'success'

  // Persist to local history
  await saveHistoryRecord({
    type: 'page',
    title: context.title || 'Untitled Page',
    url: context.url,
    wordCount: context.wordCount,
    estimatedTokens: context.estimatedTokens,
    markdown: buildAiContextMarkdown({
      title: context.title,
      url: context.url,
      author: context.author,
      publishedAt: context.publishedAt,
      capturedAt: context.capturedAt,
      markdown: context.markdown,
    }),
  })
}

// Full Page Extraction
async function extractFullPage() {
  mode.value = 'page'
  state.value = 'loading'
  errorMessage.value = ''

  try {
    const response = await requestPageExtraction()
    if (!response.success) {
      if (response.error.code === 'PERMISSION_DENIED') {
        state.value = 'permission_denied'
      } else {
        state.value = 'error'
      }
      errorCode.value = response.error.code
      errorMessage.value = response.error.message
      return
    }

    await handleExtractionResult(response.data)
  } catch (err: unknown) {
    state.value = 'error'
    errorCode.value = 'UNEXPECTED_ERROR'
    errorMessage.value = err instanceof Error ? err.message : String(err)
  }
}

// Selection Extraction
async function extractUserSelection() {
  mode.value = 'selection'
  state.value = 'loading'
  errorMessage.value = ''

  try {
    const response = await requestSelectionExtraction()
    if (!response.success) {
      state.value = 'error'
      errorCode.value = response.error.code
      errorMessage.value = response.error.message
      return
    }

    if (!response.data) {
      state.value = 'empty'
      errorMessage.value = 'No text selected on the active page. Highlight text and try again.'
      return
    }

    await handleExtractionResult(response.data)
  } catch (err: unknown) {
    state.value = 'error'
    errorCode.value = 'SELECTION_ERROR'
    errorMessage.value = err instanceof Error ? err.message : String(err)
  }
}

// Interactive Element Picker
async function triggerElementPicker() {
  try {
    const response = await requestStartElementPicker()
    if (response.success && response.data.active) {
      // Close popup so user can interact with the webpage
      window.close()
    } else {
      showToast('Could not launch element picker on this page', 'error')
    }
  } catch {
    showToast('Failed to trigger element picker', 'error')
  }
}

// Switch to Context Pack mode
async function switchToPackMode() {
  mode.value = 'pack'
  packState.value = 'select'
  currentPack.value = null
  batchProgress.value = null
  try {
    tabGroups.value = await getExtractableTabs()
    // Select all extractable tabs by default for convenience
    for (const group of tabGroups.value) {
      for (const item of group.items) {
        if (item.isExtractable) {
          item.isSelected = true
        }
      }
    }
  } catch (err) {
    console.error('Failed to load window tabs:', err)
    showToast('Failed to load window tabs', 'error')
  }
}

function selectAllTabs(select: boolean) {
  const targetGroups = packSearchQuery.value.trim() ? filteredTabGroups.value : tabGroups.value
  for (const group of targetGroups) {
    for (const item of group.items) {
      if (item.isExtractable) {
        item.isSelected = select
      }
    }
  }
}

function toggleDomainTabs(domain: string) {
  const group = tabGroups.value.find((g) => g.domain === domain)
  if (!group) return
  const extractable = group.items.filter((i) => i.isExtractable)
  const allSelected = extractable.every((i) => i.isSelected)
  for (const item of extractable) {
    item.isSelected = !allSelected
  }
}

// Batch Extraction Trigger
async function startBatchExtraction() {
  const selected = selectedExtractableTabs.value
  if (selected.length === 0) {
    showToast('Select at least one tab to extract', 'info')
    return
  }

  packState.value = 'extracting'

  try {
    const title =
      customPackTitle.value.trim() ||
      `Context Pack (${selected.length} source${selected.length > 1 ? 's' : ''})`

    const pack = await extractTabBatch(
      selected,
      {
        packTitle: title,
        taskInstruction: activePreset.value.instruction,
        transformOptions: {
          includeImages: preferences.value.includeImages,
          includeLinks: preferences.value.includeLinks,
          normalizeHeadings: preferences.value.normalizeHeadings,
        },
      },
      (progress) => {
        batchProgress.value = progress
      }
    )

    currentPack.value = pack
    packState.value = 'result'

    // Save pack to history
    await saveHistoryRecord({
      type: 'pack',
      title: pack.title,
      itemCount: pack.successfulSources,
      wordCount: pack.totalWords,
      estimatedTokens: pack.totalTokens,
      markdown: pack.markdown,
    })

    showToast(`Assembled pack with ${pack.successfulSources} sources!`)
  } catch (err: unknown) {
    console.error('Batch extraction error:', err)
    packState.value = 'select'
    showToast('Batch extraction encountered an error', 'error')
  }
}

// Copy actions
async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToast(`Copied ${label} to clipboard!`, 'success')
  } catch (err) {
    console.error('Clipboard copy failed:', err)
    showToast('Failed to copy to clipboard', 'error')
  }
}

function handleCopyAiContext() {
  copyToClipboard(
    aiContextText.value,
    activePreset.value.id !== 'none' ? `${activePreset.value.label} Context` : 'AI Context'
  )
}

function handleCopyMarkdown() {
  if (pageContext.value) {
    copyToClipboard(pageContext.value.markdown, 'Markdown')
  }
}

function handleCopyPlainText() {
  if (pageContext.value) {
    copyToClipboard(pageContext.value.plainText, 'Plain Text')
  }
}

function handleCopyPackMarkdown() {
  if (currentPack.value) {
    copyToClipboard(currentPack.value.markdown, 'Context Pack')
  }
}

// Download actions
function sanitizeFilename(title: string, ext: string): string {
  const clean =
    title
      .replace(/[/\\?%*:|"<>]/g, '-')
      .trim()
      .slice(0, 50) || 'context'
  return `${clean}.${ext}`
}

function downloadFile(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    showToast(`Saved ${filename}`, 'success')
  } catch (err) {
    console.error('Download failed:', err)
    showToast('Failed to download file', 'error')
  }
}

function handleDownloadMarkdown() {
  if (!pageContext.value) return
  const filename = sanitizeFilename(pageContext.value.title, 'md')
  const blob = new Blob([aiContextText.value], { type: 'text/markdown;charset=utf-8' })
  downloadFile(blob, filename)
}

function handleDownloadTxt() {
  if (!pageContext.value) return
  const filename = sanitizeFilename(pageContext.value.title, 'txt')
  const blob = new Blob([pageContext.value.plainText], { type: 'text/plain;charset=utf-8' })
  downloadFile(blob, filename)
}

function handleDownloadPackMarkdown() {
  if (!currentPack.value) return
  const filename = sanitizeFilename(currentPack.value.title, 'md')
  const blob = new Blob([currentPack.value.markdown], { type: 'text/markdown;charset=utf-8' })
  downloadFile(blob, filename)
}

function handleDownloadPackZip() {
  if (!currentPack.value) return
  const filename = sanitizeFilename(currentPack.value.title, 'zip')
  const zipBlob = exportContextPackToZip(currentPack.value)
  downloadFile(zipBlob, filename)
}

// History actions in Popup
async function toggleHistoryFavorite(id: string) {
  await toggleFavoriteHistoryRecord(id)
  await reloadHistory()
}

async function deleteHistory(id: string) {
  await deleteHistoryRecord(id)
  await reloadHistory()
  showToast('Removed from history')
}

async function copyHistoryRecord(record: HistoryRecord) {
  await copyToClipboard(record.markdown, `"${record.title}"`)
}

async function updatePreference<K extends keyof UserPreferences>(key: K, val: UserPreferences[K]) {
  preferences.value[key] = val
  await savePreferences({ [key]: val })
  if (key === 'includeImages' || key === 'includeLinks' || key === 'normalizeHeadings') {
    if (mode.value === 'selection') extractUserSelection()
    else if (mode.value === 'page') extractFullPage()
  }
}

function openOptionsPage() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  }
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  preferences.value = await getPreferences()
  if (preferences.value.defaultPromptPreset) {
    selectedPresetId.value = preferences.value.defaultPromptPreset
  }
  await reloadHistory()

  // Check if an element was recently picked
  const picked = await checkLastPickedElement()
  if (picked) {
    mode.value = 'picker'
    await handleExtractionResult(picked)
    showToast('Loaded captured element!')
  } else {
    await extractFullPage()
  }
})
</script>

<template>
  <div
    class="w-[380px] min-h-[490px] max-h-[600px] bg-gray-950 text-gray-100 flex flex-col justify-between select-none relative overflow-hidden"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50 shrink-0"
    >
      <div class="flex items-center gap-2">
        <img src="/icon-32.png" class="w-6 h-6 rounded-md shadow-sm" alt="ContextLion" />
        <div class="flex items-center gap-1.5">
          <h1 class="text-sm font-bold tracking-tight text-white">ContextLion</h1>
          <Badge variant="lion">v1.0.0</Badge>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <IconButton
          :title="showHistory ? 'Close History' : 'Recent History'"
          @click="showHistory = !showHistory"
        >
          <History class="w-4 h-4" :class="{ 'text-lion-400': showHistory }" />
        </IconButton>
        <IconButton
          v-if="mode !== 'pack' && state === 'success'"
          title="Refresh extraction"
          @click="mode === 'selection' ? extractUserSelection() : extractFullPage()"
        >
          <RefreshCw class="w-4 h-4" />
        </IconButton>
        <IconButton
          :title="showSettings ? 'Hide settings' : 'Settings'"
          @click="showSettings = !showSettings"
        >
          <Settings class="w-4 h-4" :class="{ 'text-lion-400': showSettings }" />
        </IconButton>
      </div>
    </header>

    <!-- Mode Selector Tabs (Page, Selection, Pick Element, Context Pack) -->
    <div class="px-4 pt-3 pb-1 shrink-0">
      <div
        class="grid grid-cols-4 gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-[11px]"
      >
        <button
          type="button"
          class="py-1.5 px-1.5 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1"
          :class="
            mode === 'page'
              ? 'bg-gray-800 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          "
          @click="extractFullPage"
        >
          <Layers class="w-3 h-3 text-lion-400 shrink-0" />
          <span>Page</span>
        </button>

        <button
          type="button"
          class="py-1.5 px-1.5 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1"
          :class="
            mode === 'selection'
              ? 'bg-gray-800 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          "
          @click="extractUserSelection"
        >
          <FileText class="w-3 h-3 text-amber-400 shrink-0" />
          <span>Select</span>
        </button>

        <button
          type="button"
          class="py-1.5 px-1.5 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 text-gray-400 hover:text-gray-200"
          title="Click to activate visual element picker on page"
          @click="triggerElementPicker"
        >
          <Crosshair class="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Pick</span>
        </button>

        <button
          type="button"
          class="py-1.5 px-1.5 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1"
          :class="
            mode === 'pack'
              ? 'bg-lion-500/20 text-lion-300 border border-lion-500/30 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          "
          @click="switchToPackMode"
        >
          <Package class="w-3 h-3 text-lion-400 shrink-0" />
          <span>Pack</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-4 flex flex-col justify-start gap-3.5 overflow-y-auto">
      <!-- ================= MODE: CONTEXT PACK ================= -->
      <div v-if="mode === 'pack'" class="space-y-3">
        <!-- 1. Selection State -->
        <div v-if="packState === 'select'" class="space-y-3">
          <!-- Search & Count Bar -->
          <div class="space-y-2">
            <div class="relative">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
              <input
                v-model="packSearchQuery"
                type="text"
                placeholder="Filter tabs by title or domain..."
                class="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-lion-400"
              />
            </div>

            <div class="flex items-center justify-between text-xs px-0.5">
              <span class="text-gray-400">
                <span class="font-semibold text-lion-400">{{
                  selectedExtractableTabs.length
                }}</span>
                of {{ allExtractableTabs.length }} tabs selected
              </span>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-lion-400 hover:underline text-[11px]"
                  @click="selectAllTabs(true)"
                >
                  Select All
                </button>
                <span class="text-gray-600">•</span>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-200 text-[11px]"
                  @click="selectAllTabs(false)"
                >
                  Deselect
                </button>
              </div>
            </div>
          </div>

          <!-- Grouped Tabs List -->
          <div class="max-h-[220px] overflow-y-auto space-y-2.5 pr-0.5">
            <div
              v-for="group in filteredTabGroups"
              :key="group.domain"
              class="bg-gray-900/60 border border-gray-800/80 rounded-xl overflow-hidden text-xs"
            >
              <!-- Domain Header -->
              <div
                class="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800/60 cursor-pointer"
                @click="toggleDomainTabs(group.domain)"
              >
                <span class="font-semibold text-gray-300 flex items-center gap-1.5 truncate">
                  <Globe class="w-3 h-3 text-gray-500 shrink-0" />
                  <span class="truncate">{{ group.domain }}</span>
                </span>
                <span class="text-[10px] text-gray-500 shrink-0">
                  {{ group.items.length }} tab{{ group.items.length > 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Tabs in Domain -->
              <div class="divide-y divide-gray-800/40">
                <label
                  v-for="tab in group.items"
                  :key="tab.id"
                  class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-800/40 transition-colors"
                  :class="{ 'opacity-50 cursor-not-allowed': !tab.isExtractable }"
                >
                  <input
                    type="checkbox"
                    v-model="tab.isSelected"
                    :disabled="!tab.isExtractable"
                    class="rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800 shrink-0"
                  />

                  <img
                    v-if="tab.favIconUrl"
                    :src="tab.favIconUrl"
                    class="w-3.5 h-3.5 rounded shrink-0 object-contain"
                    @error="($event.target as HTMLElement).style.display = 'none'"
                    alt=""
                  />
                  <Layers v-else class="w-3.5 h-3.5 text-gray-600 shrink-0" />

                  <div class="min-w-0 flex-1">
                    <div class="truncate text-gray-200 font-medium leading-tight">
                      {{ tab.title }}
                    </div>
                    <div class="truncate text-[10px] text-gray-500">
                      {{ tab.normalizedUrl || tab.url }}
                    </div>
                  </div>

                  <Badge
                    v-if="!tab.isExtractable"
                    variant="default"
                    class="text-[9px] py-0 px-1 shrink-0"
                  >
                    System
                  </Badge>
                </label>
              </div>
            </div>

            <div
              v-if="filteredTabGroups.length === 0"
              class="text-center py-6 text-xs text-gray-500"
            >
              No tabs match your filter.
            </div>
          </div>

          <!-- Prompt Preset Option for Pack -->
          <div class="space-y-1 pt-1">
            <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">
              Task Directive (Optional)
            </div>
            <select
              v-model="selectedPresetId"
              class="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-lion-400"
            >
              <option v-for="preset in allPresets" :key="preset.id" :value="preset.id">
                {{ preset.label }}
              </option>
            </select>
          </div>

          <!-- Primary Extract Button -->
          <Button
            variant="primary"
            size="md"
            block
            :disabled="selectedExtractableTabs.length === 0"
            @click="startBatchExtraction"
          >
            <Package class="w-4 h-4 shrink-0 text-gray-950" />
            <span>Extract Context Pack ({{ selectedExtractableTabs.length }} tabs)</span>
          </Button>
        </div>

        <!-- 2. Extracting State -->
        <div v-else-if="packState === 'extracting'" class="py-10 space-y-4 text-center">
          <div
            class="w-10 h-10 border-3 border-lion-400 border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-white">Extracting Multi-Tab Pack...</h3>
            <p class="text-xs text-gray-400 truncate max-w-[320px] mx-auto">
              {{ batchProgress?.currentTitle || 'Processing tabs...' }}
            </p>
          </div>

          <!-- Progress Bar -->
          <div
            v-if="batchProgress"
            class="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800"
          >
            <div
              class="bg-lion-400 h-2 transition-all duration-300 rounded-full"
              :style="{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }"
            ></div>
          </div>
          <div v-if="batchProgress" class="text-[11px] text-gray-500 font-medium">
            {{ batchProgress.current }} / {{ batchProgress.total }} tabs
          </div>
        </div>

        <!-- 3. Result State -->
        <div v-else-if="packState === 'result' && currentPack" class="space-y-3">
          <div class="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-lion-400 uppercase tracking-wider">
                Context Pack Assembled
              </span>
              <Badge variant="lion" class="text-[10px]">
                {{ currentPack.successfulSources }}/{{ currentPack.totalSources }} sources
              </Badge>
            </div>

            <h2 class="text-sm font-semibold text-gray-100 truncate">
              {{ currentPack.title }}
            </h2>

            <div
              v-if="currentPack.totalSources > currentPack.successfulSources"
              class="flex items-center gap-1 text-[11px] text-amber-400 pt-0.5"
            >
              <AlertCircle class="w-3 h-3" />
              <span>
                {{ currentPack.totalSources - currentPack.successfulSources }} source(s) could not
                be captured
              </span>
            </div>
          </div>

          <!-- Pack Metrics -->
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2.5 bg-gray-900/70 border border-gray-800 rounded-lg text-center">
              <div class="text-xs text-gray-400">Total Words</div>
              <div class="text-base font-bold text-gray-100 mt-0.5">
                {{ currentPack.totalWords.toLocaleString() }}
              </div>
            </div>
            <div class="p-2.5 bg-gray-900/70 border border-gray-800 rounded-lg text-center">
              <div class="text-xs text-gray-400 flex items-center justify-center gap-1">
                Tokens <span class="text-[10px] text-lion-400/80">(est.)</span>
              </div>
              <div class="text-base font-bold text-lion-400 mt-0.5">
                {{ formatTokenEstimate(currentPack.totalTokens) }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2 pt-1">
            <Button variant="primary" size="md" block @click="handleCopyPackMarkdown">
              <Sparkles class="w-4 h-4 shrink-0 text-gray-950" />
              <span>Copy Context Pack</span>
            </Button>

            <div class="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="md" @click="handleDownloadPackMarkdown">
                <Download class="w-4 h-4 text-gray-400" />
                <span>Save .md</span>
              </Button>
              <Button variant="secondary" size="md" @click="handleDownloadPackZip">
                <FolderArchive class="w-4 h-4 text-lion-400" />
                <span>Save .zip</span>
              </Button>
            </div>
          </div>

          <!-- Preview & Back -->
          <div class="pt-1 flex items-center justify-between text-xs text-gray-400">
            <button
              type="button"
              class="hover:text-gray-200 flex items-center gap-1 py-1"
              @click="showPreview = !showPreview"
            >
              <FileCode class="w-3.5 h-3.5" />
              <span>{{ showPreview ? 'Hide Preview' : 'Preview Pack Markdown' }}</span>
            </button>

            <button
              type="button"
              class="text-lion-400 hover:underline py-1"
              @click="packState = 'select'"
            >
              Select Different Tabs
            </button>
          </div>

          <div v-if="showPreview" class="pt-1">
            <CodeBlock :content="currentPack.markdown" max-height="160px" />
          </div>
        </div>
      </div>

      <!-- ================= MODE: SINGLE PAGE / SELECTION ================= -->
      <template v-else>
        <!-- Loading State -->
        <LoadingState
          v-if="state === 'loading'"
          :title="
            mode === 'selection'
              ? 'Extracting highlighted selection...'
              : 'Extracting page content...'
          "
        />

        <!-- Error State -->
        <ErrorState
          v-else-if="state === 'error'"
          :code="errorCode"
          :message="errorMessage"
          @retry="mode === 'selection' ? extractUserSelection() : extractFullPage()"
        />

        <!-- Permission Denied State -->
        <ErrorState
          v-else-if="state === 'permission_denied'"
          :is-permission-denied="true"
          :code="errorCode"
          :message="errorMessage"
        />

        <!-- Empty State -->
        <EmptyState
          v-else-if="state === 'empty'"
          :title="mode === 'selection' ? 'No text selected' : 'No content found'"
          :description="
            mode === 'selection'
              ? 'Highlight any text or paragraph on the page, then click Selection.'
              : 'Could not detect readable article content on this page.'
          "
          :action-text="mode === 'selection' ? 'Extract Full Page Instead' : 'Retry Extraction'"
          @action="extractFullPage"
        />

        <!-- Success State -->
        <div v-else-if="state === 'success' && pageContext" class="flex flex-col gap-3">
          <!-- Page Info Card -->
          <div class="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="text-[11px] font-medium text-lion-400 uppercase tracking-wider">
                {{
                  mode === 'selection'
                    ? 'Text Selection'
                    : mode === 'picker'
                      ? 'Captured Element'
                      : 'Current Page'
                }}
              </div>
              <div v-if="detectedLang" class="flex items-center gap-1 text-[11px] text-gray-400">
                <Globe class="w-3 h-3 text-gray-500" />
                <span>{{ detectedLang.name }}</span>
              </div>
            </div>

            <h2 class="text-sm font-semibold text-gray-100 line-clamp-2 leading-snug">
              {{ pageContext.title }}
            </h2>

            <div class="flex items-center gap-1.5 text-xs text-gray-400 pt-0.5">
              <span class="truncate max-w-[300px]">{{ pageContext.url }}</span>
              <a
                :href="pageContext.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 hover:text-gray-300 shrink-0"
                title="Open URL"
              >
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>

            <!-- Metadata Tags -->
            <div
              v-if="pageContext.author || pageContext.publishedAt"
              class="flex items-center gap-2 pt-1 text-[11px] text-gray-400"
            >
              <span v-if="pageContext.author" class="truncate max-w-[140px]">
                By {{ pageContext.author }}
              </span>
              <span v-if="pageContext.author && pageContext.publishedAt">•</span>
              <span v-if="pageContext.publishedAt">{{ pageContext.publishedAt }}</span>
            </div>
          </div>

          <!-- Metrics & Stats -->
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2.5 bg-gray-900/70 border border-gray-800 rounded-lg text-center">
              <div class="text-xs text-gray-400">Words</div>
              <div class="text-base font-bold text-gray-100 mt-0.5">
                {{ pageContext.wordCount.toLocaleString() }}
              </div>
            </div>
            <div class="p-2.5 bg-gray-900/70 border border-gray-800 rounded-lg text-center">
              <div class="text-xs text-gray-400 flex items-center justify-center gap-1">
                Tokens <span class="text-[10px] text-lion-400/80">(est.)</span>
              </div>
              <div class="text-base font-bold text-lion-400 mt-0.5">
                {{ formatTokenEstimate(pageContext.estimatedTokens) }}
              </div>
            </div>
          </div>

          <!-- Prompt Preset Selector Dropdown -->
          <div class="space-y-1">
            <div
              class="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-0.5"
            >
              <span class="flex items-center gap-1">
                <Sparkles class="w-3 h-3 text-lion-400" />
                <span>Prompt Preset</span>
              </span>
              <span v-if="activePreset.id !== 'none'" class="text-lion-400 text-[10px] lowercase">
                task framed
              </span>
            </div>

            <select
              v-model="selectedPresetId"
              class="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-lion-400"
            >
              <option v-for="preset in allPresets" :key="preset.id" :value="preset.id">
                {{ preset.label }}
              </option>
            </select>
          </div>

          <!-- Primary Action Buttons -->
          <div class="space-y-2 pt-1">
            <Button variant="primary" size="md" block @click="handleCopyAiContext">
              <Sparkles class="w-4 h-4 shrink-0 text-gray-950" />
              <span>{{
                activePreset.id !== 'none' ? `Copy ${activePreset.label}` : 'Copy AI Context'
              }}</span>
            </Button>

            <Button variant="secondary" size="md" block @click="handleCopyMarkdown">
              <Copy class="w-4 h-4 shrink-0 text-gray-400" />
              <span>Copy Raw Markdown</span>
            </Button>
          </div>

          <!-- Export & Secondary Actions Row -->
          <div
            class="flex items-center justify-between pt-1 border-t border-gray-800/80 text-xs text-gray-400"
          >
            <button
              type="button"
              class="hover:text-gray-200 transition-colors py-1 flex items-center gap-1"
              @click="handleCopyPlainText"
            >
              <FileText class="w-3.5 h-3.5 text-gray-500" />
              <span>Plain Text</span>
            </button>

            <button
              type="button"
              class="hover:text-gray-200 transition-colors py-1 flex items-center gap-1"
              @click="handleDownloadMarkdown"
            >
              <Download class="w-3.5 h-3.5 text-gray-500" />
              <span>.md</span>
            </button>

            <button
              type="button"
              class="hover:text-gray-200 transition-colors py-1 flex items-center gap-1"
              @click="handleDownloadTxt"
            >
              <Download class="w-3.5 h-3.5 text-gray-500" />
              <span>.txt</span>
            </button>
          </div>

          <!-- Preview Section -->
          <div class="pt-1 border-t border-gray-800/80">
            <button
              type="button"
              class="w-full flex items-center justify-between text-xs font-medium text-gray-400 hover:text-gray-200 py-1"
              @click="showPreview = !showPreview"
            >
              <span class="flex items-center gap-1.5">
                <FileCode class="w-3.5 h-3.5" />
                <span>Preview Output</span>
              </span>
              <ChevronUp v-if="showPreview" class="w-3.5 h-3.5" />
              <ChevronDown v-else class="w-3.5 h-3.5" />
            </button>

            <div v-if="showPreview" class="mt-2 space-y-2">
              <div
                class="flex gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px]"
              >
                <button
                  type="button"
                  class="flex-1 py-1 rounded font-medium transition-colors text-center"
                  :class="
                    previewTab === 'ai'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  "
                  @click="previewTab = 'ai'"
                >
                  Framed Context
                </button>
                <button
                  type="button"
                  class="flex-1 py-1 rounded font-medium transition-colors text-center"
                  :class="
                    previewTab === 'markdown'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  "
                  @click="previewTab = 'markdown'"
                >
                  Markdown
                </button>
                <button
                  type="button"
                  class="flex-1 py-1 rounded font-medium transition-colors text-center"
                  :class="
                    previewTab === 'plain'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  "
                  @click="previewTab = 'plain'"
                >
                  Plain Text
                </button>
              </div>

              <CodeBlock :content="previewContent" max-height="140px" />
            </div>
          </div>
        </div>
      </template>

      <!-- Quick Settings Drawer -->
      <div
        v-if="showSettings"
        class="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-2.5 text-xs text-gray-300"
      >
        <div
          class="flex items-center justify-between font-semibold text-gray-100 pb-1 border-b border-gray-800"
        >
          <span>Extraction Settings</span>
          <button
            type="button"
            class="text-lion-400 hover:underline flex items-center gap-1 font-normal text-[11px]"
            @click="openOptionsPage"
          >
            <span>Full Settings</span>
            <ExternalLink class="w-3 h-3" />
          </button>
        </div>

        <label class="flex items-center justify-between cursor-pointer py-1">
          <span>Include Images</span>
          <input
            type="checkbox"
            :checked="preferences.includeImages"
            class="rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800"
            @change="updatePreference('includeImages', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="flex items-center justify-between cursor-pointer py-1">
          <span>Include Hyperlinks</span>
          <input
            type="checkbox"
            :checked="preferences.includeLinks"
            class="rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800"
            @change="updatePreference('includeLinks', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="flex items-center justify-between cursor-pointer py-1">
          <div>
            <div>Normalize Heading Levels</div>
            <div class="text-[10px] text-gray-500">Shifts highest body headings to ##</div>
          </div>
          <input
            type="checkbox"
            :checked="preferences.normalizeHeadings"
            class="rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800"
            @change="
              updatePreference('normalizeHeadings', ($event.target as HTMLInputElement).checked)
            "
          />
        </label>
      </div>
    </main>

    <!-- History Slide-over Drawer -->
    <div
      v-if="showHistory"
      class="absolute inset-0 bg-gray-950/95 z-40 flex flex-col backdrop-blur-sm"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/60"
      >
        <div class="flex items-center gap-2">
          <History class="w-4 h-4 text-lion-400" />
          <h2 class="text-xs font-bold text-white uppercase tracking-wider">Context History</h2>
        </div>
        <IconButton title="Close History" @click="showHistory = false">
          <X class="w-4 h-4" />
        </IconButton>
      </div>

      <!-- History filter -->
      <div class="px-4 py-2 border-b border-gray-800/80 flex items-center justify-between text-xs">
        <div class="flex gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px]">
          <button
            type="button"
            class="px-2.5 py-0.5 rounded font-medium transition-colors"
            :class="
              historyFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200'
            "
            @click="historyFilter = 'all'"
          >
            All ({{ historyRecords.length }})
          </button>
          <button
            type="button"
            class="px-2.5 py-0.5 rounded font-medium transition-colors flex items-center gap-1"
            :class="
              historyFilter === 'favorites'
                ? 'bg-gray-800 text-amber-300'
                : 'text-gray-400 hover:text-gray-200'
            "
            @click="historyFilter = 'favorites'"
          >
            <Star class="w-2.5 h-2.5 fill-current" />
            <span>Favs ({{ historyRecords.filter((r) => r.isFavorite).length }})</span>
          </button>
        </div>

        <button
          type="button"
          class="text-lion-400 hover:underline text-[11px] flex items-center gap-1"
          @click="openOptionsPage"
        >
          <span>Manage</span>
          <ExternalLink class="w-2.5 h-2.5" />
        </button>
      </div>

      <!-- History Items List -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        <div
          v-for="item in filteredHistoryRecords"
          :key="item.id"
          class="p-2.5 bg-gray-900/80 border border-gray-800 rounded-xl space-y-1 hover:border-gray-700 transition-colors"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
              <Package v-if="item.type === 'pack'" class="w-3.5 h-3.5 text-lion-400 shrink-0" />
              <FileText v-else class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span class="font-semibold text-gray-200 truncate leading-tight">{{
                item.title
              }}</span>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="p-1 hover:text-amber-400 transition-colors"
                :class="item.isFavorite ? 'text-amber-400' : 'text-gray-600'"
                @click="toggleHistoryFavorite(item.id)"
              >
                <Star class="w-3 h-3" :class="{ 'fill-current': item.isFavorite }" />
              </button>
              <button
                type="button"
                class="p-1 text-gray-500 hover:text-gray-200 transition-colors"
                title="Copy context"
                @click="copyHistoryRecord(item)"
              >
                <Copy class="w-3 h-3" />
              </button>
              <button
                type="button"
                class="p-1 text-gray-600 hover:text-rose-400 transition-colors"
                title="Delete"
                @click="deleteHistory(item.id)"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
            <span>{{ formatDate(item.capturedAt) }}</span>
            <div class="flex items-center gap-1.5">
              <span v-if="item.type === 'pack'" class="text-lion-400/80">
                {{ item.itemCount || 1 }} sources
              </span>
              <span>•</span>
              <span>{{ formatTokenEstimate(item.estimatedTokens) }} tokens</span>
            </div>
          </div>
        </div>

        <div
          v-if="filteredHistoryRecords.length === 0"
          class="text-center py-12 text-gray-500 text-xs"
        >
          No history items found.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer
      class="px-4 py-2 border-t border-gray-800/80 bg-gray-900/30 flex items-center justify-between text-[11px] text-gray-500 shrink-0"
    >
      <span>Local-first • No remote tracking</span>
      <button
        type="button"
        class="text-gray-500 hover:text-gray-300 flex items-center gap-1"
        @click="openOptionsPage"
      >
        <Sliders class="w-3 h-3" />
        <span>Options</span>
      </button>
    </footer>

    <!-- Toast Notification -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>
