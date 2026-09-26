<script setup>
import BrandMark from '@/shared/components/BrandMark.vue'

defineProps({
  subtitulo: { type: String, required: true },
})
</script>

<template>
  <div class="ledger-sheet min-h-screen flex items-center justify-center px-6 py-16 sm:pl-[132px] sm:pr-10">
    <div class="w-full max-w-sm">
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-3">
          <BrandMark />
          <h1 class="text-2xl font-semibold text-brand tracking-tight">Divvy</h1>
        </div>
        <p class="text-sm text-ink-soft">{{ subtitulo }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>
