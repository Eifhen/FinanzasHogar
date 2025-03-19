


/** Configuracion Custom para las cookies */
export interface CustomCookieOptions {

  /** Indica si solo permite https */
  httpOnly: boolean;

  /** indica el tiempo de vida de la cookie */
	maxAge?: number;

  /** Indica la ruta de la cookie */
	path?: string;

  /** Indica si la cookie debe estar firmada */
  signed?: boolean;
}