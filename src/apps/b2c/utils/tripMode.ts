/**
 * Viajes terrestres (CTV-61): etiqueta e ícono por medio de transporte.
 *
 * Los modos son los que acepta el backend (VALID_MODES en
 * b2c-ground-trips/index.js): car, motorcycle, bus, rail, active, taxi.
 * Los registra la app móvil; la web solo los muestra.
 */
import type { IconType } from 'react-icons';
import { FaBus, FaCar, FaMotorcycle, FaPlane, FaTaxi, FaTrain, FaWalking } from 'react-icons/fa';

const MODES: Record<string, { label: string; icon: IconType }> = {
  car: { label: 'Auto', icon: FaCar },
  motorcycle: { label: 'Moto', icon: FaMotorcycle },
  bus: { label: 'Bus', icon: FaBus },
  rail: { label: 'Metro o tren', icon: FaTrain },
  taxi: { label: 'Taxi o app', icon: FaTaxi },
  active: { label: 'Caminata o bici', icon: FaWalking },
};

const GROUND_FALLBACK = { label: 'Viaje terrestre', icon: FaCar };

/** ¿Es un viaje terrestre? Los antiguos llegan como origen y destino "GND". */
export function isGroundTrip(t: { type?: string | null; originAirport?: string | null; origin?: string | null }): boolean {
  return t.type === 'ground' || t.originAirport === 'GND' || t.origin === 'GND';
}

export function tripModeLabel(mode?: string | null): string {
  return (mode && MODES[mode]?.label) || GROUND_FALLBACK.label;
}

export function tripModeIcon(mode?: string | null, ground = true): IconType {
  if (!ground) return FaPlane;
  return (mode && MODES[mode]?.icon) || GROUND_FALLBACK.icon;
}
