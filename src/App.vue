<script setup>
import { onMounted, ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useAuthStore } from '@/auth/stores/useAuthStore'
import { onColdStart } from '@/shared/services/httpClient'
import BrandMark from '@/shared/components/BrandMark.vue'
import AvatarInicial from '@/shared/components/AvatarInicial.vue'

const { currentUser, estaAutenticado, cerrarSesion } = useAuth()
const despertando = ref(false)

onColdStart((activo) => {
  despertando.value = activo
})

onMounted(() => {
  useAuthStore().restaurarSesion()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header
      v-if="estaAutenticado"
      class="border-b border-paper-line bg-paper px-5 py-3.5 flex items-center justify-between"
    >
      <RouterLink to="/grupos" class="flex items-center gap-2.5">
        <BrandMark tamaño="sm" />
        <span class="text-lg font-semibold text-brand tracking-tight">Divvy</span>
      </RouterLink>

      <div class="flex items-center gap-3">
        <AvatarInicial v-if="currentUser" :nombre="currentUser.name" tamaño="sm" />
        <span v-if="currentUser" class="text-sm text-ink-soft hidden sm:inline">{{ currentUser.name }}</span>
        <button
          type="button"
          class="text-sm text-ink-faint hover:text-debe transition-colors"
          @click="cerrarSesion"
        >
          Salir
        </button>
      </div>
    </header>

    <div
      v-if="despertando"
      class="bg-brass-tint text-ink text-sm px-5 py-2 text-center"
    >
      El servidor estaba dormido — puede tardar hasta un minuto en responder.
    </div>

    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
