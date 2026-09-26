import { defineStore } from 'pinia'
import * as gastosApi from '../services/gastosApi'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

export const useGastosStore = defineStore('gastos', {
  state: () => ({
    gastos: [],
    cargando: false,
    error: null,
  }),

  getters: {
    /** Más recientes primero. */
    ordenados: (state) => [...state.gastos].sort((a, b) => new Date(b.date) - new Date(a.date)),
  },

  actions: {
    async cargar(groupId) {
      this.cargando = true
      this.error = null
      this.gastos = []
      try {
        this.gastos = await gastosApi.listarGastos(groupId)
        // Quien pagó o participó puede ya no ser miembro activo del grupo.
        const ids = this.gastos.flatMap((g) => [g.paidBy, ...Object.keys(g.division.details)])
        await useUsuariosCacheStore().resolverIds(ids)
      } catch (err) {
        this.error = err.message
      } finally {
        this.cargando = false
      }
    },

    async crear(groupId, gasto) {
      const creado = await gastosApi.crearGasto(groupId, gasto)
      this.gastos.push(creado)
      return creado
    },

    async actualizar(groupId, gastoId, gasto) {
      const actualizado = await gastosApi.actualizarGasto(groupId, gastoId, gasto)
      const indice = this.gastos.findIndex((g) => g.id === gastoId)
      if (indice !== -1) this.gastos[indice] = actualizado
      return actualizado
    },

    async eliminar(groupId, gastoId) {
      await gastosApi.eliminarGasto(groupId, gastoId)
      this.gastos = this.gastos.filter((g) => g.id !== gastoId)
    },
  },
})
