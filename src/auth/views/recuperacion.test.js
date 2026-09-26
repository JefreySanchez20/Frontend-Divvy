import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { httpClient } from '@/shared/services/httpClient'
import OlvideContrasenaView from './OlvideContrasenaView.vue'
import RestablecerContrasenaView from './RestablecerContrasenaView.vue'

vi.mock('@/shared/services/httpClient', () => ({ httpClient: { post: vi.fn(), get: vi.fn() } }))

function montar(vista, ruta) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>login</div>' } },
      { path: '/olvide-contrasena', name: 'olvide-contrasena', component: OlvideContrasenaView },
      { path: '/restablecer-contrasena', name: 'restablecer-contrasena', component: RestablecerContrasenaView },
    ],
  })
  router.push(ruta)
  return router.isReady().then(() => ({ router, ...render(vista, { global: { plugins: [pinia, router] } }) }))
}

describe('Olvidé mi contraseña', () => {
  beforeEach(() => vi.resetAllMocks())

  it('envía el email y confirma sin revelar si la cuenta existe', async () => {
    httpClient.post.mockResolvedValue({})
    await montar(OlvideContrasenaView, '/olvide-contrasena')

    await fireEvent.update(screen.getByLabelText('Email de tu cuenta'), 'ana@x.com')
    await fireEvent.click(screen.getByRole('button', { name: 'Enviarme el código' }))

    await waitFor(() => expect(screen.getByText(/Si hay una cuenta con/)).toBeTruthy())
    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email: 'ana@x.com' })
    expect(screen.getByRole('button', { name: 'Ya tengo el código' })).toBeTruthy()
  })

  it('muestra el error si el envío falla', async () => {
    httpClient.post.mockRejectedValue({ status: 429, code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.' })
    await montar(OlvideContrasenaView, '/olvide-contrasena')

    await fireEvent.update(screen.getByLabelText('Email de tu cuenta'), 'ana@x.com')
    await fireEvent.click(screen.getByRole('button', { name: 'Enviarme el código' }))

    await waitFor(() => expect(screen.getByText(/Demasiados intentos/)).toBeTruthy())
  })
})

describe('Restablecer contraseña', () => {
  beforeEach(() => vi.resetAllMocks())

  it('no envía si las contraseñas no coinciden', async () => {
    await montar(RestablecerContrasenaView, '/restablecer-contrasena')

    await fireEvent.update(screen.getByLabelText('Código de 6 caracteres'), 'K7M2PX')
    await fireEvent.update(screen.getByLabelText('Contraseña nueva'), 'NuevaClave1')
    await fireEvent.update(screen.getByLabelText('Confirma la contraseña nueva'), 'OtraClave99')
    await fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy()
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('no envía una contraseña de menos de 8 caracteres', async () => {
    await montar(RestablecerContrasenaView, '/restablecer-contrasena')

    await fireEvent.update(screen.getByLabelText('Código de 6 caracteres'), 'K7M2PX')
    await fireEvent.update(screen.getByLabelText('Contraseña nueva'), 'corta')
    await fireEvent.update(screen.getByLabelText('Confirma la contraseña nueva'), 'corta')
    await fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(screen.getByText(/al menos 8 caracteres/)).toBeTruthy()
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('con datos válidos cambia la contraseña y lleva al login con aviso', async () => {
    httpClient.post.mockResolvedValue({})
    const { router } = await montar(RestablecerContrasenaView, '/restablecer-contrasena')

    await fireEvent.update(screen.getByLabelText('Código de 6 caracteres'), 'k7m2px')
    await fireEvent.update(screen.getByLabelText('Contraseña nueva'), 'NuevaClave1')
    await fireEvent.update(screen.getByLabelText('Confirma la contraseña nueva'), 'NuevaClave1')
    await fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await waitFor(() => expect(router.currentRoute.value.name).toBe('login'))
    expect(router.currentRoute.value.query.restablecida).toBe('1')
    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/reset-password', { token: 'K7M2PX', newPassword: 'NuevaClave1' })
  })

  it('un código vencido muestra el mensaje claro y no navega', async () => {
    httpClient.post.mockRejectedValue({ status: 400, code: 'INVARIANT_VIOLATED', message: 'token inválido' })
    const { router } = await montar(RestablecerContrasenaView, '/restablecer-contrasena')

    await fireEvent.update(screen.getByLabelText('Código de 6 caracteres'), 'AAAAAA')
    await fireEvent.update(screen.getByLabelText('Contraseña nueva'), 'NuevaClave1')
    await fireEvent.update(screen.getByLabelText('Confirma la contraseña nueva'), 'NuevaClave1')
    await fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await waitFor(() => expect(screen.getByText(/El código no es válido o ya expiró/)).toBeTruthy())
    expect(router.currentRoute.value.name).toBe('restablecer-contrasena')
  })
})
