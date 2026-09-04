<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Sparkles,
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  ExternalLink,
  History,
  Star,
  Search,
  Copy,
  Package,
  FileText,
} from 'lucide-vue-next'

import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from '../../lib/storage/preferences'
import {
  getHistoryRecords,
  deleteHistoryRecord,
  toggleFavoriteHistoryRecord,
  clearHistory,
  type HistoryRecord,
} from '../../lib/storage/history'
import { BUILTIN_PROMPT_PRESETS, type PromptPreset } from '../../lib/context/prompt-presets'
import { formatTokenEstimate } from '../../lib/context/token-estimator'

import Button from '../../components/ui/Button.vue'
import Badge from '../../components/ui/Badge.vue'
import Toast from '../../components/ui/Toast.vue'

const preferences = ref<UserPreferences>({
  theme: 'dark',
  defaultCopyFormat: 'ai-context',
  includeImages: true,
  includeLinks: true,
  normalizeHeadings: true,
  defaultPromptPreset: 'none',
  customPrompts: [],
})

const historyRecords = ref<HistoryRecord[]>([])
const historySearch = ref('')
const historyFilter = ref<'all' | 'favorites'>('all')

const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
  show: false,
  message: '',
  type: 'success',
})

// Custom prompt modal/form state
const showAddModal = ref(false)
const newPromptLabel = ref('')
const newPromptDesc = ref('')
const newPromptInstruction = ref('')

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2400)
}

async function handleSavePreference<K extends keyof UserPreferences>(
  key: K,
  val: UserPreferences[K]
) {
  preferences.value[key] = val
  await savePreferences({ [key]: val })
  showToast('Settings saved successfully!')
}

async function handleAddCustomPrompt() {
  if (!newPromptLabel.value.trim() || !newPromptInstruction.value.trim()) {
    showToast('Please fill in prompt label and instruction', 'error')
    return
  }

  const newPrompt: PromptPreset = {
    id: `custom_${Date.now()}`,
    label: newPromptLabel.value.trim(),
    description: newPromptDesc.value.trim() || 'Custom prompt preset',
    instruction: newPromptInstruction.value.trim(),
  }

  preferences.value.customPrompts.push(newPrompt)
  await savePreferences({ customPrompts: preferences.value.customPrompts })

  newPromptLabel.value = ''
  newPromptDesc.value = ''
  newPromptInstruction.value = ''
  showAddModal.value = false
  showToast('Added custom prompt preset!')
}

async function handleDeleteCustomPrompt(id: string) {
  preferences.value.customPrompts = preferences.value.customPrompts.filter((p) => p.id !== id)
  if (preferences.value.defaultPromptPreset === id) {
    preferences.value.defaultPromptPreset = 'none'
  }
  await savePreferences({
    customPrompts: preferences.value.customPrompts,
    defaultPromptPreset: preferences.value.defaultPromptPreset,
  })
  showToast('Removed custom prompt preset')
}

async function handleResetDefaults() {
  if (confirm('Are you sure you want to reset all preferences to defaults?')) {
    preferences.value = {
      theme: 'dark',
      defaultCopyFormat: 'ai-context',
      includeImages: true,
      includeLinks: true,
      normalizeHeadings: true,
      defaultPromptPreset: 'none',
      customPrompts: [],
    }
    await savePreferences(preferences.value)
    showToast('Reset to default settings')
  }
}

// History actions
const filteredHistory = computed(() => {
  let list = historyRecords.value
  if (historyFilter.value === 'favorites') {
    list = list.filter((r) => r.isFavorite)
  }
  if (historySearch.value.trim()) {
    const q = historySearch.value.trim().toLowerCase()
    list = list.filter(
      (r) => r.title.toLowerCase().includes(q) || (r.url && r.url.toLowerCase().includes(q))
    )
  }
  return list
})

async function reloadHistory() {
  historyRecords.value = await getHistoryRecords()
}

async function handleToggleFavorite(id: string) {
  await toggleFavoriteHistoryRecord(id)
  await reloadHistory()
}

