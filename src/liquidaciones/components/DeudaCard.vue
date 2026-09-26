<script setup>
import { computed } from 'vue'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'
import { formatearMonto } from '@/shared/utils/dinero'
import BaseButton from '@/shared/components/BaseButton.vue'

const props = defineProps({
  deuda: { type: Object, required: true },
  usuarioActualId: { type: String, default: null },
  pagando: { type: Boolean, default: false },
})
const emit = defineEmits(['pagar'])

const usuariosCache = useUsuariosCacheStore()

const soyDeudor = computed(() => props.deuda.debtorId === props.usuarioActualId)
const soyAcreedor = computed(() => props.deuda.creditorId === props.usuarioActualId)
const pagada = computed(() => props.deuda.status === 'PAID')
const nombreDeudor = computed(() => usuariosCache.resolverNombre(props.deuda.debtorId))
const nombreAcreedor = computed(() => usuariosCache.resolverNombre(props.deuda.creditorId))

const fechaPago = computed(() =>
  props.deuda.paidAt
    ? new Date(props.deuda.paidAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
    : '',
)

// Rojo = tú debes, verde = te deben, neutro = deuda ajena o ya pagada.
const acento = computed(() => {
  if (pagada.value) return 'border-paper-line'
  if (soyDeudor.value) return 'border-debe'
  if (soyAcreedor.value) return 'border-haber'
  return 'border-paper-line'
})
const colorMonto = computed(() => {
  if (pagada.value) return 'text-ink-faint line-through'
  if (soyDeudor.value) return 'text-debe'
  if (soyAcreedor.value) return 'text-haber'
  return 'text-ink'
})
</script>

<template>
  <li class="flex items-center justify-between gap-4 border-l-2 border-b border-b-paper-line pl-4 py-3.5" :class="acento">
    <div class="min-w-0">
      <p class="text-sm text-ink" :class="{ 'text-ink-faint': pagada }">
        <template v-if="soyDeudor">Le debes a <strong class="font-medium">{{ nombreAcreedor }}</strong></template>
        <template v-else-if="soyAcreedor"><strong class="font-medium">{{ nombreDeudor }}</strong> te debe</template>
        <template v-else>
          <strong class="font-medium">{{ nombreDeudor }}</strong> le debe a
          <strong class="font-medium">{{ nombreAcreedor }}</strong>
        </template>
      </p>
      <p v-if="pagada" class="text-xs text-haber mt-0.5">Pagada<template v-if="fechaPago"> · {{ fechaPago }}</template></p>
    </div>

    <div class="flex items-center gap-4 shrink-0">
      <p class="cifra text-sm font-medium" :class="colorMonto">
        {{ formatearMonto(deuda.amount) }} <span class="text-ink-faint no-underline">{{ deuda.currency }}</span>
      </p>
      <BaseButton
        v-if="!pagada && (soyDeudor || soyAcreedor)"
        variant="secondary"
        :disabled="pagando"
        @click="emit('pagar', deuda)"
      >
        {{ pagando ? 'Guardando…' : soyDeudor ? 'Marcar como pagada' : 'Confirmar que recibí el pago' }}
      </BaseButton>
    </div>
  </li>
</template>
