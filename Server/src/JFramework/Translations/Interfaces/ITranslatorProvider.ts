


export interface ITranslationProvider {
  /**
   * Obtiene la traducción para la clave solicitada.
   * Devuelve undefined si no se encontró en ninguna fuente.
   */
  getTranslation(key: string): string | undefined;

  requestId: string;
}



