<script setup>
defineProps({
  variant: { type: String, default: 'error' }, // error | info
})
</script>

<template>
  <div
    class="rounded-md px-3.5 py-2.5 text-sm"
    :class="variant === 'error' ? 'bg-debe-tint text-debe' : 'bg-brand-tint text-brand-dim'"
  >
    <slot />
  </div>
</template>
