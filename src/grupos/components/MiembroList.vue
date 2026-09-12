<script setup>
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'
import AvatarInicial from '@/shared/components/AvatarInicial.vue'

defineProps({
  members: { type: Array, required: true },
  puedeEliminar: { type: Boolean, default: false },
})
const emit = defineEmits(['eliminar'])

const usuariosCache = useUsuariosCacheStore()
</script>

<template>
  <ul>
    <li
      v-for="miembro in members"
      :key="miembro.userId"
      class="flex items-center justify-between border-b border-paper-line py-3"
    >
      <div class="flex items-center gap-3">
        <AvatarInicial :nombre="usuariosCache.resolverNombre(miembro.userId)" tamaño="sm" />
        <div>
          <p class="text-sm text-ink">{{ usuariosCache.resolverNombre(miembro.userId) }}</p>
          <p class="text-xs text-ink-faint">{{ miembro.role === 'ADMIN' ? 'Admin' : 'Miembro' }}</p>
        </div>
      </div>
      <button
        v-if="puedeEliminar"
        type="button"
        class="text-xs text-debe hover:text-debe/80"
        @click="emit('eliminar', miembro.userId)"
      >
        Quitar
      </button>
    </li>
  </ul>
</template>
