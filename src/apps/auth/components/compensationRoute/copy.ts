export const COPY = {
  fig: 'Fig 2',
  title: 'La ruta de tu compensación',
  hint: '← → estaciones',
  label:
    'Una cinta transportadora sobre un banco. Un paquete, que representa tu compensación, avanza por cuatro estaciones: una báscula con reloj sobre un tramo de cinta que pesa; un pórtico con una cámara cenital y una lupa que baja a revisarlo; una compuerta de guillotina que sube cuando el terminal de pago confirma; y una prensa que sella la tapa del paquete mientras un bloque nuevo se encadena en un riel junto a ella.',
  aria: 'La ruta de tu compensación: flechas izquierda y derecha mueven el paquete entre las cuatro estaciones',
  keys: [
    { mark: 'lit', label: 'Paquete: tu compensación, de estación en estación' },
    { mark: 'raised', label: 'Estaciones: medición, verificación, pago y certificado' },
    { mark: 'edge', label: 'Regla con una muesca mayor y sus puntos por estación' },
  ],
  caption:
    'La báscula mide la huella de tu vuelo con los factores DEFRA 2025. En el pórtico se comprueba que el proyecto que elijas fue evaluado por Veritas AI y revisado por una persona. La compuerta sube cuando Webpay confirma el pago, y la prensa sella tu certificado, que puedes registrar en Polygon: el bloque nuevo que se encadena en el riel.',
} as const;
