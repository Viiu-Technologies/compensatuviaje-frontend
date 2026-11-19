/**
 * Apps móviles de CompensaTuViaje (para personas, B2C).
 *
 * APP_SMART_LINK es lo que codifica el QR de la landing: nginx lo redirige a
 * la tienda según el teléfono que lo abre (ver location = /app en
 * nginx/default.conf.template). Así un solo QR sirve para Android y iPhone, y
 * también funciona impreso.
 */
export const APP_STORE_URL = 'https://apps.apple.com/cl/app/id6829542366';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.compensatuviaje.tracker';
export const APP_SMART_LINK = 'https://compensatuviaje.com/app';
