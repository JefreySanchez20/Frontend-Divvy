<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGruposStore } from '@/grupos/stores/useGruposStore'
import { useLiquidacionesStore } from '../stores/useLiquidacionesStore'
import { useAuth } from '@/shared/composables/useAuth'
import ResumenLiquidacion from '../components/ResumenLiquidacion.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const props = defineProps({ id: { type: String, required: true } })

const gruposStore = useGruposStore()
const liquidacionesStore = useLiquidacionesStore()
const { grupoActual } = storeToRefs(gruposStore)
const { deudas, liquidacion, cargando, error, pagandoId } = storeToRefs(liquidacionesStore)
const { currentUser } = useAuth()

const errorPago = ref('')

// Se calcula UNA vez al entrar (el GET guarda historial en el backend).
onMounted(() => {
  if (grupoActual.value?.id !== props.id) gruposStore.cargarGrupo(props.id)
  liquidacionesStore.calcular(props.id)
})

// Acción del usuario (no automática): recalcula, p. ej. tras "liquidación desactualizada".
async function onActualizar() {
  errorPago.value = ''
  await liquidacionesStore.calcular(props.id)
}

async function onPagar(deuda) {
  errorPago.value = ''
  try {
    await liquidacionesStore.pagar(deuda.id)
  } catch (err) {
    errorPago.value = err.message
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <RouterLink
      :to="{ name: 'grupo-detalle', params: { id } }"
      class="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand transition-colors mb-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {{ grupoActual?.name ?? 'Grupo' }}
    </RouterLink>

    <h1 class="text-xl font-semibold text-ink mb-6">Liquidaciones</h1>

    <BaseAlert v-if="error" variant="error" class="mb-6">{{ error }}</BaseAlert>
    <BaseAlert v-if="errorPago" variant="error" class="mb-6">
      <div class="flex items-center justify-between gap-4">
        <span>{{ errorPago }}</span>
        <button type="button" class="shrink-0 underline underline-offset-2" @click="onActualizar">
          Actualizar deudas
        </button>
      </div>
    </BaseAlert>

    <p v-if="cargando" class="text-sm text-ink-faint">Calculando quién le debe a quién…</p>

    <ResumenLiquidacion
      v-else-if="liquidacion"
      :deudas="deudas"
      :usuario-actual-id="currentUser?.id ?? null"
      :pagando-id="pagandoId"
      @pagar="onPagar"
    />
  </div>
</template>
