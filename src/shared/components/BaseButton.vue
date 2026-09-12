<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="rounded-md px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    :class="
      variant === 'primary'
        ? 'bg-brand text-paper hover:bg-brand-dim hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-none'
        : 'border border-paper-line text-ink hover:bg-paper-dim hover:border-ink-faint'
    "
  >
    <slot />
  </button>
</template>
