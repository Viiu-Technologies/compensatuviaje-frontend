import { describe, expect, it } from 'vitest'
import { calculateRutDv, cleanRut, formatRut, validateChileanRut } from './chileanRut'
import { formatRut as formatRutLegacy, validateRut } from './validators'

describe('cleanRut', () => {
  it('quita puntos, guión y espacios y pasa la K a mayúscula', () => {
    expect(cleanRut('12.345.678-5')).toBe('123456785')
    expect(cleanRut(' 7.654.321-k ')).toBe('7654321K')
  })

  it('un valor vacío o nulo da texto vacío', () => {
    expect(cleanRut('')).toBe('')
    expect(cleanRut(undefined as unknown as string)).toBe('')
  })
})

describe('formatRut', () => {
  it('agrega puntos y guión', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5')
    expect(formatRut('76123456K')).toBe('76.123.456-K')
  })

  it('con menos de 2 caracteres devuelve lo limpio sin formatear', () => {
    expect(formatRut('1')).toBe('1')
    expect(formatRut('')).toBe('')
  })
})

describe('calculateRutDv (módulo 11)', () => {
  it.each([
    ['12345678', '5'],
    ['7654321', '6'],
    ['11111111', '1'],
    ['1000005', 'K'],
    ['1000013', '0'],
  ])('el cuerpo %s tiene dígito verificador %s', (body, dv) => {
    expect(calculateRutDv(body)).toBe(dv)
  })

  it('un cuerpo vacío no tiene dígito verificador', () => {
    expect(calculateRutDv('')).toBe('')
  })

  it('ignora lo que no son dígitos', () => {
    expect(calculateRutDv('12.345.678')).toBe('5')
  })
})

describe('validateChileanRut', () => {
  it('acepta un RUT correcto con cualquier formato y lo devuelve formateado', () => {
    for (const input of ['12.345.678-5', '12345678-5', '123456785']) {
      expect(validateChileanRut(input)).toEqual({ valid: true, cleaned: '123456785', formatted: '12.345.678-5' })
    }
  })

  it('acepta un RUT cuyo dígito verificador es K, en mayúscula o minúscula', () => {
    expect(validateChileanRut('1.000.005-K').valid).toBe(true)
    expect(validateChileanRut('1000005-k').valid).toBe(true)
    expect(validateChileanRut('1.000.013-0').valid).toBe(true)
  })

  it('un RUT vacío es obligatorio', () => {
    expect(validateChileanRut('')).toMatchObject({ valid: false, error: 'El RUT es obligatorio' })
    expect(validateChileanRut('   ')).toMatchObject({ valid: false, error: 'El RUT es obligatorio' })
  })

  it('rechaza un largo fuera de 7 a 9 caracteres', () => {
    expect(validateChileanRut('123456').valid).toBe(false)
    expect(validateChileanRut('1234567890').valid).toBe(false)
    expect(validateChileanRut('123456').error).toContain('entre 7 y 9')
  })

  it('rechaza un dígito verificador incorrecto', () => {
    expect(validateChileanRut('12.345.678-9')).toMatchObject({ valid: false, error: expect.stringContaining('Dígito verificador incorrecto') })
  })

  it('rechaza cuerpos con letras', () => {
    expect(validateChileanRut('12K45678-5')).toMatchObject({ valid: false, error: 'Cuerpo del RUT inválido' })
  })

  it('rechaza RUT con todos los dígitos iguales o menores a un millón', () => {
    expect(validateChileanRut('11.111.111-1')).toMatchObject({ valid: false, error: 'RUT inválido' })
    expect(validateChileanRut('999999-9').valid).toBe(false)
  })
})

describe('validators.ts (versión anterior)', () => {
  it('acepta y rechaza los mismos RUT que la versión nueva en los casos comunes', () => {
    for (const rut of ['12.345.678-5', '12345678-5', '1.000.005-K', '1.000.013-0', '12.345.678-9']) {
      expect(validateRut(rut)).toBe(validateChileanRut(rut).valid)
    }
  })

  it('rechaza valores que no son texto', () => {
    expect(validateRut('')).toBe(false)
    expect(validateRut(null as unknown as string)).toBe(false)
    expect(validateRut(12345678 as unknown as string)).toBe(false)
  })

  it('formatea igual que la versión nueva', () => {
    expect(formatRutLegacy('123456785')).toBe(formatRut('123456785'))
    expect(formatRutLegacy('')).toBe('')
  })
})
