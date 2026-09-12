<script setup>
defineProps({
  tamaño: { type: String, default: 'md' }, // sm | md
})
</script>

<template>
  <span
    class="inline-flex items-center justify-center rounded-lg bg-brand text-paper font-semibold shrink-0"
    :class="tamaño === 'sm' ? 'w-7 h-7 text-sm' : 'w-10 h-10 text-lg'"
  >
    D
  </span>
</template>
