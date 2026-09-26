import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import GastoForm from './GastoForm.vue'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'
import { useGastosStore } from '../stores/useGastosStore'

vi.mock('@/shared/composables/useAuth', () => ({
  useAuth: () => ({ currentUser: { value: { id: 'ana' } } }),
}))

const members = [
  { userId: 'ana', role: 'ADMIN' },
  { userId: 'luis', role: 'MEMBER' },
]

function montar() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const cache = useUsuariosCacheStore()
  cache.guardar({ id: 'ana', name: 'Ana', email: 'ana@x.com' })
  cache.guardar({ id: 'luis', name: 'Luis', email: 'luis@x.com' })
  const crear = vi.spyOn(useGastosStore(), 'crear').mockResolvedValue({ id: 'g1' })
  const utils = render(GastoForm, {
    props: { groupId: 'grupo1', members, moneda: 'PEN' },
    global: { plugins: [pinia] },
  })
  return { crear, ...utils }
}

describe('GastoForm', () => {
  beforeEach(() => localStorage.clear())

  it('muestra la moneda fija del grupo sin permitir cambiarla', () => {
    montar()
    expect(screen.getByLabelText('Monto (PEN)')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: /moneda/i })).toBeNull()
  })

  it('no envía si falta la descripción', async () => {
    const { crear } = montar()
    await fireEvent.update(screen.getByLabelText('Monto (PEN)'), '100')
    await fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }))
    expect(screen.getByText('Escribe una descripción.')).toBeTruthy()
    expect(crear).not.toHaveBeenCalled()
  })

  it('envía partes iguales repartiendo los centavos', async () => {
    const { crear } = montar()
    await fireEvent.update(screen.getByLabelText('Descripción'), 'Cena')
    await fireEvent.update(screen.getByLabelText('Monto (PEN)'), '100.01')
    await fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }))

    await waitFor(() => expect(crear).toHaveBeenCalledOnce())
    const [groupId, payload] = crear.mock.calls[0]
    expect(groupId).toBe('grupo1')
    expect(payload).toMatchObject({
      description: 'Cena',
      amount: 100.01,
      currency: 'PEN',
      paidBy: 'ana',
      division: { type: 'EQUAL', details: { ana: 50.01, luis: 50 } },
    })
  })

  it('bloquea montos fijos que no suman el total y dice cuánto falta', async () => {
    const { crear } = montar()
    await fireEvent.update(screen.getByLabelText('Descripción'), 'Super')
    await fireEvent.update(screen.getByLabelText('Monto (PEN)'), '150')
    await fireEvent.click(screen.getByRole('radio', { name: 'Montos fijos' }))
    await fireEvent.update(screen.getByLabelText('Ana'), '100')

    expect(screen.getByRole('status').textContent).toMatch(/Falta 50\.00 PEN/)
    await fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }))
    expect(crear).not.toHaveBeenCalled()
    // El indicador ya lo dice: no se repite en una alerta aparte.
    expect(screen.getByRole('status').textContent).toMatch(/Falta 50\.00 PEN/)
    expect(screen.queryByText(/Los montos suman/)).toBeNull()
  })

  it('envía porcentajes (no montos) cuando suman 100', async () => {
    const { crear } = montar()
    await fireEvent.update(screen.getByLabelText('Descripción'), 'Luz')
    await fireEvent.update(screen.getByLabelText('Monto (PEN)'), '200')
    await fireEvent.click(screen.getByRole('radio', { name: 'Porcentajes' }))
    await fireEvent.update(screen.getByLabelText('Ana'), '70')
    await fireEvent.update(screen.getByLabelText('Luis'), '30')
    await fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }))

    await waitFor(() => expect(crear).toHaveBeenCalledOnce())
    expect(crear.mock.calls[0][1].division).toEqual({
      type: 'PERCENTAGE',
      details: { ana: 70, luis: 30 },
    })
  })
})
