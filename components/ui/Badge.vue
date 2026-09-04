<script setup lang="ts">
interface Props {
  variant?: 'default' | 'lion' | 'success' | 'warning'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      variant === 'default' ? 'bg-gray-800 text-gray-300 border border-gray-700' : '',
      variant === 'lion' ? 'bg-lion-500/15 text-lion-300 border border-lion-500/30' : '',
      variant === 'success'
        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
        : '',
      variant === 'warning' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : '',
    ]"
  >
    <slot />
  </span>
</template>
