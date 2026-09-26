import { httpClient } from '@/shared/services/httpClient'

/**
 * OJO: este GET recalcula y guarda una entrada nueva en el historial del grupo.
 * Llamarlo solo al entrar a la vista o tras un cambio de balance, nunca en polling.
 */
export async function calcularLiquidacion(groupId) {
  const { data } = await httpClient.get(`/api/groups/${groupId}/settlements`)
  return data
}

export async function obtenerHistorial(groupId) {
  const { data } = await httpClient.get(`/api/groups/${groupId}/settlements/history`)
  return data
}

export async function pagarDeuda(liquidacionId, deudaId) {
  const { data } = await httpClient.post(`/api/settlements/${liquidacionId}/debts/${deudaId}/pay`)
  return data
}
