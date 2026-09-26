import { defineStore } from 'pinia'
import * as gruposApi from '../services/gruposApi'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

export const useGruposStore = defineStore('grupos', {
  state: () => ({
    grupos: [],
    grupoActual: null,
    cargando: false,
    error: null,
  }),

  actions: {
    async cargarGrupos() {
      this.cargando = true
      this.error = null
      try {
        this.grupos = await gruposApi.listarGrupos()
      } catch (err) {
        this.error = err.message
      } finally {
        this.cargando = false
      }
    },

    async cargarGrupo(id) {
      this.cargando = true
      this.error = null
      // Si el nuevo grupo falla (403/404), no debe verse el anterior bajo esta URL.
      if (this.grupoActual?.id !== id) this.grupoActual = null
      try {
        this.grupoActual = await gruposApi.obtenerGrupo(id)
        const usuariosCache = useUsuariosCacheStore()
        await usuariosCache.resolverIds(this.grupoActual.members.map((m) => m.userId))
      } catch (err) {
        this.error = err.message
      } finally {
        this.cargando = false
      }
    },

    async crear({ name, moneda }) {
      // La moneda es del grupo (la guarda y valida el backend), no del navegador.
      const grupo = await gruposApi.crearGrupo({ name, currency: moneda })
      this.grupos.unshift(grupo)
      return grupo
    },

    async agregarMiembroPorEmail(groupId, email) {
      const usuariosCache = useUsuariosCacheStore()
      const usuario = await usuariosCache.buscarPorEmail(email)
      this.grupoActual = await gruposApi.agregarMiembro(groupId, usuario.id)
      return usuario
    },

    async eliminarMiembro(groupId, userId) {
      await gruposApi.eliminarMiembro(groupId, userId)
      this.grupoActual.members = this.grupoActual.members.filter((m) => m.userId !== userId)
    },

    async archivar(groupId) {
      this.grupoActual = await gruposApi.archivarGrupo(groupId)
      const enLista = this.grupos.find((g) => g.id === groupId)
      if (enLista) enLista.status = 'ARCHIVED'
    },
  },
})
