/**
 * Lógica pura de división de gastos. Todo se calcula en enteros (centavos, o
 * centésimas de punto porcentual) para evitar errores de coma flotante: la
 * suma tiene que coincidir EXACTA con el total, igual que lo exige el backend.
 */

const REGEX_DECIMAL = /^\d+([.,]\d{1,2})?$/

/** "12.5" | "12,50" → 1250. Devuelve null si no es un número con hasta 2 decimales. */
export function aCentesimas(texto) {
  const limpio = String(texto ?? '').trim()
  if (!REGEX_DECIMAL.test(limpio)) return null
  const [entero, decimales = ''] = limpio.replace(',', '.').split('.')
  return Number(entero) * 100 + Number(decimales.padEnd(2, '0'))
}

export function formatearCentesimas(centesimas) {
  return (centesimas / 100).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Reparte `total` centavos entre `ids`; los centavos sobrantes van a los primeros. */
export function repartirIgual(total, ids) {
  const base = Math.floor(total / ids.length)
  const sobrante = total - base * ids.length
  return Object.fromEntries(ids.map((id, i) => [id, base + (i < sobrante ? 1 : 0)]))
}

function parsearValores(valores) {
  const parseados = {}
  for (const [id, texto] of Object.entries(valores)) {
    if (String(texto ?? '').trim() === '') continue // vacío = no participa
    const centesimas = aCentesimas(texto)
    if (centesimas === null) return { error: 'Hay valores que no son un número válido (máximo 2 decimales).' }
    if (centesimas > 0) parseados[id] = centesimas
  }
  return { parseados }
}

/**
 * Valida la división y arma el `details` que espera la API.
 *
 * @param {object} p
 * @param {'EQUAL'|'PERCENTAGE'|'FIXED_AMOUNT'} p.tipo
 * @param {number|null} p.montoCentesimas  monto total en centavos (null si es inválido)
 * @param {string[]} p.participantes       ids seleccionados (solo EQUAL)
 * @param {Record<string,string>} p.valores  texto por id (solo PERCENTAGE / FIXED_AMOUNT)
 * @returns {{ valida: boolean, error: string, detalle: object|null, restante: number|null, montos: object }}
 *   `restante` es lo que falta (>0) o sobra (<0) para llegar al total, en las mismas
 *   unidades que se ingresan (centavos, o centésimas de % para PERCENTAGE).
 *   `montos` es la vista previa en centavos que le toca a cada persona.
 */
export function validarDivision({ tipo, montoCentesimas, participantes = [], valores = {} }) {
  const invalida = (error, extra = {}) => ({ valida: false, error, detalle: null, restante: null, montos: {}, ...extra })

  if (tipo === 'EQUAL') {
    if (!participantes.length) return invalida('Selecciona al menos un participante.')
    if (!montoCentesimas) return invalida('Ingresa un monto mayor a cero.')
    const montos = repartirIgual(montoCentesimas, participantes)
    return {
      valida: true,
      error: '',
      detalle: Object.fromEntries(Object.entries(montos).map(([id, c]) => [id, c / 100])),
      restante: 0,
      montos,
    }
  }

  const { parseados, error } = parsearValores(valores)
  if (error) return invalida(error)
  const ids = Object.keys(parseados)
  const suma = Object.values(parseados).reduce((a, b) => a + b, 0)

  if (tipo === 'PERCENTAGE') {
    const restante = 10000 - suma
    const montos = montoCentesimas
      ? Object.fromEntries(ids.map((id) => [id, Math.floor((montoCentesimas * parseados[id]) / 10000)]))
      : {}
    if (!ids.length) return invalida('Indica el porcentaje de al menos una persona.', { restante })
    if (restante !== 0) {
      return invalida(
        restante > 0
          ? `Los porcentajes suman ${suma / 100}%: faltan ${restante / 100}% para llegar a 100%.`
          : `Los porcentajes suman ${suma / 100}%: te pasas por ${-restante / 100}%.`,
        { restante, montos },
      )
    }
    return {
      valida: true,
      error: '',
      detalle: Object.fromEntries(ids.map((id) => [id, parseados[id] / 100])),
      restante: 0,
      montos,
    }
  }

  // FIXED_AMOUNT
  if (!montoCentesimas) return invalida('Ingresa un monto mayor a cero.')
  if (!ids.length) return invalida('Indica el monto de al menos una persona.', { restante: montoCentesimas })
  const restante = montoCentesimas - suma
  if (restante !== 0) {
    return invalida(
      restante > 0
        ? `Los montos suman ${formatearCentesimas(suma)}: faltan ${formatearCentesimas(restante)}.`
        : `Los montos suman ${formatearCentesimas(suma)}: te pasas por ${formatearCentesimas(-restante)}.`,
      { restante, montos: parseados },
    )
  }
  return {
    valida: true,
    error: '',
    detalle: Object.fromEntries(ids.map((id) => [id, parseados[id] / 100])),
    restante: 0,
    montos: parseados,
  }
}
