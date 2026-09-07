import * as THREE from 'three';

/**
 * Convert latitude/longitude to 3D position on a sphere
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Create an arc curve between two lat/lon points on a sphere
 */
export function createArcCurve(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  radius: number,
  altitude: number = 0.3
): THREE.CubicBezierCurve3 {
  const start = latLonToVector3(startLat, startLon, radius);
  const end = latLonToVector3(endLat, endLon, radius);

  // Midpoint on the sphere surface
  const mid = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius + altitude);

  // Control points elevated above sphere
  const control1 = new THREE.Vector3()
    .addVectors(start, mid)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius + altitude * 0.8);

  const control2 = new THREE.Vector3()
    .addVectors(mid, end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius + altitude * 0.8);

  return new THREE.CubicBezierCurve3(start, control1, control2, end);
}

/**
 * Route definitions with real-world coordinates
 */
export interface FlightRoute {
  id: string;
  from: { name: string; lat: number; lon: number };
  to: { name: string; lat: number; lon: number };
  color: string;
}

export const FLIGHT_ROUTES: FlightRoute[] = [
  {
    id: 'lima-santiago',
    from: { name: 'Lima', lat: -12.05, lon: -77.04 },
    to: { name: 'Santiago', lat: -33.45, lon: -70.67 },
    color: '#22D3EE',
  },
  {
    id: 'madrid-newyork',
    from: { name: 'Madrid', lat: 40.42, lon: -3.7 },
    to: { name: 'New York', lat: 40.71, lon: -74.01 },
    color: '#38BDF8',
  },
  {
    id: 'tokyo-losangeles',
    from: { name: 'Tokyo', lat: 35.68, lon: 139.69 },
    to: { name: 'Los Angeles', lat: 34.05, lon: -118.24 },
    color: '#818CF8',
  },
  {
    id: 'paris-dubai',
    from: { name: 'Paris', lat: 48.86, lon: 2.35 },
    to: { name: 'Dubai', lat: 25.2, lon: 55.27 },
    color: '#22D3EE',
  },
  {
    id: 'saopaulo-london',
    from: { name: 'São Paulo', lat: -23.55, lon: -46.63 },
    to: { name: 'London', lat: 51.51, lon: -0.13 },
    color: '#38BDF8',
  },
];
