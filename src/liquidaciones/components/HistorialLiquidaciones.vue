<script setup>
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'
import { formatearMonto } from '@/shared/utils/dinero'

defineProps({
  entradas: { type: Array, required: true }, // más reciente primero (orden del backend)
})

const usuariosCache = useUsuariosCacheStore()

const formatearFechaHora = (fecha) =>
  new Date(fecha).toLocaleString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function resumen(deudas) {
  if (!deudas.length) return 'Sin deudas'
  const pagadas = deudas.filter((d) => d.status === 'PAID').length
  const pendientes = deudas.length - pagadas
  const partes = []
  if (pendientes) partes.push(`${pendientes} pendiente${pendientes === 1 ? '' : 's'}`)
  if (pagadas) partes.push(`${pagadas} pagada${pagadas === 1 ? '' : 's'}`)
  return partes.join(' · ')
}
</script>

<template>
  <ul>
    <li v-for="entrada in entradas" :key="entrada.id" class="border-b border-paper-line py-3.5">
      <details>
        <summary class="flex items-center justify-between gap-4 cursor-pointer list-none">
          <span class="text-sm text-ink">{{ formatearFechaHora(entrada.calculatedAt) }}</span>
          <span class="text-xs text-ink-faint">{{ resumen(entrada.debts) }}</span>
        </summary>

        <ul v-if="entrada.debts.length" class="mt-3 space-y-1.5">
          <li v-for="deuda in entrada.debts" :key="deuda.id" class="flex items-center justify-between gap-4 text-sm">
            <span :class="deuda.status === 'PAID' ? 'text-ink-faint' : 'text-ink'">
              {{ usuariosCache.resolverNombre(deuda.debtorId) }} le debe a
              {{ usuariosCache.resolverNombre(deuda.creditorId) }}
              <span v-if="deuda.status === 'PAID'" class="text-haber text-xs">· pagada</span>
            </span>
            <span class="cifra" :class="deuda.status === 'PAID' ? 'text-ink-faint line-through' : 'text-ink'">
              {{ formatearMonto(deuda.amount) }} {{ deuda.currency }}
            </span>
          </li>
        </ul>
        <p v-else class="mt-3 text-sm text-ink-soft">Todas las cuentas estaban saldadas en este cálculo.</p>
      </details>
    </li>
  </ul>
</template>
