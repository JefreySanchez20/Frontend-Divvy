<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLiquidacionesStore } from '../stores/useLiquidacionesStore'
import HistorialLiquidaciones from '../components/HistorialLiquidaciones.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const props = defineProps({ id: { type: String, required: true } })

const store = useLiquidacionesStore()
const { historial, cargandoHistorial, errorHistorial } = storeToRefs(store)

onMounted(() => store.cargarHistorial(props.id))
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <RouterLink
      :to="{ name: 'liquidaciones', params: { id } }"
      class="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand transition-colors mb-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Liquidaciones
    </RouterLink>

    <h1 class="text-xl font-semibold text-ink mb-2">Historial de cálculos</h1>
    <p class="text-sm text-ink-faint mb-6">
      Cada vez que alguien abre las liquidaciones se guarda un cálculo. Aquí ves los anteriores, del más reciente al más antiguo.
    </p>

    <BaseAlert v-if="errorHistorial" variant="error" class="mb-6">{{ errorHistorial }}</BaseAlert>
    <p v-if="cargandoHistorial" class="text-sm text-ink-faint">Cargando historial…</p>
    <p v-else-if="!historial.length && !errorHistorial" class="text-sm text-ink-soft">
      Todavía no hay cálculos guardados para este grupo.
    </p>
    <HistorialLiquidaciones v-else :entradas="historial" />
  </div>
</template>
