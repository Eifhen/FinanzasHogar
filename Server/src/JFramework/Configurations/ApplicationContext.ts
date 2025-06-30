/* eslint-disable @typescript-eslint/no-this-alias */

import ConfigurationSettings from "./ConfigurationSettings";
import { ITranslationProvider } from "../Translations/Interfaces/ITranslatorProvider";
import SystemTranslatorProvider from "../Translations/Providers/SystemTranslatorProvider";
import TranslatorHandler from "../Translations/TranslatorHandler";
import TranslatorProvider from "../Translations/Providers/TranslatorProvider";
import { ApplicationLenguages } from "../Translations/Types/ApplicationLenguages";
import { ClassConstructor } from "../Utils/Types/CommonTypes";
import { RequestContext, ServerContext } from "./Types/ContextTypes";
import IContainerManager from "./Interfaces/IContainerManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import { NO_REQUEST_ID } from "../Utils/const";


export interface ApplicationContextDependencies {
	settings: ConfigurationSettings;
	businessTranslatorProvider?: ClassConstructor<ITranslationProvider>;
	rootContainerManager: IContainerManager;
}

/*** Clase que maneja el contexto de ejecución la aplicación */
export default class ApplicationContext {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Usuario Logueado */
	public user: any = {};

	/** Objeto de configuración de la aplicación */
	public settings: ConfigurationSettings;

	/** Tranductor */
	public language: TranslatorHandler;

	/** Contexto de la request en curso */
	public requestContext: RequestContext = {
		lang: ApplicationLenguages.en,
		requestId: "",// NO_REQUEST_ID,
		ipAddress: ""
	};

	/** Contexto del servidor*/
	public serverContext: ServerContext = {
		rootContainer: null
	}

	constructor(deps: ApplicationContextDependencies) {

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "CONTEXT",
			entityName: "ApplicationContext"
		});

		/** Agregamos las configuraciones */
		this.settings = deps.settings;

		/** Agregamos el translator */
		this.language = this.AddTranslator(deps.businessTranslatorProvider);

		/** Agregamos el root container al serverContext */
		this.serverContext.rootContainer = deps.rootContainerManager;

		/** Agregamos la instancia al contenedor de dependencias */
		this.AddToContainer(deps.rootContainerManager);
	}

	/** Agregamos el traductor */
	private AddTranslator(businessTranslatorProvider?: ClassConstructor<ITranslationProvider>): TranslatorHandler {
		try {
			this._logger.Activity("AddTranslator");

			/** Creamos el proveedor de traducciones */
			const translatorProvider = new TranslatorProvider({
				requestContext: this.requestContext,
				systemTranslatorProvider: SystemTranslatorProvider,
				businessTranslatorProvider
			})

			/** Agregamos el proveedor de traducciones */
			return new TranslatorHandler({ translatorProvider });
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddTranslator", err);
			throw new InternalServerException("AddTranslator", "Error agregando el traductor", this, __filename, err);
		}
	}

	/** Agregamos la instancia de ApplicationContext al container */
	private AddToContainer(rootContainer: IContainerManager) {
		try {
			this._logger.Activity("AddToContainer");

			/** Obtenemos la instancia */
			const instance = this;

			/**  agregamos la instancia al contenedor */
			rootContainer.AddInstance<ApplicationContext>("applicationContext", instance);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddToContainer", err);
			throw new InternalServerException("AddToContainer", "Error agregando la instancia al container", this, __filename, err);
		}

	}

}