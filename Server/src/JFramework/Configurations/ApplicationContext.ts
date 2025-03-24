import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import { ITranslationProvider } from "../Translations/Interfaces/ITranslatorProvider";
import SystemTranslatorProvider from "../Translations/SystemTranslatorProvider";
import TranslatorHandler from "../Translations/TranslatorHandler";
import TranslatorProvider from "../Translations/TranslatorProvider";
import { ApplicationLenguage, ApplicationLenguages } from "../Translations/Types/ApplicationLenguages";
import { ClassConstructor } from "../Utils/Types/CommonTypes";


export interface ApplicationContextDependencies {
	settings: ConfigurationSettings;
	businessTranslatorProvider?: ClassConstructor<ITranslationProvider>;
}

/*** Clase que maneja el contexto de ejecución la aplicación */
export default class ApplicationContext {

	/** Usuario Logueado */
	public user:any = {};

	/** Id de la request en curso */
	public requestID: string = "";

	/** Ip del request en curso */
	public ipAddress: string = "";
	
	/** Contiene el lenguaje disponible en la aplicación  (esto nos llega en la request)*/
	public lang: ApplicationLenguage = ApplicationLenguages.en;

	/** Objeto de configuración de la aplicación */
	public settings: ConfigurationSettings; 

	/** Tranductor */
	public translator: TranslatorHandler;
	
	constructor(deps:ApplicationContextDependencies){

		/** Agregamos las configuraciones */
		this.settings = deps.settings;

		this.translator = this.AddTranslator(deps);
	}

	/** Agregamos el traductor */
	private AddTranslator(deps: ApplicationContextDependencies) : TranslatorHandler {
		
		/** Creamos el proveedor de traducciones */
		const translatorProvider = new TranslatorProvider({
			lang: this.lang,
			requestId: this.requestID,
			systemTranslatorProvider: SystemTranslatorProvider,
			businessTranslatorProvider: deps.businessTranslatorProvider
		})

		/** Agregamos el proveedor de traducciones */
		return new TranslatorHandler({ translatorProvider });
	}
}