import { Application } from "express";
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { DEFAULT_JSON_RESPONSE_LIMIT, NO_REQUEST_ID } from "../Utils/const";
import { AutoClassBinder } from "../Decorators/AutoBind";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import IContainerManager from "./Interfaces/IContainerManager";
import LoggerManager from "../Managers/LoggerManager";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { HttpStatusName, HttpStatusCode, HttpAllowedMethods } from "../Utils/HttpCodes";
import ApplicationContext from "../Context/ApplicationContext";
import AttachContainerMiddleware from "../Middlewares/AttachContainerMiddleware";
import IServiceManager from "./Interfaces/IServiceManager";
import IServerConfigurationManager from "./Interfaces/IServerConfigurationManager";
import cookieParser, { CookieParseOptions } from "cookie-parser";
import TokenManager from "../Managers/TokenManager";

interface IServerConfigurationDependencies {
	app: Application;
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
	serviceManager: IServiceManager;
}

@AutoClassBinder
export default class ServerConfigurationManager implements IServerConfigurationManager {

	/** Instanciamos el logger */
	private readonly _logger = new LoggerManager({
		entityCategory: "CONFIGURATION",
		entityName: "ServerConfiguration"
	});

	/** Instancia de express */
	private readonly _app: Application;

	/** Manejador de contenedor */
	private readonly _containerManager: IContainerManager;

	/** Objeto de configuración del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Manejador de servicios */
	private readonly _serviceManager: IServiceManager;


	constructor(deps: IServerConfigurationDependencies) {

		/** Inicializamos nuestra instancia de express */
		this._app = deps.app;
		this._containerManager = deps.containerManager;
		this._configurationSettings = deps.configurationSettings;
		this._serviceManager = deps.serviceManager;
	}

	/** Agrega el contenedor de dependencias */
	public AddContainer(): void {
		try {
			// this._app.use(scopePerRequest(this._containerManager.GetContainer()));
			this._logger.Activity("AddContainer");
			const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");
			const attachContainer = new AttachContainerMiddleware({
				containerManager: this._containerManager,
				applicationContext
			});

			this._serviceManager.AddMiddlewareInstance(attachContainer);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddContainer", err);
			throw new ApplicationException(
				"AddContainer",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Método que maneja la respuesta JSON de la aplicación */
	public AddJsonResponseConfiguration(limit: string = DEFAULT_JSON_RESPONSE_LIMIT) {
		try {
			this._logger.Activity("AddJsonResponseConfiguration");

			const json = express.json({ limit });
			this._app.use(json);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddJsonResponseConfiguration", err);
			throw new ApplicationException(
				"AddJsonResponseConfiguration",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Método que maneja los Cors de la aplicación */
	public AddCorsConfiguration(options?: CorsOptions): void {
		try {
			this._logger.Activity("AddCorsConfiguration");

			this._app.use(cors({
				origin: this._configurationSettings.securityConfig.allowedOrigins,
				methods: Object.values(HttpAllowedMethods).join(","), // 'GET,PUT,POST,DELETE',
				credentials: true, // indica si el servidor permite el pase de cookies
				...options
			}));

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddCorsConfiguration", err);
			throw new ApplicationException(
				"AddCorsConfiguration",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Permite añadir la configuración de las cookies */
	public async AddCookieConfiguration(options?: CookieParseOptions): Promise<void> {
		try {
			this._logger.Activity("AddCookieConfiguration");

			/** LLamamos al applicationContext del contenedor de dependencias */
			const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");
			
			/** Creamos una instancia de tokenManager para generar tokens */
			const tokenManager = new TokenManager({ applicationContext });

			/** Generamos un token que nos va a servir como clave secreta. 
			 * Al generar la clave de forma dinámica, se generará un nuevo token cada 
			 * vez que se reinicie el servidor. Esto significa que cualquier cookie que tengan nuestros
			 * usuarios quedará invalidada. Esto puede solucionarse pasando una clave fija
			 * mediante una variable de entorno. Por el momento genero la clave 
			 * dinámicamente para mayor seguridad, ya que por el momento la unica cookie que pensamos tener
			 * son los tokens CSRF y los token JWT de autenticación y por el momento no nos molesta
			 * que los usuarios tengan que iniciar sesión de nuevo si el servidor se reinicia. */
			const secret = await tokenManager.GenerateToken();

			/** Agregamos el parser como middleware y pasamos 
			 * la clave secreta para firmar las cookies */
			this._app.use(cookieParser(secret, {
				...options,
			}));

		}
		catch(err:any){
			this._logger.Error("FATAL", "AddCookieConfiguration", err);
			throw new ApplicationException(
				"AddCookieConfiguration",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

}