<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-lion-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed select-none',
      // Block
      block ? 'w-full' : '',
      // Sizes
      size === 'sm' ? 'px-2.5 py-1.5 text-xs gap-1.5' : '',
      size === 'md' ? 'px-3.5 py-2 text-sm gap-2' : '',
      size === 'lg' ? 'px-4 py-2.5 text-base gap-2.5' : '',
      // Variants
      variant === 'primary'
        ? 'bg-lion-500 hover:bg-lion-600 active:bg-lion-700 text-gray-950 font-semibold shadow-sm'
        : '',
      variant === 'secondary'
        ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-100 border border-gray-700'
        : '',
      variant === 'outline'
        ? 'border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-200'
        : '',
      variant === 'ghost' ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : '',
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
