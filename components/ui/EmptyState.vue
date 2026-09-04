<script setup lang="ts">
import { FileQuestion } from 'lucide-vue-next'
import Button from './Button.vue'

interface Props {
  title?: string
  description?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No content found',
  description: 'Could not detect readable article or text content on this page.',
  actionText: 'Retry Extraction',
})

defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
    <div
      class="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-3"
    >
      <FileQuestion class="w-6 h-6 text-gray-400" />
    </div>
    <h3 class="text-sm font-semibold text-gray-200">{{ title }}</h3>
    <p class="text-xs text-gray-400 mt-1 max-w-[260px] leading-relaxed">{{ description }}</p>
    <div v-if="actionText" class="mt-4">
      <Button variant="secondary" size="sm" @click="$emit('action')">
        {{ actionText }}
      </Button>
    </div>
  </div>
</template>
