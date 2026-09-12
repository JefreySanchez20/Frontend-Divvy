<script setup>
import { RouterLink } from 'vue-router'
import AvatarInicial from '@/shared/components/AvatarInicial.vue'

defineProps({
  grupo: { type: Object, required: true },
})
</script>

<template>
  <RouterLink
    :to="{ name: 'grupo-detalle', params: { id: grupo.id } }"
    class="flex items-center gap-3 border-b border-paper-line py-4 group"
  >
    <AvatarInicial :nombre="grupo.name" />

    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-ink group-hover:text-brand transition-colors truncate">
        {{ grupo.name }}
      </p>
      <p class="text-xs text-ink-faint mt-0.5">
        {{ grupo.members?.length ?? 0 }} miembro{{ grupo.members?.length === 1 ? '' : 's' }}
      </p>
    </div>

    <span
      class="text-xs px-2 py-1 rounded shrink-0"
      :class="grupo.status === 'ARCHIVED' ? 'bg-paper-dim text-ink-faint' : 'bg-haber-tint text-haber'"
    >
      {{ grupo.status === 'ARCHIVED' ? 'Archivado' : 'Activo' }}
    </span>

    <svg
      class="text-ink-faint group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0"
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  </RouterLink>
</template>
