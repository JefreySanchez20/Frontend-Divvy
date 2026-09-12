import axios from 'axios'
import { getToken, clearSession } from './tokenStorage'

const COLD_START_MS = 15000

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 90000,
})

// Callback the app root sets so a slow first request (Render cold start)
// can show a patient loading message instead of looking frozen.
let coldStartHandler = null
export function onColdStart(handler) {
  coldStartHandler = handler
}

// Un solo interceptor de request: Axios ejecuta los interceptores de
// request en orden inverso al que se registran (LIFO), así que separar
// esto en dos `.use()` distintos rompe el orden en el que se arma
// `config.metadata` — se fusiona acá para no depender de ese orden.
httpClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.metadata = {}
  if (coldStartHandler) {
    config.metadata.coldStartTimer = setTimeout(() => coldStartHandler(true), COLD_START_MS)
  }

  return config
})

function clearColdStartTimer(config) {
  if (config?.metadata?.coldStartTimer) {
    clearTimeout(config.metadata.coldStartTimer)
    if (coldStartHandler) coldStartHandler(false)
  }
}

let onUnauthorized = null
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

httpClient.interceptors.response.use(
  (response) => {
    clearColdStartTimer(response.config)
    return response
  },
  (error) => {
    clearColdStartTimer(error.config)

    const status = error.response?.status
    const apiError = error.response?.data

    if (status === 401 && onUnauthorized) {
      clearSession()
      onUnauthorized()
    }

    return Promise.reject({
      status,
      code: apiError?.error ?? 'NETWORK_ERROR',
      message: mensajeParaMostrar(status, apiError),
    })
  },
)

/**
 * El backend documenta sus mensajes en español, pero en la práctica algunos
 * mensajes de VALIDATION_ERROR vienen en inglés (validaciones genéricas de
 * Bean Validation sin traducir) — para esos casos preferimos un mensaje
 * propio en vez de mostrar el texto crudo del backend.
 */
function mensajeParaMostrar(status, apiError) {
  if (apiError?.error === 'VALIDATION_ERROR') {
    return 'Revisa los datos ingresados e intenta de nuevo.'
  }
  if (apiError?.message) return apiError.message
  return errorMessageFor(status)
}

function errorMessageFor(status) {
  if (status === 429) return 'Demasiados intentos. Espera unos minutos y vuelve a intentar.'
  if (!status) return 'No se pudo conectar con el servidor. Prueba de nuevo en un momento.'
  return 'Algo salió mal. Prueba de nuevo.'
}
