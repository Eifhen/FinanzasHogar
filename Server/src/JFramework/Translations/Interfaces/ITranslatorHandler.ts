import { EN_US_SYSTEM } from "../Dictionaries/en_US_SYSTEM";



/** Interfaz del TranslatorHandler */
export interface ITranslatorHandler {


  /** Recibe un key del archivo de traducción y devuelve el texto traducido 
   * según la configuración de idioma de la request en curso */
  Translate: (key: keyof typeof EN_US_SYSTEM, values?: (string|number)[]) => string;

}