import { defineStore } from 'pinia'
import * as liquidacionesApi from '../services/liquidacionesApi'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

export const useLiquidacionesStore = defineStore('liquidaciones', {
  state: () => ({
    liquidacion: null,
    cargando: false,
    pagandoId: null,
    error: null,
  }),

  getters: {
    deudas: (state) => state.liquidacion?.debts ?? [],
  },

  actions: {
    /**
     * Cada llamada recalcula y guarda historial en el backend, así que se
     * ignora si ya hay un cálculo en curso (doble clic, re-montaje de la vista).
     */
    async calcular(groupId) {
      if (this.cargando) return
      this.cargando = true
      this.error = null
      this.liquidacion = null
      try {
        const liquidacion = await liquidacionesApi.calcularLiquidacion(groupId)
        // Los nombres son un extra: si no se pueden resolver, resolverNombre() tiene fallback.
        const ids = liquidacion.debts.flatMap((d) => [d.debtorId, d.creditorId])
        await useUsuariosCacheStore().resolverIds(ids).catch(() => {})
        this.liquidacion = liquidacion
      } catch (err) {
        this.error = err.message
      } finally {
        this.cargando = false
      }
    },

    /** Reemplaza la liquidación con la respuesta del backend, sin volver a calcular. */
    async pagar(deudaId) {
      if (this.pagandoId) return
      this.pagandoId = deudaId
      try {
        this.liquidacion = await liquidacionesApi.pagarDeuda(this.liquidacion.id, deudaId)
      } finally {
        this.pagandoId = null
      }
    },
  },
})
