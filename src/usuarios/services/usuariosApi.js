import { httpClient } from '@/shared/services/httpClient'

export async function buscarUsuarioPorEmail(email) {
  const { data } = await httpClient.get('/api/users', { params: { email } })
  return data
}

/** Resuelve varios usuarios de una sola vez. Ids que no existen se omiten, sin error. */
export async function buscarUsuariosPorIds(ids) {
  const { data } = await httpClient.get('/api/users/batch', { params: { ids: ids.join(',') } })
  return data
}
