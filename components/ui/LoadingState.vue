<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Extracting page content...',
  description: 'Parsing DOM and formatting AI-ready context',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="relative flex items-center justify-center w-12 h-12 mb-3">
      <div class="absolute inset-0 rounded-full bg-lion-500/20 animate-ping opacity-75"></div>
      <div
        class="w-10 h-10 rounded-full bg-lion-500/10 border border-lion-500/30 flex items-center justify-center"
      >
        <Loader2 class="w-5 h-5 text-lion-400 animate-spin" />
      </div>
    </div>
    <h3 class="text-sm font-semibold text-gray-100">{{ title }}</h3>
    <p class="text-xs text-gray-400 mt-1 max-w-[260px]">{{ description }}</p>
  </div>
</template>
