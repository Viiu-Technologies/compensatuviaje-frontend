import { afterEach, describe, expect, it, vi } from 'vitest'
import { cumulative, formatCLP, formatCLPCompact, formatDayLong, formatDayShort, formatInt, formatPercent, formatTime, kgToTonnes, parseDay, timeAgo } from './format'

const plain = (text: string) => text.replace(/ /g, ' ')

describe('formatInt / formatPercent / formatCLP', () => {
  it('formatInt redondea y separa miles', () => {
    expect(formatInt(1284)).toBe('1.284')
    expect(formatInt(1284567.5)).toBe('1.284.568')
  })

  it('un valor nulo o no numérico es 0', () => {
    expect(formatInt(null)).toBe('0')
    expect(formatInt(undefined)).toBe('0')
    expect(formatInt(NaN)).toBe('0')
  })

  it('formatPercent usa coma decimal y un decimal por defecto', () => {
    expect(formatPercent(61.4)).toBe('61,4 %')
    expect(formatPercent(61.456, 2)).toBe('61,46 %')
    expect(formatPercent(null)).toBe('0 %')
  })

  it('formatCLP da pesos con punto de miles y sin decimales', () => {
    expect(plain(formatCLP(18450000))).toMatch(/^\$ ?18\.450\.000$/)
    expect(plain(formatCLP(null))).toMatch(/^\$ ?0$/)
  })
})

describe('formatCLPCompact (ejes de gráficos)', () => {
  it('desde un millón usa "M" con un decimal', () => {
    expect(formatCLPCompact(18450000)).toBe('$18,5 M')
    expect(formatCLPCompact(1000000)).toBe('$1 M')
  })

  it('desde mil usa "mil" sin decimales', () => {
    expect(formatCLPCompact(2500)).toBe('$3 mil')
    expect(formatCLPCompact(1000)).toBe('$1 mil')
  })

  it('bajo mil muestra el monto completo', () => {
    expect(formatCLPCompact(999)).toBe('$999')
    expect(formatCLPCompact(0)).toBe('$0')
  })

  it('un monto negativo usa el mismo corte por valor absoluto', () => {
    expect(formatCLPCompact(-2000000)).toBe('$-2 M')
  })
})

describe('kgToTonnes', () => {
  it('convierte kilos a toneladas con una decimal', () => {
    expect(kgToTonnes(516900)).toBe('516,9')
    expect(kgToTonnes(1000)).toBe('1')
  })

  it('respeta los decimales pedidos', () => {
    expect(kgToTonnes(1234, 2)).toBe('1,23')
  })

  it('un valor nulo es 0', () => {
    expect(kgToTonnes(null)).toBe('0')
  })
})

describe('fechas', () => {
  it('"2026-09-01" cae el 1 de septiembre, no el día anterior por la zona horaria', () => {
    const day = parseDay('2026-09-01')
    expect([day.getFullYear(), day.getMonth(), day.getDate()]).toEqual([2026, 8, 1])
  })

  it('un valor con hora se interpreta tal cual', () => {
    expect(parseDay('2026-09-01T15:30:00Z').toISOString()).toBe('2026-09-01T15:30:00.000Z')
  })

  it('formatDayShort y formatDayLong escriben el día en español', () => {
    expect(formatDayShort('2026-09-01')).toBe('1 sept')
    expect(formatDayLong('2026-09-01')).toBe('1 de septiembre de 2026')
  })

  it('formatTime usa 24 horas', () => {
    expect(formatTime(new Date(2026, 8, 1, 18, 34))).toBe('18:34')
    expect(formatTime(new Date(2026, 8, 1, 7, 5))).toBe('07:05')
  })
})

describe('cumulative', () => {
  it('acumula una serie', () => {
    expect(cumulative([0, 1, 0, 2])).toEqual([0, 1, 1, 3])
  })

  it('una serie vacía da vacío y los valores nulos suman 0', () => {
    expect(cumulative([])).toEqual([])
    expect(cumulative([1, NaN, 2])).toEqual([1, 1, 3])
  })
})

describe('timeAgo', () => {
  const NOW = new Date('2026-11-17T12:00:00Z')

  afterEach(() => {
    vi.useRealTimers()
  })

  const at = (minutesAgo: number) => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    return new Date(NOW.getTime() - minutesAgo * 60000).toISOString()
  }

  it('menos de un minuto es "Ahora"', () => {
    expect(timeAgo(at(0))).toBe('Ahora')
  })

  it('pasa de minutos a horas a días', () => {
    expect(timeAgo(at(5))).toBe('Hace 5 min')
    expect(timeAgo(at(59))).toBe('Hace 59 min')
    expect(timeAgo(at(60))).toBe('Hace 1 h')
    expect(timeAgo(at(180))).toBe('Hace 3 h')
    expect(timeAgo(at(24 * 60))).toBe('Hace 1 d')
    expect(timeAgo(at(48 * 60))).toBe('Hace 2 d')
  })

  it('una fecha inválida da texto vacío', () => {
    expect(timeAgo('no-es-fecha')).toBe('')
  })
})
