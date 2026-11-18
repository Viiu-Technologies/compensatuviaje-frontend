import { describe, expect, it, vi } from 'vitest'

// authService abre el cliente de Supabase al importarse; el normalizador no lo usa.
vi.mock('./authService', () => ({ default: { getSession: vi.fn() } }))

import { normalizeDashboardData } from './b2cApi'

const emptyStats = {
  totalFlights: 0,
  totalEmissionsKg: 0,
  totalEmissionsTons: 0,
  totalCompensatedKg: 0,
  totalCompensatedTons: 0,
  totalPendingKg: 0,
  totalPendingTons: 0,
  certificatesCount: 0,
  treesEquivalent: 0,
  compensationRate: 0,
  emissionsDeltaPercentage: null,
  flightsDeltaCount: null,
  pendingRate: 0,
  lifetimeEmissionsKg: 0,
  lifetimeCompensatedKg: 0,
  lifetimeCompensationRate: 0,
}

describe('normalizeDashboardData: sin datos', () => {
  it('un usuario nuevo recibe todo en cero o vacío, nunca cifras de ejemplo', () => {
    const data = normalizeDashboardData({})

    expect(data.stats).toEqual(emptyStats)
    expect(data.user).toEqual({ nombre: '', email: '', avatarUrl: null, memberSince: '' })
    expect(data.recentFlights).toEqual([])
    expect(data.recentTrips).toEqual([])
    expect(data.recentCertificates).toEqual([])
    expect(data.monthlyEvolution).toEqual([])
    expect(data.emissionsByCategory).toEqual([])
    expect(data.planetEquivalent).toEqual({ treesCount: 0, periodText: 'durante 1 año' })
  })

  it('un usuario nuevo apunta al primer logro con 0 % de avance', () => {
    const { nextAchievement } = normalizeDashboardData({})

    expect(nextAchievement).toMatchObject({ title: 'Semilla Climática', targetKg: 1, currentKg: 0, progressPercentage: 0, remainingKg: 1 })
  })
})

describe('normalizeDashboardData: números', () => {
  const withStats = (stats: Record<string, unknown>) => normalizeDashboardData({ stats } as never).stats

  it('convierte números guardados como texto', () => {
    expect(withStats({ totalEmissionsKg: '1250.5', totalFlights: '3' })).toMatchObject({ totalEmissionsKg: 1250.5, totalFlights: 3 })
  })

  it('un valor que no es número queda en 0, no en NaN', () => {
    expect(withStats({ totalEmissionsKg: 'abc', totalFlights: NaN, certificatesCount: null })).toMatchObject({ totalEmissionsKg: 0, totalFlights: 0, certificatesCount: 0 })
  })

  it('conserva null en las variaciones: "sin dato" no es lo mismo que 0', () => {
    expect(withStats({ emissionsDeltaPercentage: null, flightsDeltaCount: null })).toMatchObject({ emissionsDeltaPercentage: null, flightsDeltaCount: null })
    expect(withStats({ emissionsDeltaPercentage: -12.5, flightsDeltaCount: 2 })).toMatchObject({ emissionsDeltaPercentage: -12.5, flightsDeltaCount: 2 })
  })

  it('lo pendiente es 100 menos lo compensado, si hay emisiones', () => {
    expect(withStats({ totalEmissionsTons: 10, compensationRate: 40 }).pendingRate).toBe(60)
  })

  it('lo pendiente nunca es negativo', () => {
    expect(withStats({ totalEmissionsTons: 10, compensationRate: 130 }).pendingRate).toBe(0)
  })

  it('sin emisiones lo pendiente es 0, no 100', () => {
    expect(withStats({ totalEmissionsTons: 0, compensationRate: 0 }).pendingRate).toBe(0)
  })
})

describe('normalizeDashboardData: logros', () => {
  const next = (lifetimeCompensatedKg: number) => normalizeDashboardData({ stats: { lifetimeCompensatedKg } } as never).nextAchievement

  it('mide el avance hacia el siguiente nivel con lo compensado en todo el historial', () => {
    expect(next(500)).toMatchObject({ title: 'Viajero Consciente', targetKg: 1000, currentKg: 500, progressPercentage: 50, remainingKg: 500 })
  })

  it('al llegar a un nivel pasa al siguiente', () => {
    expect(next(1)?.title).toBe('Viajero Consciente')
    expect(next(1000)?.title).toBe('Guardián del Clima')
  })

  it('con el nivel máximo alcanzado no hay siguiente logro', () => {
    expect(next(5000)).toBeNull()
    expect(next(999999)).toBeNull()
  })

  it('redondea el avance y los kilos restantes', () => {
    expect(next(333.4)).toMatchObject({ currentKg: 333, progressPercentage: 33, remainingKg: 667 })
  })
})

