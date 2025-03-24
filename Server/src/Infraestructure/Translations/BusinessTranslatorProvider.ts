import { AutoClassBinder } from "../../JFramework/Helpers/Decorators/AutoBind";
import ILoggerManager from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ITranslationProvider } from "../../JFramework/Translations/Interfaces/ITranslatorProvider";
import { ApplicationLenguage, ApplicationLenguages } from "../../JFramework/Translations/Types/ApplicationLenguages";
import { EN_US_BUSINESS } from './Dictionaries/en_US_BUSINESS';
import { ES_DO_BUSINESS } from './Dictionaries/es_DO_BUSINESS';


interface BusinessTranslatorProviderDependencies {
	lang: ApplicationLenguage;
	requestId: string,
}

@AutoClassBinder
export default class BusinessTranslatorProvider implements ITranslationProvider {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Idioma actual de la request en curso */
	private readonly _lang: ApplicationLenguage;

	/** Id de la request en curso */
	public readonly requestId: string;

	constructor(deps: BusinessTranslatorProviderDependencies) {
		this._lang = deps.lang;
		this.requestId = deps.requestId;

		this._logger = new LoggerManager({
			entityName: "BusinessTranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestId
		});

	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
	* según la configuración de idioma de la request en curso */
	public getTranslation(key: string): string | undefined {
		this._logger.Activity("getTranslation");

		if (this._lang === ApplicationLenguages.en) {
			const enMsg = EN_US_BUSINESS[key as keyof typeof EN_US_BUSINESS];
			return (enMsg as string | undefined);
		}

		if (this._lang === ApplicationLenguages.es) {
			const esMsg = ES_DO_BUSINESS[key as keyof typeof ES_DO_BUSINESS]
			return (esMsg as string | undefined);
		}
		return undefined;
	}
}