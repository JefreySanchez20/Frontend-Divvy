import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as api from '../services/liquidacionesApi'
import { useLiquidacionesStore } from './useLiquidacionesStore'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'

vi.mock('../services/liquidacionesApi')

const liquidacion = (estado = 'PENDING') => ({
  id: 'liq1',
  groupId: 'g1',
  calculatedAt: '2026-09-25T17:00:00Z',
  debts: [{ id: 'd1', debtorId: 'ana', creditorId: 'luis', amount: 50, currency: 'PEN', status: estado, paidAt: null }],
})

describe('useLiquidacionesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.spyOn(useUsuariosCacheStore(), 'resolverIds').mockResolvedValue()
  })

  it('calcular guarda la liquidación y resuelve los nombres de deudor y acreedor', async () => {
    api.calcularLiquidacion.mockResolvedValue(liquidacion())
    const store = useLiquidacionesStore()
    await store.calcular('g1')
    expect(store.deudas).toHaveLength(1)
    expect(useUsuariosCacheStore().resolverIds).toHaveBeenCalledWith(['ana', 'luis'])
  })

  it('no dispara un segundo cálculo mientras hay uno en curso (el GET guarda historial)', async () => {
    let resolver
    api.calcularLiquidacion.mockReturnValue(new Promise((r) => (resolver = r)))
    const store = useLiquidacionesStore()
    const primero = store.calcular('g1')
    await store.calcular('g1')
    resolver(liquidacion())
    await primero
    expect(api.calcularLiquidacion).toHaveBeenCalledTimes(1)
  })

  it('un error de red queda en `error` y no rompe', async () => {
    api.calcularLiquidacion.mockRejectedValue({ message: 'No se pudo conectar con el servidor.' })
    const store = useLiquidacionesStore()
    await store.calcular('g1')
    expect(store.error).toBe('No se pudo conectar con el servidor.')
    expect(store.liquidacion).toBeNull()
    expect(store.cargando).toBe(false)
  })

  it('pagar reemplaza la liquidación con la respuesta, sin recalcular', async () => {
    api.calcularLiquidacion.mockResolvedValue(liquidacion())
    api.pagarDeuda.mockResolvedValue(liquidacion('PAID'))
    const store = useLiquidacionesStore()
    await store.calcular('g1')
    await store.pagar('d1')
    expect(api.pagarDeuda).toHaveBeenCalledWith('liq1', 'd1')
    expect(store.deudas[0].status).toBe('PAID')
    expect(api.calcularLiquidacion).toHaveBeenCalledTimes(1)
    expect(store.pagandoId).toBeNull()
  })

  it('si pagar falla, propaga el error y libera el estado de "guardando"', async () => {
    api.calcularLiquidacion.mockResolvedValue(liquidacion())
    api.pagarDeuda.mockRejectedValue({ message: 'La deuda ya está pagada' })
    const store = useLiquidacionesStore()
    await store.calcular('g1')
    await expect(store.pagar('d1')).rejects.toMatchObject({ message: 'La deuda ya está pagada' })
    expect(store.pagandoId).toBeNull()
    expect(store.deudas[0].status).toBe('PENDING')
  })

  it('cargarHistorial guarda las entradas y resuelve los nombres, sin recalcular', async () => {
    api.obtenerHistorial.mockResolvedValue([liquidacion('PAID'), liquidacion()])
    const store = useLiquidacionesStore()

    await store.cargarHistorial('g1')

    expect(store.historial).toHaveLength(2)
    expect(useUsuariosCacheStore().resolverIds).toHaveBeenCalled()
    expect(api.calcularLiquidacion).not.toHaveBeenCalled()
  })

  it('cargarHistorial: si falla deja el error y el historial vacío', async () => {
    api.obtenerHistorial.mockRejectedValue({ message: 'No se pudo conectar con el servidor.' })
    const store = useLiquidacionesStore()

    await store.cargarHistorial('g1')

    expect(store.errorHistorial).toBe('No se pudo conectar con el servidor.')
    expect(store.historial).toEqual([])
    expect(store.cargandoHistorial).toBe(false)
  })
})
