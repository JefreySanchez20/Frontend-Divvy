import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as gruposApi from '../services/gruposApi'
import { useGruposStore } from './useGruposStore'

vi.mock('../services/gruposApi')

describe('useGruposStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('crear envía la moneda al backend: es del grupo, no del navegador', async () => {
    gruposApi.crearGrupo.mockResolvedValue({ id: 'g1', name: 'Viaje', currency: 'USD', members: [] })
    const store = useGruposStore()

    const grupo = await store.crear({ name: 'Viaje', moneda: 'USD' })

    expect(gruposApi.crearGrupo).toHaveBeenCalledWith({ name: 'Viaje', currency: 'USD' })
    expect(grupo.currency).toBe('USD')
    expect(store.grupos[0].id).toBe('g1')
  })

  it('no guarda la moneda en localStorage', async () => {
    gruposApi.crearGrupo.mockResolvedValue({ id: 'g1', name: 'Viaje', currency: 'USD', members: [] })
    await useGruposStore().crear({ name: 'Viaje', moneda: 'USD' })

    expect(localStorage.length).toBe(0)
  })

  it('cargarGrupo: si el grupo nuevo falla (403), no deja visible el anterior y guarda el error', async () => {
    gruposApi.obtenerGrupo
      .mockResolvedValueOnce({ id: 'g1', name: 'Mío', currency: 'PEN', members: [] })
      .mockRejectedValueOnce({ status: 403, code: 'UNAUTHORIZED_OPERATION', message: 'Debes ser miembro del grupo para ver su detalle' })
    const store = useGruposStore()
    store.$patch({})

    await store.cargarGrupo('g1')
    expect(store.grupoActual.id).toBe('g1')

    await store.cargarGrupo('g2')
    expect(store.grupoActual).toBeNull()
    expect(store.error).toBe('Debes ser miembro del grupo para ver su detalle')
    expect(store.cargando).toBe(false)
  })
})
