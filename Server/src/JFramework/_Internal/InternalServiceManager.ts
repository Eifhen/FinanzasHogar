import ErrorHandlerMiddleware from "../ErrorHandling/ErrorHandlerMiddleware";
import EncrypterManager from "../Managers/EncrypterManager";
import { FileManager } from "../Managers/FileManager";
import IEmailManager from "../Emails/Interfaces/IEmailManager";
import IEncrypterManager from "../Managers/Interfaces/IEncrypterManager";
import IFileManager from "../Managers/Interfaces/IFileManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import ITokenManager from "../Managers/Interfaces/ITokenManager";
import LoggerManager from "../Managers/LoggerManager";
import TokenManager from "../Managers/TokenManager";
import IInternalServiceManager from "./Interfaces/IInternalServiceManager";
import IServiceManager from "./Interfaces/IServiceManager";
import ConfigurationSettings from '../Configurations/ConfigurationSettings';
import IContainerManager from "./Interfaces/IContainerManager";
import CacheConnectionManager from "../Managers/CacheConnectionManager";
import DatabaseConnectionManager from "../DataBases/DatabaseConnectionManager";
import SqlTransactionManager from "../DataBases/Generic/SqlTransactionManager";
import CloudStorageManager from "../CloudStorage/CloudStorageManager";
import IDatabaseConnectionManager from "../DataBases/Interfaces/IDatabaseConnectionManager";
import ICacheConnectionManager from "../Managers/Interfaces/ICacheConnectionManager";
import ISqlTransactionManager from "../DataBases/Interfaces/ISqlTransactionManager";
import EmailManager from "../Emails/EmailManager";
import { Application } from "express";
import { loadControllers } from "awilix-express";
import ICookieManager from "../Managers/Interfaces/ICookieManager";
import CookieManager from "../Managers/CookieManager";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { RedisClientType } from "redis";
import ApplicationContext from "../Context/ApplicationContext";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { limiterConfig, Limiters } from "../Security/RateLimiter/Limiters";
import RateLimiterManager from "../Security/RateLimiter/RateLimiterManager";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";


interface InternalServiceManagerDependencies {
	configurationSettings: ConfigurationSettings;
	serviceManager: IServiceManager,
	containerManager: IContainerManager;
	app: Application;
}

export class InternalServiceManager implements IInternalServiceManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Manejador de servicios */
	private readonly _serviceManager: IServiceManager;

	/** Ajustes de configuración */
	private readonly _configurationSettings: ConfigurationSettings;

	/** contenedor de dependencias */
	private readonly _containerManager: IContainerManager;

	/** Manejador de conección a la base de datos */
	private readonly _databaseConnecctionManager: IDatabaseConnectionManager;

	/** Manejador de conección a servidor caché */
	private readonly _cacheConnectionManager: ICacheConnectionManager;

	/** Instancia de express */
	private readonly _app: Application;

	constructor(deps: InternalServiceManagerDependencies) {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "InternalServiceManager"
		});

		this._serviceManager = deps.serviceManager;
		this._configurationSettings = deps.configurationSettings;
		this._containerManager = deps.containerManager;

		/** Agregamos el manejador de conección */
		this._databaseConnecctionManager = new DatabaseConnectionManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		});

		/** Agregamos el manejador de conección caché */
		this._cacheConnectionManager = new CacheConnectionManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		});

		/** Agregamos la instancia de express */
		this._app = deps.app;
	}

	/** Permite añadir endpoints de uso interno */
	public async AddInternalEndpoints(): Promise<void> {
		try {
			this._logger.Activity("AddInternalEndpoints");

			// Definimos la ruta base para endpoints internos, por ejemplo '/internal'
			const internalRoute = `${this._configurationSettings.apiData.baseRoute}`;

			// Definimos la ruta del directorio donde se encuentran los controladores internos.
			// Por ejemplo, suponiendo que están en src/InternalControllers:
			//  ../../API/Controllers/*.ts
			const internalControllersDir = './endpoints/*.ts';

			// Cargamos los controladores internos usando awilix-express
			this._app.use(
				internalRoute,
				loadControllers(internalControllersDir, { cwd: __dirname })
			);

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddInternalEndpoints", err);
			throw err;
		}
	}

	/** Agregamos las estrategias de desarrollo interno */
	public async AddInternalStrategies(): Promise<void> {
		try {
			this._logger.Activity("AddInternalStrategies");
			this._serviceManager.AddStrategyManager<CloudStorageManager>("cloudStorageManager", CloudStorageManager);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalStrategies", err);
			throw err;
		}
	}

	/** Agregamos los manejadores internos de la aplicación */
	public async AddInternalManagers(): Promise<void> {
		try {
			this._logger.Activity("AddInternalManagers");

			this._serviceManager.AddService<ISqlTransactionManager<any>, SqlTransactionManager>("sqlTransactionManager", SqlTransactionManager);
			this._serviceManager.AddService<IEncrypterManager, EncrypterManager>("encrypterManager", EncrypterManager);
			this._serviceManager.AddService<ITokenManager, TokenManager>("tokenManager", TokenManager);
			this._serviceManager.AddService<IEmailManager, EmailManager>("emailManager", EmailManager);
			this._serviceManager.AddService<IFileManager, FileManager>("fileManager", FileManager);
			this._serviceManager.AddService<ICookieManager, CookieManager>("cookieManager", CookieManager);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalManagers", err);
			throw err;
		}
	}

	/** Permite agregar una instancia del RateLimiter 
	 * Middleware como singleton */
	private AddRateLimiters(): void {
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

	/** Permite agregar la configuración de seguridad interna */
	public async AddInternalSecurity(): Promise<void> {
		try {
			this._logger.Activity("AddInternalSecurity");

			/** Agrega los RateLimiters */
			this.AddRateLimiters();

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalSecurity", err);
			throw err;
		}
	}

	/** Se agregan los manejadores de excepciones */
	public async AddExceptionManager(): Promise<void> {
		try {
			this._logger.Activity("AddExceptionHandlers");

			/** Agregamos el middleware para manejo de errores 
			* Debe ser el último de la lista siempre*/
			this._serviceManager.AddMiddleware(ErrorHandlerMiddleware);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddExceptionHandlers", err);
			throw err;
		}
	}

	/** Conectar a los servicios que realizan conecciones */
	public async RunConnectionServices(): Promise<void> {
		try {
			this._logger.Activity("RunConnectionServices");

			/** Realizamos la conección a la base de datos */
			await this._databaseConnecctionManager.Connect();

			/** Realiza conección con el cliente de caché (Redis) */
			await this._cacheConnectionManager.Connect();

		} catch (err: any) {
			this._logger.Error("FATAL", "RunConnectionServices", err);
			throw err;
		}
	}

	/** Desconectar los servicios que realizan conecciones */
	public async DisconnectConnectionServices(): Promise<void> {
		try {
			this._logger.Activity("DisconnectConnectionServices");

			/** Cerramos la conección con la base de datos */
			await this._databaseConnecctionManager.Disconnect();

			/** Cerramos la conección con el servidor caché */
			await this._cacheConnectionManager.Disconnect();

		} catch (err: any) {
			this._logger.Error("FATAL", "DisconnectConnectionServices", err);
			throw err;
		}
	}

}