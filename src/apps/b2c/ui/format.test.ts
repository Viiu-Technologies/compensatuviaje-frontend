import { describe, expect, it } from 'vitest'
import { firstName, fmtCLP, fmtDate, fmtInt, fmtKgAuto, fmtNum, fmtPercent, fmtTons } from './format'

const plain = (text: string) => text.replace(/ /g, ' ')

describe('fmtInt / fmtNum (es-CL: coma decimal, punto de miles)', () => {
  it('redondea y separa miles', () => {
    expect(fmtInt(1234567.6)).toBe('1.234.568')
  })

  it('un valor que no es número cuenta como 0, no como NaN', () => {
    expect(fmtInt('abc')).toBe('0')
    expect(fmtInt(null)).toBe('0')
    expect(fmtInt(undefined)).toBe('0')
    expect(fmtInt(NaN)).toBe('0')
  })

  it('acepta números guardados como texto', () => {
    expect(fmtInt('2500')).toBe('2.500')
  })

  it('fmtNum usa coma decimal y respeta mínimo y máximo de decimales', () => {
    expect(fmtNum(6.44)).toBe('6,4')
    expect(fmtNum(1210.55, 2)).toBe('1.210,55')
    expect(fmtNum(5, 2, 2)).toBe('5,00')
    expect(fmtNum(5)).toBe('5')
  })
})

describe('fmtTons', () => {
  it('muestra toneladas con un decimal', () => {
    expect(fmtTons(6.44)).toBe('6,4 t')
    expect(fmtTons(1234.5)).toBe('1.234,5 t')
  })

  it('bajo 0,1 t muestra dos decimales para no redondear a 0', () => {
    expect(fmtTons(0.05)).toBe('0,05 t')
    expect(fmtTons(-0.05)).toBe('-0,05 t')
  })

  it('0 se muestra como "0 t" y 0,1 mantiene un decimal', () => {
    expect(fmtTons(0)).toBe('0 t')
    expect(fmtTons(0.1)).toBe('0,1 t')
  })
})

describe('fmtKgAuto', () => {
  it('bajo una tonelada muestra kilos', () => {
    expect(fmtKgAuto(380)).toBe('380 kg')
    expect(fmtKgAuto(999)).toBe('999 kg')
  })

  it('desde una tonelada pasa a toneladas', () => {
    expect(fmtKgAuto(1000)).toBe('1 t')
    expect(fmtKgAuto(1200)).toBe('1,2 t')
  })

  it('un valor negativo usa el mismo corte por valor absoluto', () => {
    expect(fmtKgAuto(-1500)).toBe('-1,5 t')
  })

  it('un valor que no es número es 0 kg', () => {
    expect(fmtKgAuto('x')).toBe('0 kg')
  })
})

describe('fmtCLP / fmtPercent', () => {
  it('fmtCLP da pesos sin decimales con punto de miles', () => {
    expect(plain(fmtCLP(18500))).toMatch(/^\$ ?18\.500$/)
    expect(plain(fmtCLP(1234567))).toMatch(/^\$ ?1\.234\.567$/)
  })

  it('fmtCLP de algo que no es número es $0, no NaN', () => {
    expect(plain(fmtCLP('x'))).toMatch(/^\$ ?0$/)
  })

  it('fmtPercent agrega el símbolo con espacio y respeta los decimales pedidos', () => {
    expect(fmtPercent(61)).toBe('61 %')
    expect(fmtPercent(61.46, 1)).toBe('61,5 %')
  })
})

describe('fmtDate', () => {
  it('una fecha sin hora se muestra el mismo día (no se corre por la zona horaria)', () => {
    expect(fmtDate('2026-08-31')).toBe('31 ago 2026')
    expect(fmtDate('2026-01-01')).toBe('1 ene 2026')
  })

  it('el estilo largo escribe el mes completo', () => {
    expect(fmtDate('2026-08-31', 'long')).toBe('31 de agosto de 2026')
  })

  it('una fecha vacía o inválida muestra una raya', () => {
    expect(fmtDate(null)).toBe('—')
    expect(fmtDate(undefined)).toBe('—')
    expect(fmtDate('')).toBe('—')
    expect(fmtDate('no-es-fecha')).toBe('—')
  })

  it('acepta un objeto Date', () => {
    expect(fmtDate(new Date(2026, 10, 5))).toBe('5 nov 2026')
  })
})

describe('firstName', () => {
  it('toma el primer nombre con la inicial en mayúscula', () => {
    expect(firstName('CAMILA ROJAS')).toBe('Camila')
    expect(firstName('  juan  pérez ')).toBe('Juan')
  })

  it('sin nombre usa lo que va antes de la @ del correo', () => {
    expect(firstName('', 'ana.gomez@x.cl')).toBe('Ana.gomez')
    expect(firstName(null, 'bruno@x.cl')).toBe('Bruno')
  })

  it('sin nombre ni correo devuelve texto vacío', () => {
    expect(firstName(null, null)).toBe('')
    expect(firstName()).toBe('')
  })
})
