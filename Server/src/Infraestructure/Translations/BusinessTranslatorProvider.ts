import { RequestData } from "../../JFramework/Configurations/ApplicationContext";
import { AutoClassBinder } from "../../JFramework/Helpers/Decorators/AutoBind";
import ILoggerManager from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ITranslationProvider } from "../../JFramework/Translations/Interfaces/ITranslatorProvider";
import { ApplicationLenguages } from "../../JFramework/Translations/Types/ApplicationLenguages";
import { EN_US_BUSINESS } from './Dictionaries/en_US_BUSINESS';
import { ES_DO_BUSINESS } from './Dictionaries/es_DO_BUSINESS';


interface BusinessTranslatorProviderDependencies {
	requestData: RequestData;
}

@AutoClassBinder
export default class BusinessTranslatorProvider implements ITranslationProvider {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contiene información acerca de la request en curso */
	public readonly requestData: RequestData;

	constructor(deps: BusinessTranslatorProviderDependencies) {
		this.requestData = deps.requestData;

		this._logger = new LoggerManager({
			entityName: "BusinessTranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestData.requestId
		});

	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
	* según la configuración de idioma de la request en curso */
	public getTranslation(key: string): string | undefined {
		this._logger.Activity("getTranslation");

		if (this.requestData.lang === ApplicationLenguages.en) {
			const enMsg = EN_US_BUSINESS[key as keyof typeof EN_US_BUSINESS];
			return (enMsg as string | undefined);
		}

		if (this.requestData.lang === ApplicationLenguages.es) {
			const esMsg = ES_DO_BUSINESS[key as keyof typeof ES_DO_BUSINESS]
			return (esMsg as string | undefined);
		}
		return undefined;
	}
}