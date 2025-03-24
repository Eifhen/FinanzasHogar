import { RequestData } from "../../Configurations/ApplicationContext";



export interface ITranslationProvider {
  /**
   * Obtiene la traducción para la clave solicitada.
   * Devuelve undefined si no se encontró en ninguna fuente.
   */
  getTranslation(key: string): string | undefined;

  /** Contiene información acerca de la request en curso */
  requestData: RequestData;
}



