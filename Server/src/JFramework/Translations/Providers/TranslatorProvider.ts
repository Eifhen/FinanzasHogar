import { RequestData } from '../../Configurations/ApplicationContext';
import { AutoClassBinder } from '../../Helpers/Decorators/AutoBind';
import ILoggerManager from '../../Managers/Interfaces/ILoggerManager';
import LoggerManager from '../../Managers/LoggerManager';
import { ClassConstructor } from '../../Utils/Types/CommonTypes';
import { ITranslationProvider } from '../Interfaces/ITranslatorProvider';

interface TranslatorProviderDependencies {
	requestData: RequestData;
	systemTranslatorProvider: ClassConstructor<ITranslationProvider>;
	businessTranslatorProvider?: ClassConstructor<ITranslationProvider>;
}

@AutoClassBinder
export default class TranslatorProvider implements ITranslationProvider {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contiene información acerca de la request en curso */
	public readonly requestData: RequestData;

	/** Implementa las traducciones del sistema */
	private readonly _systemTranslatorProvider: ITranslationProvider;

	/** Implementa las traducciones del negocio */
	private readonly _businessTranslatorProvider?: ITranslationProvider;

	constructor(deps: TranslatorProviderDependencies) {
		
		this.requestData = deps.requestData;

		this._logger = new LoggerManager({
			entityName: "TranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestData.requestId
		});

		this._systemTranslatorProvider = new deps.systemTranslatorProvider({ 
			requestData: deps.requestData
		});

		if(deps.businessTranslatorProvider){
			this._businessTranslatorProvider = new deps.businessTranslatorProvider({ 
				requestData: deps.requestData
			});
		}

	}

	/** Recibe un key del archivo de traducción y devuelve el texto traducido 
	* según la configuración de idioma de la request en curso */
	public getTranslation(key: string): string | undefined {
		this._logger.Activity("getTranslation");

		if (this._businessTranslatorProvider) {
			// Primero, intenta obtener la traducción de negocio.
			const fromBusiness = this._businessTranslatorProvider.getTranslation(key);
			return fromBusiness !== undefined ? fromBusiness : this._systemTranslatorProvider.getTranslation(key);

		} else {
			return this._systemTranslatorProvider.getTranslation(key);
		}
	}

}