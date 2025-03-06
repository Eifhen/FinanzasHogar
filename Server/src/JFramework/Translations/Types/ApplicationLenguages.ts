

/** Lenguajes disponibles en la aplicacion */
export const ApplicationLenguages = {
	es: "es-DO",
	en: "en-US",
} as const;


/** Lenguajes de la aplicación */
export type ApplicationLenguage = (typeof ApplicationLenguages)[keyof typeof ApplicationLenguages];