describe('normalizeDashboardData: viajes recientes', () => {
  it('con recentTrips arma vuelos y viajes terrestres de la app', () => {
    const data = normalizeDashboardData({
      recentTrips: [
        { calculationId: 'c1', type: 'flight', origin: 'SCL', destination: 'LIM', date: '2026-11-01', co2Tons: '0.5', isCompensated: true, routeType: 'Internacional' },
        { calculationId: 'c2', type: 'ground', mode: 'Bus', date: '2026-11-02', co2Tons: 0.1, distanceKm: '120' },
      ],
    } as never)

    expect(data.recentTrips).toEqual([
      { id: 'c1', origin: 'SCL', destination: 'LIM', date: '2026-11-01', co2Tons: 0.5, isCompensated: true, routeType: 'Internacional', transportMode: 'Avión', type: 'flight', mode: null, distanceKm: 0 },
      { id: 'c2', origin: '', destination: '', date: '2026-11-02', co2Tons: 0.1, isCompensated: false, routeType: null, transportMode: 'Bus', type: 'ground', mode: 'Bus', distanceKm: 120 },
    ])
  })

  it('un viaje terrestre nunca sale como "GND → GND"', () => {
    const data = normalizeDashboardData({ recentTrips: [{ id: 'g1', type: 'ground', origin: 'GND', destination: 'GND', mode: 'Auto' }] } as never)

    expect(data.recentTrips[0]).toMatchObject({ origin: '', destination: '', type: 'ground' })
  })

  it('usa el id si no hay calculationId y la fecha de creación si no hay fecha', () => {
    const data = normalizeDashboardData({ recentTrips: [{ id: 'x1', createdAt: '2026-10-10' }] } as never)

    expect(data.recentTrips[0]).toMatchObject({ id: 'x1', date: '2026-10-10' })
  })

  it('un tipo de ruta desconocido queda en null', () => {
    const data = normalizeDashboardData({ recentTrips: [{ id: 'a', routeType: 'Interplanetaria' }] } as never)

    expect(data.recentTrips[0].routeType).toBeNull()
  })

  it('sin recentTrips usa los vuelos recientes, con "Avión" por defecto', () => {
    const data = normalizeDashboardData({
      recentFlights: [{ id: 'f1', origin: 'SCL', destination: 'EZE', date: '2026-11-03', co2Tons: '0.3', isCompensated: 1, routeType: 'Internacional' }],
    } as never)

    expect(data.recentTrips).toEqual([
      { id: 'f1', origin: 'SCL', destination: 'EZE', date: '2026-11-03', co2Tons: 0.3, isCompensated: true, routeType: 'Internacional', transportMode: 'Avión', type: 'flight', mode: null, distanceKm: 0 },
    ])
  })

  it('un recentTrips vacío cae a los vuelos recientes', () => {
    const data = normalizeDashboardData({ recentTrips: [], recentFlights: [{ id: 'f1', origin: 'A', destination: 'B', date: 'd', co2Tons: 1, isCompensated: false, routeType: null }] } as never)

    expect(data.recentTrips).toHaveLength(1)
  })
})

describe('normalizeDashboardData: categorías y datos pasados tal cual', () => {
  it('asigna color e ícono a cada categoría de emisiones', () => {
    const data = normalizeDashboardData({
      emissionsByCategory: [
        { id: 'international', label: 'Internacional', value: 5 },
        { id: 'national', label: 'Nacional', value: 3 },
        { id: 'ground', label: 'Terrestre', value: 1 },
      ],
    } as never)

    expect(data.emissionsByCategory.map((c) => [c.id, c.color, c.icon])).toEqual([
      ['international', '#046302', 'plane'],
      ['national', '#93DC88', 'plane'],
      ['ground', '#2F7D6D', 'ground'],
    ])
  })

  it('una categoría desconocida recibe el color por defecto, sin perder sus datos', () => {
    const data = normalizeDashboardData({ emissionsByCategory: [{ id: 'cruise', label: 'Crucero', value: 2 }] } as never)

    expect(data.emissionsByCategory[0]).toMatchObject({ id: 'cruise', label: 'Crucero', value: 2, color: '#079705', icon: 'plane' })
  })

  it('el equivalente en árboles sale de las estadísticas', () => {
    const data = normalizeDashboardData({ stats: { treesEquivalent: 12 } } as never)

    expect(data.planetEquivalent.treesCount).toBe(12)
  })

  it('pasa tal cual los datos del usuario, certificados y evolución mensual', () => {
    const certificates = [{ id: 'c', number: 'CERT-1', date: '2026-11-01', tons: 0.5, project: 'Bosque' }]
    const evolution = [{ month: '2026-10', emissions: 1, compensated: 0 }]
    const data = normalizeDashboardData({
      user: { nombre: 'Ana', email: 'ana@x.cl', avatarUrl: 'https://a/b.png', memberSince: '2026-01-01' },
      recentCertificates: certificates,
      monthlyEvolution: evolution,
    } as never)

    expect(data.user).toEqual({ nombre: 'Ana', email: 'ana@x.cl', avatarUrl: 'https://a/b.png', memberSince: '2026-01-01' })
    expect(data.recentCertificates).toBe(certificates)
    expect(data.monthlyEvolution).toBe(evolution)
  })
})
