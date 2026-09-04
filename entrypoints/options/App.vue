<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sparkles, Settings, Plus, Trash2, RotateCcw, Check, ExternalLink } from 'lucide-vue-next'

import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from '../../lib/storage/preferences'
import { BUILTIN_PROMPT_PRESETS, type PromptPreset } from '../../lib/context/prompt-presets'

import Button from '../../components/ui/Button.vue'
import Badge from '../../components/ui/Badge.vue'
import Toast from '../../components/ui/Toast.vue'

const preferences = ref<UserPreferences>({
  theme: 'dark',
  defaultCopyFormat: 'ai-context',
  includeImages: true,
  includeLinks: true,
  defaultPromptPreset: 'none',
  customPrompts: [],
})

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
      defaultPromptPreset: 'none',
      customPrompts: [],
    }
    await savePreferences(preferences.value)
    showToast('Reset to default settings')
  }
}

onMounted(async () => {
  preferences.value = await getPreferences()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between pb-6 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-lion-500 flex items-center justify-center text-gray-950 font-black text-xl shadow-md"
          >
            🦁
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-white tracking-tight">ContextLion Settings</h1>
              <Badge variant="lion">v0.2.0</Badge>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">
              Customize extraction behavior, prompt presets, and export rules.
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
              What action triggers when clicking primary button.
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
        <div>ContextLion v0.2.0 • Local-First Architecture</div>
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
