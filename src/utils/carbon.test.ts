import { describe, expect, it } from 'vitest'
import { calculateTonsFromUnits, calculateUnitsFromKg, calculateUnitsFromTons, commissionMultiplier } from './carbon'

/**
 * Estas fórmulas deben dar lo mismo que el backend (shared/finance/pricing.js):
 * la web muestra unidades y precio, y el servidor cobra. Si divergen, la persona ve
 * una cifra y paga otra.
 */
describe('calculateUnitsFromTons (B2B)', () => {
  it('convierte toneladas a unidades físicas, igual que el backend (2 t a 20 kg/unidad = 100)', () => {
    expect(calculateUnitsFromTons(2, 20)).toBe(100)
  })

  it('redondea hacia arriba: no se puede comprar media unidad', () => {
    expect(calculateUnitsFromTons(1, 30)).toBe(34)
    expect(calculateUnitsFromTons(0.001, 20)).toBe(1)
  })

  it('sin captura por unidad válida devuelve 0 en vez de Infinity o NaN', () => {
    expect(calculateUnitsFromTons(2, 0)).toBe(0)
    expect(calculateUnitsFromTons(2, -5)).toBe(0)
    expect(calculateUnitsFromTons(2, NaN)).toBe(0)
  })

  it('0 toneladas son 0 unidades', () => {
    expect(calculateUnitsFromTons(0, 20)).toBe(0)
  })
})

describe('calculateUnitsFromKg (B2C)', () => {
  it('convierte kilos a unidades físicas redondeando hacia arriba', () => {
    expect(calculateUnitsFromKg(500, 20)).toBe(25)
    expect(calculateUnitsFromKg(501, 20)).toBe(26)
  })

  it('sin captura por unidad válida devuelve 0', () => {
    expect(calculateUnitsFromKg(500, 0)).toBe(0)
    expect(calculateUnitsFromKg(500, -1)).toBe(0)
  })

  it('es coherente con la versión en toneladas', () => {
    expect(calculateUnitsFromKg(2000, 20)).toBe(calculateUnitsFromTons(2, 20))
  })
})

describe('calculateTonsFromUnits', () => {
  it('convierte unidades a toneladas con dos decimales', () => {
    expect(calculateTonsFromUnits(100, 20)).toBe(2)
    expect(calculateTonsFromUnits(75, 20)).toBe(1.5)
    expect(calculateTonsFromUnits(1, 7)).toBe(0.01)
  })

  it('sin captura por unidad válida devuelve 0', () => {
    expect(calculateTonsFromUnits(100, 0)).toBe(0)
    expect(calculateTonsFromUnits(100, -3)).toBe(0)
  })
})

describe('commissionMultiplier', () => {
  it('con 20 % de comisión el precio es costo ÷ 0,8 (multiplicador 1,25)', () => {
    expect(commissionMultiplier(20)).toBeCloseTo(1.25, 10)
  })

  it('con 0 % el precio es el costo', () => {
    expect(commissionMultiplier(0)).toBe(1)
  })

  it('limita la comisión a 95 % para no dividir por cero', () => {
    expect(commissionMultiplier(100)).toBeCloseTo(20, 10)
    expect(commissionMultiplier(500)).toBeCloseTo(20, 10)
    expect(Number.isFinite(commissionMultiplier(100))).toBe(true)
  })

  it('una comisión negativa se trata como 0 %', () => {
    expect(commissionMultiplier(-10)).toBe(1)
  })

  it('un valor que no es número usa la comisión por defecto de 20 %', () => {
    expect(commissionMultiplier(NaN)).toBeCloseTo(1.25, 10)
    expect(commissionMultiplier(Infinity)).toBeCloseTo(1.25, 10)
  })
})
