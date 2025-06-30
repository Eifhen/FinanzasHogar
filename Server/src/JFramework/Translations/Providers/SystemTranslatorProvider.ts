import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { ITranslationProvider, ITranslatorProviderStrategyDependencies } from "../Interfaces/ITranslatorProvider";
import { EN_US_SYSTEM } from "../Dictionaries/en_US_SYSTEM";
import { ES_DO_SYSTEM } from "../Dictionaries/es_DO_SYSTEM";
import { ApplicationLenguages } from "../Types/ApplicationLenguages";
import { AutoClassBinder } from "../../Helpers/Decorators/AutoBind";
import { RequestContext } from "../../Configurations/Types/ContextTypes";


export interface SystemTranslatorProviderDependencies extends ITranslatorProviderStrategyDependencies {
	
}

/** Estrategia de traducción para mensajes del sistema */
@AutoClassBinder
export default class SystemTranslatorProvider implements ITranslationProvider {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Id de la request en curso */
	public readonly requestContext: RequestContext;

	constructor(deps: SystemTranslatorProviderDependencies) {

		this.requestContext = deps.requestContext
		
		this._logger = new LoggerManager({
			entityName: "SystemTranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestContext.requestId
		});
	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
  * según la configuración de idioma de la request en curso */
	public getTranslation(key: string): string | undefined {
		this._logger.Activity("getTranslation");

		if (this.requestContext.lang === ApplicationLenguages.en) {
			return EN_US_SYSTEM[key as keyof typeof EN_US_SYSTEM];
		} else if (this.requestContext.lang === ApplicationLenguages.es) {
			return ES_DO_SYSTEM[key as keyof typeof ES_DO_SYSTEM];
		}
		return undefined;
	}

}