import { describe, expect, it } from 'vitest'
import { formatCLP, formatCLPPerTon } from './currency'

// Intl pone un espacio duro entre el símbolo y el número según la versión de ICU;
// se normaliza para que el test no dependa de eso.
const plain = (text: string) => text.replace(/ /g, ' ')

describe('formatCLP', () => {
  it('usa punto como separador de miles y sin decimales', () => {
    expect(plain(formatCLP(641156))).toMatch(/^\$ ?641\.156$/)
  })

  it('redondea a pesos enteros', () => {
    expect(plain(formatCLP(1234.6))).toMatch(/^\$ ?1\.235$/)
    expect(plain(formatCLP(1234.4))).toMatch(/^\$ ?1\.234$/)
  })

  it('formatea cero como un monto, no como vacío', () => {
    expect(plain(formatCLP(0))).toMatch(/^\$ ?0$/)
  })

  it('null y undefined muestran una raya, no "$0"', () => {
    expect(formatCLP(null)).toBe('—')
    expect(formatCLP(undefined)).toBe('—')
  })

  it('un monto negativo lleva signo', () => {
    expect(plain(formatCLP(-5000))).toContain('-')
  })
})

describe('formatCLPPerTon', () => {
  it('agrega la unidad por tonelada', () => {
    expect(plain(formatCLPPerTon(390000))).toMatch(/^\$ ?390\.000 \/ ton$/)
  })

  it('null y undefined muestran una raya', () => {
    expect(formatCLPPerTon(null)).toBe('—')
    expect(formatCLPPerTon(undefined)).toBe('—')
  })
})
