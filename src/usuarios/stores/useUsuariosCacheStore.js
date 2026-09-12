import { defineStore } from 'pinia'
import { buscarUsuarioPorEmail, buscarUsuariosPorIds } from '../services/usuariosApi'

const STORAGE_KEY = 'divvy_usuarios_cache'

function leerCachePersistido() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export const useUsuariosCacheStore = defineStore('usuariosCache', {
  state: () => ({
    porId: leerCachePersistido(),
  }),
  actions: {
    guardar(usuario) {
      this.porId[usuario.id] = { name: usuario.name, email: usuario.email }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.porId))
    },

    async buscarPorEmail(email) {
      const usuario = await buscarUsuarioPorEmail(email)
      this.guardar(usuario)
      return usuario
    },

    /**
     * Resuelve en un solo request los ids que todavía no están en cache
     * (por ejemplo, los miembros de un grupo recién cargado). Los que ya
     * están cacheados no se vuelven a pedir.
     */
    async resolverIds(userIds) {
      const pendientes = [...new Set(userIds)].filter((id) => !this.porId[id])
      if (!pendientes.length) return
      const usuarios = await buscarUsuariosPorIds(pendientes)
      usuarios.forEach((usuario) => this.guardar(usuario))
    },

    /** Nombre para mostrar en UI; nunca lanza si el id no está en cache. */
    resolverNombre(userId) {
      return this.porId[userId]?.name ?? `Miembro (${userId.slice(0, 8)})`
    },
  },
})
