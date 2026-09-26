import { describe, expect, it } from 'vitest'
import { aCentesimas, repartirIgual, validarDivision } from './division'

describe('aCentesimas', () => {
  it('convierte texto con hasta 2 decimales a enteros', () => {
    expect(aCentesimas('150')).toBe(15000)
    expect(aCentesimas('12.5')).toBe(1250)
    expect(aCentesimas('12,05')).toBe(1205)
  })

  it('rechaza texto inválido, negativos y más de 2 decimales', () => {
    expect(aCentesimas('')).toBeNull()
    expect(aCentesimas('abc')).toBeNull()
    expect(aCentesimas('-5')).toBeNull()
    expect(aCentesimas('1.234')).toBeNull()
  })
})

describe('repartirIgual', () => {
  it('reparte los centavos sobrantes para que la suma sea exacta', () => {
    const montos = repartirIgual(10000, ['a', 'b', 'c'])
    expect(Object.values(montos)).toEqual([3334, 3333, 3333])
    expect(Object.values(montos).reduce((x, y) => x + y)).toBe(10000)
  })
})

describe('validarDivision', () => {
  it('EQUAL: exige al menos un participante', () => {
    const r = validarDivision({ tipo: 'EQUAL', montoCentesimas: 10000, participantes: [] })
    expect(r.valida).toBe(false)
  })

  it('EQUAL: arma details en decimales que suman el total', () => {
    const r = validarDivision({ tipo: 'EQUAL', montoCentesimas: 10000, participantes: ['a', 'b', 'c'] })
    expect(r.valida).toBe(true)
    expect(r.detalle).toEqual({ a: 33.34, b: 33.33, c: 33.33 })
  })

  it('FIXED_AMOUNT: válido cuando la suma coincide con el monto', () => {
    const r = validarDivision({
      tipo: 'FIXED_AMOUNT',
      montoCentesimas: 15000,
      valores: { a: '100', b: '50' },
    })
    expect(r.valida).toBe(true)
    expect(r.detalle).toEqual({ a: 100, b: 50 })
  })

  it('FIXED_AMOUNT: informa cuánto falta', () => {
    const r = validarDivision({ tipo: 'FIXED_AMOUNT', montoCentesimas: 15000, valores: { a: '100' } })
    expect(r.valida).toBe(false)
    expect(r.restante).toBe(5000)
    expect(r.error).toMatch(/faltan/)
  })

  it('FIXED_AMOUNT: informa cuánto se pasa', () => {
    const r = validarDivision({ tipo: 'FIXED_AMOUNT', montoCentesimas: 15000, valores: { a: '100', b: '60' } })
    expect(r.valida).toBe(false)
    expect(r.restante).toBe(-1000)
    expect(r.error).toMatch(/te pasas/)
  })

  it('FIXED_AMOUNT: evita el error de coma flotante (0.1 + 0.2)', () => {
    const r = validarDivision({ tipo: 'FIXED_AMOUNT', montoCentesimas: 30, valores: { a: '0.10', b: '0.20' } })
    expect(r.valida).toBe(true)
  })

  it('PERCENTAGE: válido cuando suma 100 y manda porcentajes (no montos)', () => {
    const r = validarDivision({
      tipo: 'PERCENTAGE',
      montoCentesimas: 20000,
      valores: { a: '50', b: '30', c: '20' },
    })
    expect(r.valida).toBe(true)
    expect(r.detalle).toEqual({ a: 50, b: 30, c: 20 })
    expect(r.montos).toEqual({ a: 10000, b: 6000, c: 4000 })
  })

  it('PERCENTAGE: rechaza si no suma exactamente 100', () => {
    const r = validarDivision({ tipo: 'PERCENTAGE', montoCentesimas: 20000, valores: { a: '50', b: '30' } })
    expect(r.valida).toBe(false)
    expect(r.restante).toBe(2000)
  })

  it('ignora personas con el campo vacío o en 0', () => {
    const r = validarDivision({
      tipo: 'FIXED_AMOUNT',
      montoCentesimas: 5000,
      valores: { a: '50', b: '', c: '0' },
    })
    expect(r.valida).toBe(true)
    expect(Object.keys(r.detalle)).toEqual(['a'])
  })

  it('rechaza valores que no son números', () => {
    const r = validarDivision({ tipo: 'FIXED_AMOUNT', montoCentesimas: 5000, valores: { a: 'abc' } })
    expect(r.valida).toBe(false)
  })
})
