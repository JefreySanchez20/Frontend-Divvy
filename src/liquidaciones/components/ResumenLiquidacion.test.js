import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import ResumenLiquidacion from './ResumenLiquidacion.vue'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

const deuda = (id, debtorId, creditorId, amount, status = 'PENDING') => ({
  id,
  debtorId,
  creditorId,
  amount,
  currency: 'PEN',
  status,
  paidAt: status === 'PAID' ? '2026-09-25T17:00:00Z' : null,
})

function montar(props) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const cache = useUsuariosCacheStore()
  cache.guardar({ id: 'ana', name: 'Ana', email: 'ana@x.com' })
  cache.guardar({ id: 'luis', name: 'Luis', email: 'luis@x.com' })
  cache.guardar({ id: 'eva', name: 'Eva', email: 'eva@x.com' })
  return render(ResumenLiquidacion, { props, global: { plugins: [pinia] } })
}

describe('ResumenLiquidacion', () => {
  beforeEach(() => localStorage.clear())

  it('deudor: ve "Le debes a" y el total en "Debes"', () => {
    montar({ usuarioActualId: 'ana', deudas: [deuda('d1', 'ana', 'luis', 75.5)] })
    expect(screen.getByText(/Le debes a/)).toBeTruthy()
    expect(within(screen.getByTestId('resumen-debo')).getByText(/75\.50/)).toBeTruthy()
    expect(within(screen.getByTestId('resumen-me-deben')).getByText('Nada pendiente')).toBeTruthy()
  })

  it('acreedor: ve "te debe" y el total en "Te deben"', () => {
    montar({ usuarioActualId: 'luis', deudas: [deuda('d1', 'ana', 'luis', 75.5)] })
    expect(screen.getByText(/te debe/)).toBeTruthy()
    expect(within(screen.getByTestId('resumen-me-deben')).getByText(/75\.50/)).toBeTruthy()
  })

  it('suma varias deudas pendientes y excluye las ya pagadas', () => {
    montar({
      usuarioActualId: 'ana',
      deudas: [
        deuda('d1', 'ana', 'luis', 10.1),
        deuda('d2', 'ana', 'eva', 20.2),
        deuda('d3', 'ana', 'eva', 99, 'PAID'),
      ],
    })
    expect(within(screen.getByTestId('resumen-debo')).getByText(/30\.30/)).toBeTruthy()
  })

  it('separa las deudas ajenas y no ofrece pagarlas', () => {
    montar({ usuarioActualId: 'ana', deudas: [deuda('d1', 'luis', 'eva', 40)] })
    expect(screen.getByText('Otras deudas del grupo')).toBeTruthy()
    expect(screen.queryByText('Tus deudas')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('el deudor y el acreedor pueden marcar como pagada, con texto distinto', () => {
    const deudas = [deuda('d1', 'ana', 'luis', 50)]
    const { unmount } = montar({ usuarioActualId: 'ana', deudas })
    expect(screen.getByRole('button', { name: 'Marcar como pagada' })).toBeTruthy()
    unmount()
    montar({ usuarioActualId: 'luis', deudas })
    expect(screen.getByRole('button', { name: 'Confirmar que recibí el pago' })).toBeTruthy()
  })

  it('emite "pagar" con la deuda al pulsar el botón', async () => {
    const d = deuda('d1', 'ana', 'luis', 50)
    const { emitted } = montar({ usuarioActualId: 'ana', deudas: [d] })
    await fireEvent.click(screen.getByRole('button', { name: 'Marcar como pagada' }))
    expect(emitted().pagar[0]).toEqual([d])
  })

  it('una deuda pagada no ofrece botón y muestra "Pagada"', () => {
    montar({ usuarioActualId: 'ana', deudas: [deuda('d1', 'ana', 'luis', 50, 'PAID')] })
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText(/Pagada/)).toBeTruthy()
    expect(screen.getByText(/Todas las deudas de este cálculo están pagadas/)).toBeTruthy()
  })

  it('sin deudas: muestra que están a mano', () => {
    montar({ usuarioActualId: 'ana', deudas: [] })
    expect(screen.getByText(/Están a mano/)).toBeTruthy()
  })

  it('deshabilita el botón de la deuda que se está guardando', () => {
    montar({ usuarioActualId: 'ana', deudas: [deuda('d1', 'ana', 'luis', 50)], pagandoId: 'd1' })
    expect(screen.getByRole('button', { name: 'Guardando…' }).disabled).toBe(true)
  })
})
