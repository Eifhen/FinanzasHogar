import { Application } from "express";
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { DEFAULT_JSON_RESPONSE_LIMIT, NO_REQUEST_ID } from "../Utils/const";
import { AutoClassBinder } from "../Decorators/AutoBind";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import IContainerManager from "./Interfaces/IContainerManager";
import LoggerManager from "../Managers/LoggerManager";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";
import ApplicationContext from "../Context/ApplicationContext";
import AttachContainerMiddleware from "../Middlewares/AttachContainerMiddleware";
import IServiceManager from "./Interfaces/IServiceManager";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { RedisClientType } from "redis";
import { limiterConfig, Limiters } from "../Security/RateLimiter/Limiters";
import RateLimiterManager from "../Security/RateLimiter/RateLimiterManager";
import IServerConfiguration from "./Interfaces/IServerConfiguration";

interface IServerConfigurationDependencies {
	app: Application;
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
	serviceManager: IServiceManager;
}

@AutoClassBinder
export default class ServerConfiguration implements IServerConfiguration {

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

	/** Permite agregar una instancia del RateLimiter 
	 * Middleware como singleton */
	public AddRateLimiters(): void {
		try {
			this._logger.Activity("AddRateLimiters");
			const cacheClient = this._containerManager.Resolve<RedisClientType<any, any, any>>("cacheClient");
			const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");
			const manager = new RateLimiterManager({ cacheClient, applicationContext });

			/** Registramos los limiters según la configuración */
			Object.entries(limiterConfig).forEach(([limiterName, options]) => {
				manager.BuildStore(limiterName as Limiters, options);
				this._containerManager.AddValue<RateLimitRequestHandler>(limiterName, rateLimit(options));
			});
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddRateLimiters", err);
			throw new ApplicationException(
				"AddRateLimiters",
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

	/** Método que maneja los Cors de la aplicación */
	public AddCorsConfiguration(options?: CorsOptions): void {
		try {
			this._logger.Activity("AddCorsConfiguration");

			this._app.use(cors({
				origin: this._configurationSettings.securityConfig.allowedOrigins,
				methods: 'GET,PUT,POST,DELETE',
				credentials: true,
				...options
			}));

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddCorsConfiguration", err);
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

}