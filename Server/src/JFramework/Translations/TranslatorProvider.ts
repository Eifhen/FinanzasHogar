import { AutoClassBinder } from '../Helpers/Decorators/AutoBind';
import ILoggerManager from '../Managers/Interfaces/ILoggerManager';
import LoggerManager from '../Managers/LoggerManager';
import { ClassConstructor } from '../Utils/Types/CommonTypes';
import { ITranslationProvider } from './Interfaces/ITranslatorProvider';
import { ApplicationLenguage } from './Types/ApplicationLenguages';


interface TranslatorProviderDependencies {
	lang: ApplicationLenguage;
	requestId: string,
	systemTranslatorProvider: ClassConstructor<ITranslationProvider>;
	businessTranslatorProvider?: ClassConstructor<ITranslationProvider>;
}

@AutoClassBinder
export default class TranslatorProvider implements ITranslationProvider {


	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Id de la requeste en curso */
	public readonly requestId: string;

	/** Implementa las traducciones del sistema */
	private readonly _systemTranslatorProvider: ITranslationProvider;

	/** Implementa las traducciones del negocio */
	private readonly _businessTranslatorProvider?: ITranslationProvider;

	constructor(deps: TranslatorProviderDependencies) {
		this._logger = new LoggerManager({
			entityName: "TranslatorProvider",
			entityCategory: "PROVIDER",
			requestId: deps.requestId
		});

		this.requestId = deps.requestId;

		this._systemTranslatorProvider = new deps.systemTranslatorProvider({ 
			lang: deps.lang, 
			requestId: this.requestId 
		});

		if(deps.businessTranslatorProvider){
			this._businessTranslatorProvider = new deps.businessTranslatorProvider({ 
				lang: deps.lang,
				requestId: this.requestId  
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