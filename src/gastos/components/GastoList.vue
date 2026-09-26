<script setup>
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'
import { formatearMonto } from '@/shared/utils/dinero'

defineProps({
  gastos: { type: Array, required: true },
  puedeEditar: { type: Boolean, default: false },
})
const emit = defineEmits(['editar', 'eliminar'])

const usuariosCache = useUsuariosCacheStore()

const ETIQUETAS_TIPO = {
  EQUAL: 'Partes iguales',
  PERCENTAGE: 'Por porcentaje',
  FIXED_AMOUNT: 'Montos fijos',
}

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <ul>
    <li v-for="gasto in gastos" :key="gasto.id" class="border-b border-paper-line py-4">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-ink">{{ gasto.description }}</p>
          <p class="text-xs text-ink-faint mt-0.5">
            Pagó {{ usuariosCache.resolverNombre(gasto.paidBy) }} · {{ formatearFecha(gasto.date) }}
            <template v-if="gasto.category"> · {{ gasto.category }}</template>
          </p>
        </div>
        <p class="cifra text-sm font-medium text-ink shrink-0">
          {{ formatearMonto(gasto.amount) }} <span class="text-ink-faint">{{ gasto.currency }}</span>
        </p>
      </div>

      <p class="text-xs text-ink-soft mt-2">
        {{ ETIQUETAS_TIPO[gasto.division.type] }}:
        <template v-for="(monto, userId, i) in gasto.division.details" :key="userId">
          <template v-if="i > 0"> · </template>{{ usuariosCache.resolverNombre(userId) }}
          <span class="cifra">{{ formatearMonto(monto) }}</span>
        </template>
      </p>

      <div v-if="puedeEditar" class="flex gap-4 mt-2">
        <button type="button" class="text-xs text-brand hover:text-brand-dim" @click="emit('editar', gasto)">
          Editar
        </button>
        <button type="button" class="text-xs text-debe hover:text-debe/80" @click="emit('eliminar', gasto)">
          Eliminar
        </button>
      </div>
    </li>
  </ul>
</template>
