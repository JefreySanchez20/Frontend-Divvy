/** Monto del backend (número JSON: 150 o 150.5) → "150.00" / "150.50". */
export function formatearMonto(monto) {
  return Number(monto).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
