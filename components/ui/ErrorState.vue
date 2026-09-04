<script setup lang="ts">
import { AlertTriangle, ShieldAlert } from 'lucide-vue-next'
import Button from './Button.vue'

interface Props {
  code?: string
  message: string
  isPermissionDenied?: boolean
}

withDefaults(defineProps<Props>(), {
  code: 'ERROR',
  isPermissionDenied: false,
})

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
    <div
      class="w-12 h-12 rounded-full border flex items-center justify-center mb-3"
      :class="
        isPermissionDenied
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      "
    >
      <ShieldAlert v-if="isPermissionDenied" class="w-6 h-6" />
      <AlertTriangle v-else class="w-6 h-6" />
    </div>

    <h3 class="text-sm font-semibold text-gray-100">
      {{ isPermissionDenied ? 'Cannot Access Page' : 'Extraction Error' }}
    </h3>

    <p class="text-xs text-gray-400 mt-1 max-w-[280px] leading-relaxed break-words">
      {{ message }}
    </p>

    <div v-if="!isPermissionDenied" class="mt-4">
      <Button variant="secondary" size="sm" @click="$emit('retry')"> Try Again </Button>
    </div>
  </div>
</template>
