<script setup lang="ts">
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

interface Props {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'info'
}

withDefaults(defineProps<Props>(), {
  type: 'success',
})

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-200 transition"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border text-xs font-medium backdrop-blur-md"
      :class="[
        type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/60' : '',
        type === 'error' ? 'bg-rose-950/90 text-rose-200 border-rose-800/60' : '',
        type === 'info' ? 'bg-gray-800/90 text-gray-200 border-gray-700/60' : '',
      ]"
    >
      <CheckCircle2 v-if="type === 'success'" class="w-4 h-4 text-emerald-400 shrink-0" />
      <AlertCircle v-else-if="type === 'error'" class="w-4 h-4 text-rose-400 shrink-0" />
      <Info v-else class="w-4 h-4 text-lion-400 shrink-0" />

      <span>{{ message }}</span>

      <button
        type="button"
        class="ml-1 text-gray-400 hover:text-white p-0.5 rounded"
        @click="$emit('close')"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </Transition>
</template>
