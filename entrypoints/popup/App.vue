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
} from 'lucide-vue-next'

import type { PageContext } from '../../types/context'
import { requestPageExtraction } from '../../lib/messages/client'
import { buildPageContext, buildAiContextMarkdown } from '../../lib/context/context-builder'
import { formatTokenEstimate } from '../../lib/context/token-estimator'
import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from '../../lib/storage/preferences'

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
const state = ref<ViewState>('loading')
const errorMessage = ref('')
const errorCode = ref('')
const pageContext = ref<PageContext | null>(null)

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
})

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2400)
}

// Full AI Context text
const aiContextText = computed(() => {
  if (!pageContext.value) return ''
  return buildAiContextMarkdown({
    title: pageContext.value.title,
    url: pageContext.value.url,
    author: pageContext.value.author,
    publishedAt: pageContext.value.publishedAt,
    capturedAt: pageContext.value.capturedAt,
    markdown: pageContext.value.markdown,
  })
})

// Active preview content
const previewContent = computed(() => {
  if (!pageContext.value) return ''
  if (previewTab.value === 'ai') return aiContextText.value
  if (previewTab.value === 'markdown') return pageContext.value.markdown
  return pageContext.value.plainText
})

// Extraction flow
async function performExtraction() {
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

    const raw = response.data
    const context = buildPageContext(raw, {
      includeImages: preferences.value.includeImages,
      includeLinks: preferences.value.includeLinks,
    })

    if (!context.markdown.trim() && !context.plainText.trim()) {
      state.value = 'empty'
      return
    }

    pageContext.value = context
    state.value = 'success'
  } catch (err: unknown) {
    state.value = 'error'
    errorCode.value = 'UNEXPECTED_ERROR'
    errorMessage.value = err instanceof Error ? err.message : String(err)
  }
}

// Copy actions (performed safely in popup context)
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
  copyToClipboard(aiContextText.value, 'AI Context')
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

// Download actions (executed in popup context via Blob and createObjectURL)
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
  // Re-run extraction if formatting options changed
  if (key === 'includeImages' || key === 'includeLinks') {
    performExtraction()
  }
}

onMounted(async () => {
  preferences.value = await getPreferences()
  await performExtraction()
})
</script>

<template>
  <div
    class="w-[380px] min-h-[460px] bg-gray-950 text-gray-100 flex flex-col justify-between select-none"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded-md bg-lion-500 flex items-center justify-center text-gray-950 font-black text-xs shadow-sm"
        >
          🦁
        </div>
        <div class="flex items-center gap-1.5">
          <h1 class="text-sm font-bold tracking-tight text-white">ContextLion</h1>
          <Badge variant="lion">v0.1</Badge>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <IconButton
          v-if="state === 'success'"
          title="Refresh extraction"
          @click="performExtraction"
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

    <!-- Main Container -->
    <main class="flex-1 p-4 flex flex-col justify-start gap-4">
      <!-- Loading State -->
      <LoadingState v-if="state === 'loading'" />

      <!-- Error State -->
      <ErrorState
        v-else-if="state === 'error'"
        :code="errorCode"
        :message="errorMessage"
        @retry="performExtraction"
      />

      <!-- Permission Denied State -->
      <ErrorState
        v-else-if="state === 'permission_denied'"
        :is-permission-denied="true"
        :code="errorCode"
        :message="errorMessage"
      />

      <!-- Empty State -->
      <EmptyState v-else-if="state === 'empty'" @action="performExtraction" />

      <!-- Success State -->
      <div v-else-if="state === 'success' && pageContext" class="flex flex-col gap-3.5">
        <!-- Page Info Card -->
        <div class="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-1.5">
          <div class="text-[11px] font-medium text-lion-400 uppercase tracking-wider">
            Current Page
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

        <!-- Primary Action Buttons -->
        <div class="space-y-2 pt-1">
          <Button variant="primary" size="md" block @click="handleCopyAiContext">
            <Sparkles class="w-4 h-4 shrink-0 text-gray-950" />
            <span>Copy AI Context</span>
          </Button>

          <Button variant="secondary" size="md" block @click="handleCopyMarkdown">
            <Copy class="w-4 h-4 shrink-0 text-gray-400" />
            <span>Copy Markdown</span>
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
              <span>Preview Content</span>
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
                AI Context
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

            <CodeBlock :content="previewContent" max-height="160px" />
          </div>
        </div>
      </div>

      <!-- Settings Drawer / Panel -->
      <div
        v-if="showSettings"
        class="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-2.5 text-xs text-gray-300"
      >
        <div class="font-semibold text-gray-100 pb-1 border-b border-gray-800">
          Extraction Settings
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
      <span class="text-gray-600">Malilion Tools</span>
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
