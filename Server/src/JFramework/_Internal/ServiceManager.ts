
import { Application, RequestHandler } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { loadControllers } from "awilix-express";
import IDataBaseConnectionStrategy from "../Strategies/Database/IDataBaseConnectionStrategy";
import DatabaseStrategyDirector from "../Strategies/Database/DatabaseStrategyDirector";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { ErrorRequestHandler } from "express-serve-static-core";
import ApplicationContext from "../Application/ApplicationContext";
import CacheConnectionManager from "../Managers/CacheConnectionManager";
import { RedisClientType } from "redis";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import RateLimiterManager from "../Security/RateLimiter/RateLimiterManager";
import { limiterConfig, Limiters } from '../Security/RateLimiter/Limiters';
import { ApplicationErrorMiddleware, ApplicationMiddleware } from "../Middlewares/types/MiddlewareTypes";
import { ClassConstructor, ClassInstance } from "../Utils/types/CommonTypes";
import IContainerManager from "./types/IContainerManager";
import AttachContainerMiddleware from "../Middlewares/AttachContainerMiddleware";


interface IServiceManagerDependencies {
	app: Application;
	containerManager: IContainerManager;
}

/** Maneja la implementación de todo tipo de servicios
 *  ya sea a la cadena de middlewares o al contenedor de dependencias */
export default class ServiceManager {


	/** Instancia de express */
	private readonly _app: Application;

	/** Manejador de contenedor */
	readonly container: IContainerManager;

	/** Ruta base de la aplicación */
	private readonly _api_route: string = process.env.API_BASE_ROUTE ?? "";

	/** Ruta de los controladores */
	private readonly _controllers_route: string = process.env.CONTROLLERS ?? "";

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Instancia del DatabaseStrategyDirector, el cual nos permite 
	* manipular la conección con la base de datos */
	private _databaseManager: DatabaseStrategyDirector<any, any> | null = null;


	constructor(deps: IServiceManagerDependencies) {
		 /** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MANAGER,
			entityName: "ServiceManager"
		});

		/** Instanciamos la app de express */
		this._app = deps.app;

		/** Agregamos el contenedor de dependencias */
		this.container = deps.containerManager;
	}

	/** Agrega el contenedor de dependencias */
	public AddContainer() : void {
		try {
			this._logger.Activity("AddContainer");
			// this._app.use(scopePerRequest(this._containerManager.GetContainer()));
			const attachContainer = new AttachContainerMiddleware(this.container);
			this.AddMiddlewareInstance(attachContainer);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddContainer", err);
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

	/** Agrega los controladores a la aplicación de express */
	public AddControllers(): void {
		try {
			this._logger.Activity("AddControllers");
			this._app.use(
				this._api_route,
				loadControllers(this._controllers_route, { cwd: __dirname })
			);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddControllers", err);
			throw new ApplicationException(
				"AddControllers",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Agrega un middleware a la aplicación */
	public AddMiddleware(middleware: ClassConstructor<ApplicationMiddleware | ApplicationErrorMiddleware>) {
		this._logger.Activity(`AddMiddleware`);
		const instance = this.container.ResolveClass(middleware);
		this._app.use(instance.Intercept as RequestHandler | ErrorRequestHandler);
	}

	public AddMiddlewareInstance(instance: ClassInstance<ApplicationMiddleware | ApplicationErrorMiddleware>){
		this._logger.Activity(`AddMiddlewareInstance`);
		this._app.use(instance.Intercept as RequestHandler | ErrorRequestHandler);
	}

	/** Se conecta al servidor de caché y agrega un singleton 
	 * con dicha conección al contenedor de dependencias*/
	public AddCacheClient() {
		const applicationContext = this.container.Resolve<ApplicationContext>("applicationContext");
		const cacheManager = new CacheConnectionManager({ applicationContext });
		const cacheClient = cacheManager.Connect();

		this.container.AddInstance<RedisClientType<any, any, any>>("cacheClient", cacheClient);
	}

	/** Permite agregar una instancia del RateLimiter 
	 * Middleware como singleton */
	public AddRateLimiters() {
		const cacheClient = this.container.Resolve<RedisClientType<any, any, any>>("cacheClient");
		const applicationContext = this.container.Resolve<ApplicationContext>("applicationContext");
		const manager = new RateLimiterManager({ cacheClient, applicationContext });

		/** Registramos los limiters según la configuración */
		Object.entries(limiterConfig).forEach(([limiterName, options]) => {
			manager.BuildStore(limiterName as Limiters, options);
			this.container.AddValue<RateLimitRequestHandler>(limiterName, rateLimit(options));
		});
	}

	/** Permite configurar el contexto de la aplicación */
	public AddAplicationContext() {
		this._logger.Activity(`AddAplicationContext`);
		this.container.AddInstance<ApplicationContext>("applicationContext", new ApplicationContext());
	}

	/** 
	 * @param {DatabaseStrategyDirector} dbManager - Manejador de base de datos
	 * @param {IDataBaseConnectionStrategy} strategy - Estrategia de connección a base de datos
	 * @description - Reliza la connección a la base de datos en base a la estrategia 
	 * definida y devuelve la instancia de la conección a la DB.
	*/
	public async AddDataBaseConnection<ConnectionType, InstanceType>(
		strategyType: ClassConstructor<IDataBaseConnectionStrategy<ConnectionType, InstanceType>>
	): Promise<void> {
		try {
			this._logger.Activity(`AddDataBaseConnection`);

			// obtenemos el contexto
			const applicationContext = this.container.Resolve<ApplicationContext>("applicationContext");

			// Crear una instancia de la estrategia con el parámetro resuelto
			const strategy = new strategyType({ applicationContext });

			// se inserta la estrategia al DatabaseManager
			const databaseManager = new DatabaseStrategyDirector({ strategy, applicationContext });

			// Se inicia la conección a la base de datos
			await databaseManager.Connect();

			const database = databaseManager.GetInstance();

			// Agrega la instancia de la base de datos al contenedor de dependencias
			this.container.AddInstance<InstanceType>("database", database);

			/** Se pasa por referencia el objeto databaseManager */
			this._databaseManager = databaseManager;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddDataBaseConnection", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"AddDataBaseConnection",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Cierra la coneccion a la base de datos */
	public async CloseDataBaseConnection(): Promise<void> {
		try {
			this._logger.Activity("CloseDataBaseConnection");
			await this._databaseManager?.CloseConnection();
		}
		catch (err: any) {
			this._logger.Error("FATAL", "CloseDataBaseConnection", err);
			if (err instanceof ApplicationException) {
				throw err;
			}
			throw new ApplicationException(
				"CloseDataBaseConnection",
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