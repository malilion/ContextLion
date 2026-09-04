<script setup lang="ts">
interface Props {
  title?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  variant: 'ghost',
  size: 'md',
  disabled: false,
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    type="button"
    :title="title"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-lion-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'p-1 text-xs' : 'p-2 text-sm',
      variant === 'ghost' ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800' : '',
      variant === 'secondary'
        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
        : '',
      variant === 'primary' ? 'bg-lion-500 text-gray-950 hover:bg-lion-600' : '',
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
