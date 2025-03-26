import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { ITranslationProvider } from "../Interfaces/ITranslatorProvider";
import { EN_US_SYSTEM } from "../Dictionaries/en_US_SYSTEM";
import { ES_DO_SYSTEM } from "../Dictionaries/es_DO_SYSTEM";
import { ApplicationLenguages } from "../Types/ApplicationLenguages";
import { AutoClassBinder } from "../../Helpers/Decorators/AutoBind";
import { RequestData } from "../../Configurations/ApplicationContext";



interface SystemTranslatorProviderDependencies {
	requestData: RequestData;
}

@AutoClassBinder
export default class SystemTranslatorProvider implements ITranslationProvider {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Id de la request en curso */
	public readonly requestData: RequestData;

	constructor(deps: SystemTranslatorProviderDependencies) {

		this.requestData = deps.requestData

		this._logger = new LoggerManager({
			entityName: "SystemTranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestData.requestId
		});
	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
  * según la configuración de idioma de la request en curso */
	public getTranslation(key: string): string | undefined {
		this._logger.Activity("getTranslation");

		if (this.requestData.lang === ApplicationLenguages.en) {
			return EN_US_SYSTEM[key as keyof typeof EN_US_SYSTEM];
		} else if (this.requestData.lang === ApplicationLenguages.es) {
			return ES_DO_SYSTEM[key as keyof typeof ES_DO_SYSTEM];
		}
		return undefined;
	}

}