import { EN } from "../en_US";



/** Interfaz del TranslatorHandler */
export interface ITranslatorHandler {


  /** Recibe un key del archivo de traducción y devuelve el texto traducido 
   * según la configuración de idioma de la request en curso */
  Translate: (key: keyof typeof EN, values?: (string|number)[]) => string;

}