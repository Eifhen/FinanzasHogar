




/** Lenguajes disponibles en la aplicacion */
export const ApplicationLenguages = {
  es: "es-do",
  en: "en-us",
} as const;


/** Lenguajes de la aplicación */
export type ApplicationLenguage =(typeof ApplicationLenguages)[keyof typeof ApplicationLenguages];