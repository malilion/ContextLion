<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
})
</script>

<template>
  <div
    :class="[
      'bg-gray-900 border border-gray-800 rounded-xl shadow-sm text-gray-100 overflow-hidden',
      padding === 'none' ? 'p-0' : '',
      padding === 'sm' ? 'p-3' : '',
      padding === 'md' ? 'p-4' : '',
      padding === 'lg' ? 'p-5' : '',
    ]"
  >
    <slot />
  </div>
</template>
