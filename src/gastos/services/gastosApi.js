import { httpClient } from '@/shared/services/httpClient'

export async function listarGastos(groupId) {
  const { data } = await httpClient.get(`/api/groups/${groupId}/expenses`)
  return data
}

export async function crearGasto(groupId, gasto) {
  const { data } = await httpClient.post(`/api/groups/${groupId}/expenses`, gasto)
  return data
}

export async function actualizarGasto(groupId, gastoId, gasto) {
  const { data } = await httpClient.put(`/api/groups/${groupId}/expenses/${gastoId}`, gasto)
  return data
}

export async function eliminarGasto(groupId, gastoId) {
  await httpClient.delete(`/api/groups/${groupId}/expenses/${gastoId}`)
}
