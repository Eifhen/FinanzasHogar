



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

