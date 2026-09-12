import { httpClient } from '@/shared/services/httpClient'

export async function listarGrupos() {
  const { data } = await httpClient.get('/api/groups')
  return data
}

export async function obtenerGrupo(id) {
  const { data } = await httpClient.get(`/api/groups/${id}`)
  return data
}

export async function crearGrupo({ name }) {
  const { data } = await httpClient.post('/api/groups', { name })
  return data
}

export async function agregarMiembro(groupId, userId) {
  const { data } = await httpClient.post(`/api/groups/${groupId}/members`, { userId })
  return data
}

export async function eliminarMiembro(groupId, userId) {
  await httpClient.delete(`/api/groups/${groupId}/members/${userId}`)
}

export async function archivarGrupo(groupId) {
  const { data } = await httpClient.patch(`/api/groups/${groupId}/archive`)
  return data
}