async function handleDeleteHistory(id: string) {
  await deleteHistoryRecord(id)
  await reloadHistory()
  showToast('Removed item from history')
}

async function handleClearHistory(preserveFavorites: boolean) {
  const msg = preserveFavorites
    ? 'Clear all non-favorite items from history?'
    : 'Are you sure you want to clear ALL history records?'
  if (confirm(msg)) {
    await clearHistory(preserveFavorites)
    await reloadHistory()
    showToast(preserveFavorites ? 'Cleared non-favorite history' : 'Cleared all history')
  }
}

async function handleCopyHistoryMarkdown(record: HistoryRecord) {
  try {
    await navigator.clipboard.writeText(record.markdown)
    showToast(`Copied "${record.title}" to clipboard!`)
  } catch {
    showToast('Failed to copy to clipboard', 'error')
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
  await reloadHistory()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between pb-6 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <img src="/icon-48.png" class="w-10 h-10 rounded-xl shadow-md" alt="ContextLion" />
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-white tracking-tight">ContextLion Settings</h1>
              <Badge variant="lion">v1.0.0</Badge>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">
              Configure extraction preferences, custom prompt presets, and manage captured context
              history.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" @click="handleResetDefaults">
          <RotateCcw class="w-3.5 h-3.5 mr-1 text-gray-400" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      <!-- Section: Extraction Defaults -->
      <section class="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <Settings class="w-4 h-4 text-lion-400" />
          <span>General Preferences</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <!-- Default Action -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Default Primary Copy Action
            </label>
            <select
              :value="preferences.defaultCopyFormat"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-lion-400"
              @change="
                handleSavePreference(
                  'defaultCopyFormat',
                  ($event.target as HTMLSelectElement).value as any
                )
              "
            >
              <option value="ai-context">Copy AI Context (with Metadata Header)</option>
              <option value="markdown">Copy Markdown (Raw Body)</option>
              <option value="plain-text">Copy Plain Text</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">
              What action triggers when clicking primary button in single page view.
            </p>
          </div>

          <!-- Default Prompt Preset -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Default Prompt Preset
            </label>
            <select
              :value="preferences.defaultPromptPreset"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-lion-400"
              @change="
                handleSavePreference(
                  'defaultPromptPreset',
                  ($event.target as HTMLSelectElement).value
                )
              "
            >
              <option
                v-for="preset in [...BUILTIN_PROMPT_PRESETS, ...preferences.customPrompts]"
                :key="preset.id"
                :value="preset.id"
              >
                {{ preset.label }}
              </option>
            </select>
            <p class="text-xs text-gray-400 mt-1">
              Automatically wrap AI context in this prompt task.
            </p>
          </div>
        </div>

        <!-- Toggles -->
        <div class="pt-4 border-t border-gray-800/80 space-y-3">
          <label
            class="flex items-center justify-between cursor-pointer py-1.5 px-3 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div>
              <div class="text-sm font-medium text-gray-200">Include Images in Markdown</div>
              <div class="text-xs text-gray-400">
                Preserve image markdown syntax with alt descriptions.
              </div>
            </div>
            <input
              type="checkbox"
              :checked="preferences.includeImages"
              class="w-4 h-4 rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800"
              @change="
                handleSavePreference('includeImages', ($event.target as HTMLInputElement).checked)
              "
            />
          </label>

          <label
            class="flex items-center justify-between cursor-pointer py-1.5 px-3 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div>
              <div class="text-sm font-medium text-gray-200">Include Hyperlinks</div>
              <div class="text-xs text-gray-400">Retain link URLs in generated markdown.</div>
            </div>
            <input
              type="checkbox"
              :checked="preferences.includeLinks"
              class="w-4 h-4 rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800"
              @change="
                handleSavePreference('includeLinks', ($event.target as HTMLInputElement).checked)
              "
            />
          </label>

          <label
            class="flex items-center justify-between cursor-pointer py-1.5 px-3 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div>
              <div class="text-sm font-medium text-gray-200">Normalize Heading Depths</div>
              <div class="text-xs text-gray-400">
                Automatically shifts top-level body headings to ## to preserve document hierarchy.
              </div>
            </div>
            <input
              type="checkbox"
              :checked="preferences.normalizeHeadings"
              class="w-4 h-4 rounded border-gray-700 text-lion-500 focus:ring-lion-400 bg-gray-800"
              @change="
                handleSavePreference(
                  'normalizeHeadings',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
          </label>
        </div>
      </section>

      <!-- Section: Custom Prompt Presets -->
      <section class="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-lion-400" />
              <span>Prompt Presets</span>
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">Built-in and custom task framing prompts.</p>
          </div>

          <Button variant="primary" size="sm" @click="showAddModal = true">
            <Plus class="w-3.5 h-3.5 mr-1" />
            <span>Add Custom Prompt</span>
          </Button>
        </div>

        <!-- Built-in Presets Grid -->
        <div class="space-y-3 pt-2">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Built-in Presets
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="preset in BUILTIN_PROMPT_PRESETS"
              :key="preset.id"
              class="p-3.5 bg-gray-950/60 border border-gray-800/80 rounded-xl space-y-1"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-200">{{ preset.label }}</span>
                <span
                  v-if="preferences.defaultPromptPreset === preset.id"
                  class="text-[11px] text-lion-400 flex items-center gap-1 font-medium"
                >
                  <Check class="w-3 h-3" /> Default
                </span>
              </div>
              <p class="text-xs text-gray-400 line-clamp-2">{{ preset.description }}</p>
            </div>
          </div>
        </div>

        <!-- Custom Presets List -->
        <div
          v-if="preferences.customPrompts.length > 0"
          class="space-y-3 pt-4 border-t border-gray-800/80"
        >
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Custom Presets
          </div>
          <div class="space-y-2">
            <div
              v-for="preset in preferences.customPrompts"
              :key="preset.id"
              class="flex items-center justify-between p-3.5 bg-gray-950/60 border border-gray-800/80 rounded-xl"
            >
              <div class="space-y-0.5">
                <div class="text-sm font-semibold text-gray-200">{{ preset.label }}</div>
                <div class="text-xs text-gray-400">{{ preset.instruction }}</div>
              </div>
              <button
                type="button"
                class="p-2 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-gray-800 transition-colors"
                title="Delete custom preset"
                @click="handleDeleteCustomPrompt(preset.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: History & Collections Management -->
      <section class="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-white flex items-center gap-2">
              <History class="w-4 h-4 text-lion-400" />
              <span>Context History & Collections</span>
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ historyRecords.length }} item(s) saved in local browser storage.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="historyRecords.length === 0"
              @click="handleClearHistory(true)"
            >
              <span>Clear Non-Favorites</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              :disabled="historyRecords.length === 0"
              class="text-rose-400 hover:text-rose-300"
              @click="handleClearHistory(false)"
            >
              <span>Clear All</span>
            </Button>
          </div>
        </div>

        <!-- Filter and Search Row -->
        <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div class="relative flex-1 w-full">
            <Search class="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              v-model="historySearch"
              type="text"
              placeholder="Search history by title or URL..."
              class="w-full pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-lion-400"
            />
          </div>

          <div
            class="flex items-center gap-1 bg-gray-800 p-0.5 rounded-lg border border-gray-700 self-stretch sm:self-auto text-xs"
          >
            <button
              type="button"
              class="px-3 py-1 rounded font-medium transition-colors"
              :class="
                historyFilter === 'all'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              "
              @click="historyFilter = 'all'"
            >
              All ({{ historyRecords.length }})
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded font-medium transition-colors flex items-center gap-1"
              :class="
                historyFilter === 'favorites'
                  ? 'bg-gray-700 text-amber-300'
                  : 'text-gray-400 hover:text-gray-200'
              "
              @click="historyFilter = 'favorites'"
            >
              <Star class="w-3 h-3 fill-current" />
              <span>Favorites ({{ historyRecords.filter((r) => r.isFavorite).length }})</span>
            </button>
          </div>
        </div>

        <!-- History List -->
        <div v-if="filteredHistory.length > 0" class="space-y-2 pt-2">
          <div
            v-for="record in filteredHistory"
            :key="record.id"
            class="flex items-center justify-between p-3.5 bg-gray-950/60 border border-gray-800/80 rounded-xl gap-3 hover:border-gray-700 transition-colors"
          >
            <div class="flex items-start gap-3 min-w-0 flex-1">
              <div class="mt-0.5 shrink-0">
                <Package v-if="record.type === 'pack'" class="w-4 h-4 text-lion-400" />
                <FileText v-else class="w-4 h-4 text-gray-400" />
              </div>
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-200 truncate">
                    {{ record.title }}
                  </span>
                  <Badge
                    v-if="record.type === 'pack'"
                    variant="lion"
                    class="text-[10px] py-0 px-1.5"
                  >
                    Pack • {{ record.itemCount || 1 }} sources
                  </Badge>
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span>{{ formatDate(record.capturedAt) }}</span>
                  <span>•</span>
                  <span>{{ record.wordCount.toLocaleString() }} words</span>
                  <span>•</span>
                  <span>{{ formatTokenEstimate(record.estimatedTokens) }} tokens</span>
                  <span v-if="record.url" class="truncate max-w-[200px] text-gray-600">
                    {{ record.url }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="p-2 rounded-lg transition-colors hover:bg-gray-800"
                :class="record.isFavorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'"
                :title="record.isFavorite ? 'Unfavorite' : 'Favorite'"
                @click="handleToggleFavorite(record.id)"
              >
                <Star class="w-4 h-4" :class="{ 'fill-current': record.isFavorite }" />
              </button>
              <button
                type="button"
                class="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
                title="Copy Markdown"
                @click="handleCopyHistoryMarkdown(record)"
              >
                <Copy class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="p-2 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-gray-800 transition-colors"
                title="Delete item"
                @click="handleDeleteHistory(record.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty History State -->
        <div v-else class="text-center py-8 text-gray-500 text-xs space-y-1">
          <History class="w-6 h-6 mx-auto text-gray-600 mb-2" />
          <p class="font-medium text-gray-400">No history records found</p>
          <p>
            {{
              historySearch
                ? 'Try clearing your search query'
                : 'Captured pages and Context Packs will appear here'
            }}
          </p>
        </div>
      </section>

      <!-- Add Custom Prompt Modal -->
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm"
      >
        <div
          class="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl"
        >
          <h3 class="text-base font-bold text-white">Create Custom Prompt Preset</h3>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-gray-300 mb-1">Preset Label</label>
              <input
                v-model="newPromptLabel"
                type="text"
                placeholder="e.g. Translate to Japanese"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-lion-400"
              />
            </div>

            <div>
              <label class="block font-semibold text-gray-300 mb-1">Description (Optional)</label>
              <input
                v-model="newPromptDesc"
                type="text"
                placeholder="Brief summary of what this prompt does"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-lion-400"
              />
            </div>

            <div>
              <label class="block font-semibold text-gray-300 mb-1">Task Instruction</label>
              <textarea
                v-model="newPromptInstruction"
                rows="4"
                placeholder="e.g. Translate this technical content accurately into natural Japanese suitable for software engineers."
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-lion-400 leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" @click="showAddModal = false"> Cancel </Button>
            <Button variant="primary" size="sm" @click="handleAddCustomPrompt">
              Save Preset
            </Button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer
        class="pt-6 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500"
      >
        <div>ContextLion v1.0.0 • Local-First Architecture</div>
        <div class="flex items-center gap-4">
          <a
            href="https://github.com/malilion/context-lion"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-gray-300 flex items-center gap-1"
          >
            <span>GitHub</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>

    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>
