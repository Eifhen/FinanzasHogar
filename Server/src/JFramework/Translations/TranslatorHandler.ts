import ApplicationContext from "../Application/ApplicationContext";
import { ApplicationLenguages } from "../Application/types/types";
import { AutoBind, AutoClassBinder } from "../Decorators/AutoBind";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { EN } from "./en_US";
import { ES } from "./es_DO";
import { ITranslatorHandler } from "./Interfaces/ITranslatorHandler";



interface TranslatorHandlerDependencies {
  applicationContext: ApplicationContext;
}

@AutoClassBinder
export default class TranslatorHandler implements ITranslatorHandler {

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  constructor(deps: TranslatorHandlerDependencies) {

    this._applicationContext = deps.applicationContext;

    this._logger = new LoggerManager({
      entityName: "TranslatorHandler",
      entityCategory: LoggEntityCategorys.HANDLER,
      applicationContext: this._applicationContext,
    });
  }


  /** Recibe un key del archivo de traducción y devuelve el texto traducido 
   * según la configuración de idioma de la request en curso */
  @AutoBind
  public Translate(key: keyof typeof EN, value?: (string | number)[]): string {
    this._logger.Activity("Translate");

    /** Configuración de lenguaje definida por el contexto */
    const lenguage = this._applicationContext.lang;

    switch (lenguage) {
      case ApplicationLenguages.en:
        return this.TranslateToEnglish(key, value);

      case ApplicationLenguages.es:
        return this.TranslateToSpanish(key, value);

      default:
        throw new Error(`Error al traducir el lenguaje: ${lenguage}`);
    }
  }

  /** Traduce la expresión al español */
  private TranslateToSpanish(key: keyof typeof EN, value?: (string | number)[]): string {
    let element = ES[key];
    return this.TranslateOperation(element, value);
  }

  /** Traduce la expresión al inglés */
  private TranslateToEnglish(key: keyof typeof EN, value?: (string | number)[]): string {
    let element = EN[key];
    return this.TranslateOperation(element, value);
  }

  /** Ejecuta la operación de traducción */
  private TranslateOperation(record: string, value?: (string | number)[]): string {
    if (value) {
      return this.Interpolate(record, value);
    }

    return record;
  }

  /** Función para interpolar valores en una cadena
 * @param {string} template - La cadena con marcadores de posición (e.g., "Hola {0}, ¿cómo estás {1}?")
 * @param {Array} values - El array de valores a interpolar
 * @returns {string} - La cadena con los valores interpolados */
  private Interpolate(template: string, values: any[]) {
    return template.replace(/{(\d+)}/g, (match, number) => {
      return typeof values[number] !== 'undefined' ? values[number] : match;
    });
  }

}