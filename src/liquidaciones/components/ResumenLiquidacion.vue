<script setup>
import { computed } from 'vue'
import { formatearMonto } from '@/shared/utils/dinero'
import DeudaCard from './DeudaCard.vue'

const props = defineProps({
  deudas: { type: Array, required: true },
  usuarioActualId: { type: String, default: null },
  pagandoId: { type: String, default: null },
})
const emit = defineEmits(['pagar'])

const esMia = (d) => d.debtorId === props.usuarioActualId || d.creditorId === props.usuarioActualId

const misDeudas = computed(() => props.deudas.filter(esMia))
const otrasDeudas = computed(() => props.deudas.filter((d) => !esMia(d)))

/** Suma en centavos por moneda, solo de deudas pendientes (las pagadas ya no cuentan). */
function totalesPorMoneda(campo) {
  const centavos = {}
  for (const d of props.deudas) {
    if (d.status !== 'PENDING' || d[campo] !== props.usuarioActualId) continue
    centavos[d.currency] = (centavos[d.currency] ?? 0) + Math.round(Number(d.amount) * 100)
  }
  return Object.entries(centavos).map(([moneda, c]) => ({ moneda, monto: c / 100 }))
}

const debo = computed(() => totalesPorMoneda('debtorId'))
const meDeben = computed(() => totalesPorMoneda('creditorId'))
const hayPendientes = computed(() => props.deudas.some((d) => d.status === 'PENDING'))
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="rounded-md bg-debe-tint px-4 py-3.5" data-testid="resumen-debo">
        <p class="text-xs text-debe mb-1">Debes</p>
        <p v-if="!debo.length" class="text-sm text-ink-faint">Nada pendiente</p>
        <p v-for="t in debo" :key="t.moneda" class="cifra text-lg font-medium text-debe">
          {{ formatearMonto(t.monto) }} <span class="text-xs">{{ t.moneda }}</span>
        </p>
      </div>
      <div class="rounded-md bg-haber-tint px-4 py-3.5" data-testid="resumen-me-deben">
        <p class="text-xs text-haber mb-1">Te deben</p>
        <p v-if="!meDeben.length" class="text-sm text-ink-faint">Nada pendiente</p>
        <p v-for="t in meDeben" :key="t.moneda" class="cifra text-lg font-medium text-haber">
          {{ formatearMonto(t.monto) }} <span class="text-xs">{{ t.moneda }}</span>
        </p>
      </div>
    </div>

    <p v-if="!deudas.length" class="text-sm text-ink-soft">
      Están a mano: no hay deudas entre los miembros del grupo.
    </p>
    <p v-else-if="!hayPendientes" class="text-sm text-haber mb-6">Todas las deudas de este cálculo están pagadas.</p>

    <section v-if="misDeudas.length" class="mb-8">
      <h2 class="text-sm font-medium text-ink-soft mb-2">Tus deudas</h2>
      <ul>
        <DeudaCard
          v-for="deuda in misDeudas"
          :key="deuda.id"
          :deuda="deuda"
          :usuario-actual-id="usuarioActualId"
          :pagando="pagandoId === deuda.id"
          @pagar="emit('pagar', $event)"
        />
      </ul>
    </section>

    <section v-if="otrasDeudas.length">
      <h2 class="text-sm font-medium text-ink-soft mb-2">Otras deudas del grupo</h2>
      <ul>
        <DeudaCard v-for="deuda in otrasDeudas" :key="deuda.id" :deuda="deuda" :usuario-actual-id="usuarioActualId" />
      </ul>
    </section>
  </div>
</template>
