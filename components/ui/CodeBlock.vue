<script setup lang="ts">
interface Props {
  content: string
  maxHeight?: string
}

withDefaults(defineProps<Props>(), {
  maxHeight: '200px',
})
</script>

<template>
  <div
    class="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-xs text-gray-300 overflow-auto whitespace-pre-wrap select-text leading-relaxed"
    :style="{ maxHeight }"
  >
    {{ content }}
  </div>
</template>
