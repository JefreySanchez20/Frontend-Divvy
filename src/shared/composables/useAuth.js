import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/auth/stores/useAuthStore'

/** Fachada de conveniencia sobre useAuthStore para usar en componentes. */
export function useAuth() {
  const store = useAuthStore()
  const { currentUser, estaAutenticado, cargando, error } = storeToRefs(store)

  return {
    currentUser,
    estaAutenticado,
    cargando,
    error,
    iniciarSesion: store.iniciarSesion,
    registrar: store.registrar,
    cerrarSesion: store.cerrarSesion,
  }
}
