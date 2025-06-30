import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { ITranslatorHandler } from "./Interfaces/ITranslatorHandler";
import { ITranslationProvider } from "./Interfaces/ITranslatorProvider";

interface TranslatorHandlerDependencies {
	translatorProvider: ITranslationProvider;
}

@AutoClassBinder
export default class TranslatorHandler implements ITranslatorHandler {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Proveedor de traducciones */
	private readonly _translatorProvider: ITranslationProvider;

	constructor(deps: TranslatorHandlerDependencies) {
		this._translatorProvider = deps.translatorProvider;

		this._logger = new LoggerManager({
			entityName: "TranslatorHandler",
			entityCategory: LoggEntityCategorys.HANDLER,
			requestId: deps.translatorProvider.requestContext.requestId
		});
	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
	 * según la configuración de idioma de la request en curso */
	public Translate(key: string, values?: (string | number)[]): string {
		this._logger.Activity("Translate", values);
		let translation = this._translatorProvider.getTranslation(key);

		if (!translation) {
			this._logger.Message("WARN", `La traducción de la Key: ${key}, no fue encontrada`);
			translation = key;
		}

		if (values) {
			translation = this.Interpolate(translation, values);
		}
		return translation;
	}
	

	/** Función para interpolar valores en una cadena
 * @param {string} template - La cadena con marcadores de posición (e.g., "Hola {0}, ¿cómo estás {1}?")
 * @param {Array} values - El array de valores a interpolar
 * @returns {string} - La cadena con los valores interpolados */
	private Interpolate(template: string, values: (string | number)[]): string {
		return template.replace(/{(\d+)}/g, (match, index) => {
			return typeof values[index] !== 'undefined' ? values[index].toString() : match;
		});
	}

}