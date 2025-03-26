import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import { ITranslationProvider } from "../Translations/Interfaces/ITranslatorProvider";
import SystemTranslatorProvider from "../Translations/Providers/SystemTranslatorProvider";
import TranslatorHandler from "../Translations/TranslatorHandler";
import TranslatorProvider from "../Translations/Providers/TranslatorProvider";
import { ApplicationLenguages } from "../Translations/Types/ApplicationLenguages";
import { ClassConstructor } from "../Utils/Types/CommonTypes";


export interface RequestData {
	/** Id de la request en curso */
	requestId: string;

	/** Contiene el lenguaje disponible en la aplicación  (esto nos llega en la request)*/
	lang: string;

	/** Ip del request en curso */
	ipAddress:string;
}
export interface ApplicationContextDependencies {
	settings: ConfigurationSettings;
	businessTranslatorProvider?: ClassConstructor<ITranslationProvider>;
}

/*** Clase que maneja el contexto de ejecución la aplicación */
export default class ApplicationContext {

	/** Usuario Logueado */
	public user:any = {};

	/** Objeto de configuración de la aplicación */
	public settings: ConfigurationSettings; 

	/** Tranductor */
	public translator: TranslatorHandler;

	/** Datos de la request */
	public requestData: RequestData = {
		lang: ApplicationLenguages.en,
		requestId: "",
		ipAddress: ""
	};
	
	constructor(deps:ApplicationContextDependencies){

		/** Agregamos las configuraciones */
		this.settings = deps.settings;

		/** Agregamos el translator */
		this.translator = this.AddTranslator(deps);
	}

	/** Agregamos el traductor */
	private AddTranslator(deps: ApplicationContextDependencies) : TranslatorHandler {
		
		/** Creamos el proveedor de traducciones */
		const translatorProvider = new TranslatorProvider({
			requestData: this.requestData,
			systemTranslatorProvider: SystemTranslatorProvider,
			businessTranslatorProvider: deps.businessTranslatorProvider
		})

		/** Agregamos el proveedor de traducciones */
		return new TranslatorHandler({ translatorProvider });
	}
}