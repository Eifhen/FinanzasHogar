import { EN_US_SYSTEM } from "../Dictionaries/en_US_SYSTEM";


/** Lenguajes disponibles en la aplicacion */
export const ApplicationLenguages = {
	es: "es-DO",
	en: "en-US",
} as const;


/** Lenguajes de la aplicación */
export type ApplicationLenguage = (typeof ApplicationLenguages)[keyof typeof ApplicationLenguages];

/** Representan las keys del objeto de idiomas del sistema */
export type LenguageKeys = keyof typeof EN_US_SYSTEM;