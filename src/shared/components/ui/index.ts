/**
 * Primitivos de UI del sistema de diseño.
 *
 * Antes de esto no existía ninguna capa de componentes: el CSS acumulaba 56
 * clases de botón, 105 de tarjeta y 28 de campo, cada una con su propio
 * conjunto incompleto de estados. Cambiar el foco del producto costaba nueve
 * ediciones; el color de acción, decenas.
 *
 * Adoptar estos componentes en lo nuevo detiene el crecimiento de esa deuda.
 * La migración de lo existente puede hacerse de forma incremental.
 */
export { Button, default as ButtonDefault } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input, default as InputDefault } from './Input';
export type { InputProps } from './Input';
