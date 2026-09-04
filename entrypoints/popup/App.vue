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
} from 'lucide-vue-next'

import type { PageContext, RawExtraction } from '../../types/context'
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
  BUILTIN_PROMPT_PRESETS,
  formatPromptContext,
  type PromptPreset,
} from '../../lib/context/prompt-presets'
import { detectLanguage, type DetectedLanguage } from '../../lib/transformers/language-detector'

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
type ExtractionMode = 'page' | 'selection' | 'picker'

const state = ref<ViewState>('loading')
const mode = ref<ExtractionMode>('page')
const errorMessage = ref('')
const errorCode = ref('')
const pageContext = ref<PageContext | null>(null)
const detectedLang = ref<DetectedLanguage | null>(null)
const selectedPresetId = ref('none')

// UI controls
const showPreview = ref(false)
const showSettings = ref(false)
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
  defaultPromptPreset: 'none',
  customPrompts: [],
})

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

function handleExtractionResult(raw: RawExtraction) {
  const context = buildPageContext(raw, {
    includeImages: preferences.value.includeImages,
    includeLinks: preferences.value.includeLinks,
  })

  if (!context.markdown.trim() && !context.plainText.trim()) {
    state.value = 'empty'
    return
  }

  pageContext.value = context
  detectedLang.value = detectLanguage(context.markdown)
  state.value = 'success'
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

    handleExtractionResult(response.data)
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

    handleExtractionResult(response.data)
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

// Download actions
function sanitizeFilename(title: string, ext: string): string {
  const clean =
    title
      .replace(/[/\\?%*:|"<>]/g, '-')
      .trim()
      .slice(0, 50) || 'context'
  return `${clean}.${ext}`
}

function downloadFile(content: string, filename: string, mimeType: string) {
  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Saved ${filename}`, 'success')
  } catch (err) {
    console.error('Download failed:', err)
    showToast('Failed to download file', 'error')
  }
}

function handleDownloadMarkdown() {
  if (!pageContext.value) return
  const filename = sanitizeFilename(pageContext.value.title, 'md')
  downloadFile(aiContextText.value, filename, 'text/markdown;charset=utf-8')
}

function handleDownloadTxt() {
  if (!pageContext.value) return
  const filename = sanitizeFilename(pageContext.value.title, 'txt')
  downloadFile(pageContext.value.plainText, filename, 'text/plain;charset=utf-8')
}

async function updatePreference<K extends keyof UserPreferences>(key: K, val: UserPreferences[K]) {
  preferences.value[key] = val
  await savePreferences({ [key]: val })
  if (key === 'includeImages' || key === 'includeLinks') {
    if (mode.value === 'selection') extractUserSelection()
    else extractFullPage()
  }
}

function openOptionsPage() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  }
}

onMounted(async () => {
  preferences.value = await getPreferences()
  if (preferences.value.defaultPromptPreset) {
    selectedPresetId.value = preferences.value.defaultPromptPreset
  }

  // Check if an element was recently picked
  const picked = await checkLastPickedElement()
  if (picked) {
    mode.value = 'picker'
    handleExtractionResult(picked)
    showToast('Loaded captured element!')
  } else {
    await extractFullPage()
  }
})
</script>

<template>
  <div
    class="w-[380px] min-h-[490px] bg-gray-950 text-gray-100 flex flex-col justify-between select-none"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50"
    >
      <div class="flex items-center gap-2">
        <img src="/icon-32.png" class="w-6 h-6 rounded-md shadow-sm" alt="ContextLion" />
        <div class="flex items-center gap-1.5">
          <h1 class="text-sm font-bold tracking-tight text-white">ContextLion</h1>
          <Badge variant="lion">v0.2</Badge>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <IconButton
          v-if="state === 'success'"
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

    <!-- Mode Selector Tabs (Full Page, Selection, Element Picker) -->
    <div class="px-4 pt-3 pb-1">
      <div
        class="grid grid-cols-3 gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs"
      >
        <button
          type="button"
          class="py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5"
          :class="
            mode === 'page'
              ? 'bg-gray-800 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          "
          @click="extractFullPage"
        >
          <Layers class="w-3.5 h-3.5 text-lion-400" />
          <span>Page</span>
        </button>

        <button
          type="button"
          class="py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5"
          :class="
            mode === 'selection'
              ? 'bg-gray-800 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          "
          @click="extractUserSelection"
        >
          <FileText class="w-3.5 h-3.5 text-amber-400" />
          <span>Selection</span>
        </button>

        <button
          type="button"
          class="py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 text-gray-400 hover:text-gray-200"
          title="Click to activate visual element picker on page"
          @click="triggerElementPicker"
        >
          <Crosshair class="w-3.5 h-3.5 text-emerald-400" />
          <span>Pick Element</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-4 flex flex-col justify-start gap-3.5">
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
            <span v-if="pageContext.author" class="truncate max-w-[140px]"
              >By {{ pageContext.author }}</span
            >
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
            <span v-if="activePreset.id !== 'none'" class="text-lion-400 text-[10px] lowercase"
              >task framed</span
            >
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
            <div class="flex gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px]">
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

            <CodeBlock :content="previewContent" max-height="150px" />
          </div>
        </div>
      </div>

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
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="px-4 py-2 border-t border-gray-800/80 bg-gray-900/30 flex items-center justify-between text-[11px] text-gray-500"
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
