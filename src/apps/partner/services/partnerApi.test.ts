import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../shared/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import api from '../../../shared/services/api'
import { getPartnerProjects, getProjectById } from './partnerApi'

const get = api.get as unknown as ReturnType<typeof vi.fn>

/** normalizeProject no se exporta: se prueba por donde lo usa la app. */
const normalize = async (raw: Record<string, unknown>) => {
  get.mockResolvedValue({ success: true, data: { id: 'p1', code: 'PRJ-1', name: 'Bosque', status: 'active', ...raw } })
  return (await getProjectById('p1'))!
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('normalizeProject: tipo y ubicación', () => {
  it('usa type; si no viene usa project_type; si tampoco, "other"', async () => {
    expect((await normalize({ type: 'reforestation', project_type: 'solar' })).type).toBe('reforestation')
    expect((await normalize({ project_type: 'solar' })).type).toBe('solar')
    expect((await normalize({})).type).toBe('other')
  })

  it('la API manda el país y la región con dos nombres distintos: usa cualquiera', async () => {
    expect(await normalize({ location_country: 'Chile', country: 'CL' })).toMatchObject({ location_country: 'Chile', country: 'CL' })
    expect(await normalize({ country: 'Perú', region: 'Cusco' })).toMatchObject({ location_country: 'Perú', location_region: 'Cusco' })
  })

  it('sin país queda como texto vacío, y sin región como undefined', async () => {
    expect(await normalize({})).toMatchObject({ location_country: '', location_region: undefined })
  })

  it('una descripción vacía queda como undefined', async () => {
    expect((await normalize({ description: '' })).description).toBeUndefined()
    expect((await normalize({ description: 'Texto' })).description).toBe('Texto')
  })
})

describe('normalizeProject: números', () => {
  it('convierte números que llegan como texto', async () => {
    const project = await normalize({ provider_cost_unit_clp: '1500.5', carbon_capture_per_unit: '20', capacity_total: '5000', monthly_stock_approved: '100', monthly_stock_remaining: '40' })

    expect(project).toMatchObject({ provider_cost_unit_clp: 1500.5, carbon_capture_per_unit: 20, capacity_total: 5000, monthly_stock_approved: 100, monthly_stock_remaining: 40 })
  })

  it('un número válido pasa tal cual, incluido el cero', async () => {
    expect(await normalize({ capacity_sold: 0, capacity_available: 12 })).toMatchObject({ capacity_sold: 0, capacity_available: 12 })
  })

  it('vacío, null, undefined o texto no numérico queda como undefined, no como 0 ni NaN', async () => {
    const project = await normalize({ provider_cost_unit_clp: '', carbon_capture_per_unit: null, capacity_total: 'abc', capacity_sold: undefined })

    expect(project.provider_cost_unit_clp).toBeUndefined()
    expect(project.carbon_capture_per_unit).toBeUndefined()
    expect(project.capacity_total).toBeUndefined()
    expect(project.capacity_sold).toBeUndefined()
  })
})

describe('normalizeProject: precio base', () => {
  it('base_price_clp_per_ton toma el primero disponible entre sus tres nombres', async () => {
    expect((await normalize({ base_price_clp_per_ton: 100, currentBasePriceClpPerTon: 200, current_base_price_clp_per_ton: 300 })).base_price_clp_per_ton).toBe(100)
    expect((await normalize({ currentBasePriceClpPerTon: 200, current_base_price_clp_per_ton: 300 })).base_price_clp_per_ton).toBe(200)
    expect((await normalize({ current_base_price_clp_per_ton: '300' })).base_price_clp_per_ton).toBe(300)
  })

  it('currentBasePriceClpPerTon toma el primero disponible entre sus tres nombres', async () => {
    expect((await normalize({ currentBasePriceClpPerTon: 200, current_base_price_clp_per_ton: 300, base_price_clp_per_ton: 100 })).currentBasePriceClpPerTon).toBe(200)
    expect((await normalize({ current_base_price_clp_per_ton: 300, base_price_clp_per_ton: 100 })).currentBasePriceClpPerTon).toBe(300)
    expect((await normalize({ base_price_clp_per_ton: '100' })).currentBasePriceClpPerTon).toBe(100)
  })

  it('sin ningún precio ambos quedan undefined', async () => {
    const project = await normalize({})

    expect(project.base_price_clp_per_ton).toBeUndefined()
    expect(project.currentBasePriceClpPerTon).toBeUndefined()
  })
})

describe('getProjectById', () => {
  it('pide el proyecto por su id', async () => {
    await normalize({})

    expect(get).toHaveBeenCalledWith('/partner/projects/p1')
  })

  it('devuelve null si la respuesta no es exitosa o no trae datos', async () => {
    get.mockResolvedValue({ success: false })
    expect(await getProjectById('p1')).toBeNull()

    get.mockResolvedValue({ success: true, data: null })
    expect(await getProjectById('p1')).toBeNull()
  })

  it('si la API falla propaga el error para que la pantalla lo muestre', async () => {
    get.mockRejectedValue(new Error('timeout'))

    await expect(getProjectById('p1')).rejects.toThrow('timeout')
  })
})

describe('getPartnerProjects', () => {
  it('normaliza cada proyecto de la lista y conserva la paginación', async () => {
    get.mockResolvedValue({
      success: true,
      data: [{ id: 'a', project_type: 'solar', provider_cost_unit_clp: '10' }, { id: 'b' }],
      pagination: { page: 1, total: 2 },
    })

    const result = await getPartnerProjects()

    expect(result?.projects.map((p) => [p.id, p.type, p.provider_cost_unit_clp])).toEqual([
      ['a', 'solar', 10],
      ['b', 'other', undefined],
    ])
    expect(result?.pagination).toEqual({ page: 1, total: 2 })
  })

  it('arma la consulta con página, límite y estado solo si se piden', async () => {
    get.mockResolvedValue({ success: true, data: [] })

    await getPartnerProjects()
    expect(get).toHaveBeenLastCalledWith('/partner/projects')

    await getPartnerProjects({ page: 2, limit: 10, status: 'active' })
    expect(get).toHaveBeenLastCalledWith('/partner/projects?page=2&limit=10&status=active')
  })

  it('una lista sin datos devuelve proyectos vacíos', async () => {
    get.mockResolvedValue({ success: true })

    expect((await getPartnerProjects())?.projects).toEqual([])
  })

  it('una respuesta no exitosa devuelve null y un error de red se propaga', async () => {
    get.mockResolvedValue({ success: false })
    expect(await getPartnerProjects()).toBeNull()

    get.mockRejectedValue(new Error('network'))
    await expect(getPartnerProjects()).rejects.toThrow('network')
  })
})
