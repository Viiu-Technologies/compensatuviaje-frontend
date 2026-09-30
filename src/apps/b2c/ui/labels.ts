/** Nombres visibles de los tipos de proyecto (los mismos del admin). */
export const PROJECT_TYPE_LABELS: Record<string, string> = {
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  biodiversity: 'Biodiversidad',
  clean_water: 'Agua limpia',
  water_security: 'Seguridad hídrica',
  circular_economy: 'Economía circular',
  waste_management: 'Gestión de residuos',
  energy_efficiency: 'Eficiencia energética',
  renewable_energy: 'Energía renovable',
  social_housing: 'Vivienda social',
  community_development: 'Desarrollo comunitario',
  wind_energy: 'Energía eólica',
  solar_energy: 'Energía solar',
  ocean_conservation: 'Océanos',
  carbon_capture: 'Captura de carbono',
};

export const projectTypeLabel = (t?: string | null) => (t ? PROJECT_TYPE_LABELS[t] ?? 'Proyecto' : 'Proyecto');
