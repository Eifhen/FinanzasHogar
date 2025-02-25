import { TimeUnit } from "./types/CommonTypes";



/** Verifica si un elemento es null/undefined o si está vacío */
export default function IsNullOrEmpty(value: any) {
  // Verifica si es null, undefined, un string vacío, o un objeto vacío
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }

  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return true;
  }

  return false;
}


/** Convierte el tiempo a milisegundos según la unidad proporcionada */
export function ConvertTimeToMiliSeconds(time: number, unit: TimeUnit): number {
  switch (unit) {
    case "minutes":
      return time * 60 * 1000; // Convertir minutos a milisegundos
    case "seconds":
      return time * 1000; // Convertir segundos a milisegundos
    default:
      throw new Error("Unidad de tiempo no soportada");
  }
}