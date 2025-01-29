



/** Imagenes por defecto de la aplicación */
export interface ApplicationImages {
  APP_LOGO: string;
  PORTFOLIO_LOGO: string;
  BLACK_WAVE: string;
}

/** Variable que contiene las imagenes por defecto de la aplicación */
export const APPLICATION_IMAGES:ApplicationImages = JSON.parse(process.env.APPLICATION_IMAGES ?? ""); 