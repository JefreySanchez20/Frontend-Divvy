import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import HistorialLiquidaciones from './HistorialLiquidaciones.vue'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

const deuda = (id, status) => ({ id, debtorId: 'luis', creditorId: 'ana', amount: 50, currency: 'PEN', status, paidAt: null })
const entrada = (id, calculatedAt, debts) => ({ id, groupId: 'g1', calculatedAt, debts })

function montar(entradas) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const cache = useUsuariosCacheStore()
  cache.guardar({ id: 'ana', name: 'Ana', email: 'a@x.com' })
  cache.guardar({ id: 'luis', name: 'Luis', email: 'l@x.com' })
  return render(HistorialLiquidaciones, { props: { entradas }, global: { plugins: [pinia] } })
}

describe('HistorialLiquidaciones', () => {
  beforeEach(() => localStorage.clear())

  it('resume cada cálculo con pendientes y pagadas', () => {
    montar([
      entrada('e2', '2026-09-25T18:00:00Z', [deuda('d1', 'PAID'), deuda('d2', 'PENDING'), deuda('d3', 'PENDING')]),
      entrada('e1', '2026-09-25T17:00:00Z', [deuda('d4', 'PENDING')]),
    ])
    expect(screen.getByText('2 pendientes · 1 pagada')).toBeTruthy()
    expect(screen.getByText('1 pendiente')).toBeTruthy()
  })

  it('un cálculo sin deudas dice que estaba saldado', () => {
    montar([entrada('e1', '2026-09-25T17:00:00Z', [])])
    expect(screen.getByText('Sin deudas')).toBeTruthy()
    expect(screen.getByText(/cuentas estaban saldadas/)).toBeTruthy()
  })

  it('muestra quién le debe a quién, con nombres y montos, y marca las pagadas', () => {
    montar([entrada('e1', '2026-09-25T17:00:00Z', [deuda('d1', 'PAID')])])
    expect(screen.getByText(/Luis le debe a\s+Ana/)).toBeTruthy()
    expect(screen.getByText('50.00 PEN')).toBeTruthy()
    expect(screen.getByText('· pagada')).toBeTruthy()
  })
})
