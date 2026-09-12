import { defineStore } from 'pinia'
import * as gruposApi from '../services/gruposApi'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

const MONEDAS_STORAGE_KEY = 'divvy_monedas_grupo'

function leerMonedas() {
  try {
    return JSON.parse(localStorage.getItem(MONEDAS_STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export const useGruposStore = defineStore('grupos', {
  state: () => ({
    grupos: [],
    grupoActual: null,
    monedasPorGrupo: leerMonedas(),
    cargando: false,
    error: null,
  }),

  actions: {
    /**
     * El backend no guarda moneda a nivel de grupo (currency solo existe en
     * Expense y no se valida contra mezclas). La fijamos acá, en el cliente,
     * la primera vez que se crea el grupo, y la reusamos en cada gasto.
     */
    obtenerMoneda(groupId) {
      return this.monedasPorGrupo[groupId] ?? 'PEN'
    },

    guardarMoneda(groupId, moneda) {
      this.monedasPorGrupo[groupId] = moneda
      localStorage.setItem(MONEDAS_STORAGE_KEY, JSON.stringify(this.monedasPorGrupo))
    },

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
      const grupo = await gruposApi.crearGrupo({ name })
      this.guardarMoneda(grupo.id, moneda)
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
