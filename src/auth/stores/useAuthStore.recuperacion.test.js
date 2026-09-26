import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { httpClient } from '@/shared/services/httpClient'
import { useAuthStore } from './useAuthStore'

vi.mock('@/shared/services/httpClient', () => ({ httpClient: { post: vi.fn(), get: vi.fn() } }))

describe('useAuthStore · recuperación de contraseña', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('solicitarRecuperacion envía el email a forgot-password', async () => {
    httpClient.post.mockResolvedValue({})
    await useAuthStore().solicitarRecuperacion('ana@x.com')
    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email: 'ana@x.com' })
  })

  it('restablecerPassword normaliza el código a mayúsculas y sin espacios', async () => {
    httpClient.post.mockResolvedValue({})
    await useAuthStore().restablecerPassword({ codigo: '  k7m2px ', nuevaPassword: 'NuevaClave1' })
    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/reset-password', {
      token: 'K7M2PX',
      newPassword: 'NuevaClave1',
    })
  })

  it('un código inválido o vencido da un mensaje claro en español', async () => {
    httpClient.post.mockRejectedValue({ status: 400, code: 'INVARIANT_VIOLATED', message: 'El token de recuperación es inválido o ya expiró' })
    const store = useAuthStore()

    await expect(store.restablecerPassword({ codigo: 'AAAAAA', nuevaPassword: 'NuevaClave1' })).rejects.toBeTruthy()

    expect(store.error).toBe('El código no es válido o ya expiró. Pide uno nuevo.')
    expect(store.cargando).toBe(false)
  })

  it('otros errores (p. ej. 429) conservan su mensaje', async () => {
    httpClient.post.mockRejectedValue({ status: 429, code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.' })
    const store = useAuthStore()

    await expect(store.solicitarRecuperacion('ana@x.com')).rejects.toBeTruthy()

    expect(store.error).toMatch(/Demasiados intentos/)
  })
})
