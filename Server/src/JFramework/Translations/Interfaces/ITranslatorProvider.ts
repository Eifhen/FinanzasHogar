import { RequestContext } from "../../Configurations/Types/ContextTypes";




export interface ITranslationProvider {
  /**
   * Obtiene la traducción para la clave solicitada.
   * Devuelve undefined si no se encontró en ninguna fuente.
   */
  getTranslation(key: string): string | undefined;

  /** Contiene información acerca de la request en curso */
  requestContext: RequestContext;
}

export interface ITranslatorProviderStrategyDependencies {
	requestContext: RequestContext;
}



