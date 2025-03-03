import { ClassConstructor } from "./types/CommonTypes";
import { ARRAY_LENGTH_EMPTY } from "./const";




/** Verifica si un elemento es null/undefined o si está vacío */
export default function IsNullOrEmpty(value: any) {
	// Verifica si es null, undefined, un string vacío, o un objeto vacío
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value === 'string' && value.trim() === '') {
		return true;
	}

	if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === ARRAY_LENGTH_EMPTY) {
		return true;
	}

	return false;
}


/** Indica si una función es una instancia de una clase */
export function isClass(fn: unknown): fn is ClassConstructor {
	if(typeof fn !== "function"){
		return false;
	}

	return (/^class\s/.test(fn.toString()));
}

