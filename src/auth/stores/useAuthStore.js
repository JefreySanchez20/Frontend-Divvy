import { defineStore } from 'pinia'
import { httpClient } from '@/shared/services/httpClient'
import { getToken, getSessionEmail, setSession, clearSession } from '@/shared/services/tokenStorage'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    currentUser: null,
    cargando: false,
    error: null,
  }),

  getters: {
    estaAutenticado: (state) => Boolean(state.token),
  },

  actions: {
    async registrar({ name, email, password }) {
      this.cargando = true
      this.error = null
      try {
        await httpClient.post('/api/auth/register', { name, email, password })
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.cargando = false
      }
    },

    async iniciarSesion({ email, password }) {
      this.cargando = true
      this.error = null
      try {
        const { data } = await httpClient.post('/api/auth/login', { email, password })
        this.token = data.token
        setSession(data.token, email)
        await this.cargarPerfil(email)
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.cargando = false
      }
    },

    async cargarPerfil(email) {
      const usuariosCache = useUsuariosCacheStore()
      const usuario = await usuariosCache.buscarPorEmail(email)
      this.currentUser = usuario
      return usuario
    },

    /**
     * Repuebla currentUser tras un refresh de página, si ya había sesión.
     * Si falla por red/cold-start no cerramos la sesión acá: solo un 401
     * real (token inválido/expirado) la cierra, vía setUnauthorizedHandler.
     */
    async restaurarSesion() {
      const email = getSessionEmail()
      if (!this.token || !email) return
      try {
        await this.cargarPerfil(email)
      } catch {
        // se reintenta en la próxima navegación o acción del usuario
      }
    },

    async cerrarSesion() {
      try {
        await httpClient.post('/api/auth/logout')
      } catch {
        // el token ya puede haber expirado; igual limpiamos localmente
      } finally {
        this.cerrarSesionLocal()
      }
    },

    cerrarSesionLocal() {
      clearSession()
      this.token = null
      this.currentUser = null
    },
  },
})
