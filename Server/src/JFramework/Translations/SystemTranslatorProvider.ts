import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { ITranslationProvider } from "./Interfaces/ITranslatorProvider";
import { EN_US_SYSTEM } from "./Dictionaries/en_US_SYSTEM";
import { ES_DO_SYSTEM } from "./Dictionaries/es_DO_SYSTEM";
import { ApplicationLenguage, ApplicationLenguages } from "./Types/ApplicationLenguages";
import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";



interface SystemTranslatorProviderDependencies {
	lang: ApplicationLenguage;
	requestId: string,
}

@AutoClassBinder
export default class SystemTranslatorProvider implements ITranslationProvider {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Idioma actual de la request en curso */
	private readonly _lang: ApplicationLenguage;

	/** Id de la request en curso */
	public readonly requestId: string;

	constructor(deps: SystemTranslatorProviderDependencies) {

		this._lang = deps.lang;
		this.requestId = deps.requestId;

		this._logger = new LoggerManager({
			entityName: "SystemTranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestId
		});
	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
  * según la configuración de idioma de la request en curso */
	public getTranslation(key: string): string | undefined {
		this._logger.Activity("getTranslation");

		if (this._lang === ApplicationLenguages.en) {
			return EN_US_SYSTEM[key as keyof typeof EN_US_SYSTEM];
		} else if (this._lang === ApplicationLenguages.es) {
			return ES_DO_SYSTEM[key as keyof typeof ES_DO_SYSTEM];
		}
		return undefined;
	}

}