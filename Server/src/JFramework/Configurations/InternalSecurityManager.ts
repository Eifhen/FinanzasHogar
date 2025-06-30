import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { RedisClientType } from "redis";
import ApplicationException from "../ErrorHandling/ApplicationException";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { limiterConfig, Limiters } from "../Security/RateLimiter/Limiters";
import RateLimiterManager from "../Security/RateLimiter/RateLimiterManager";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";
import ApplicationContext from "./ApplicationContext";
import IInternalSecurityManager from "./Interfaces/IInternalSecurityManager";
import IContainerManager from "./Interfaces/IContainerManager";
import ConfigurationSettings from "./ConfigurationSettings";





interface InternalSecurityManagerDependencies {
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
	applicationContext: ApplicationContext;
}

export default class InternalSecurityManager implements IInternalSecurityManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** contenedor de dependencias */
	private readonly _containerManager: IContainerManager;

	/** Ajustes de configuración */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;


	constructor(deps: InternalSecurityManagerDependencies) {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "InternalSecurityManager"
		});

		this._configurationSettings = deps.configurationSettings;
		this._containerManager = deps.containerManager;
		this._applicationContext = deps.applicationContext;
	}

	/** Permite agregar una instancia del RateLimiter 
		 * Middleware como singleton */
	public AddRateLimiters(): void {
		try {
			this._logger.Activity("AddRateLimiters");
			const cacheClient = this._containerManager.Resolve<RedisClientType<any, any, any>>("cacheClient");
		
			const manager = new RateLimiterManager({ 
				cacheClient, 
				applicationContext: this._applicationContext 
			});

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

}