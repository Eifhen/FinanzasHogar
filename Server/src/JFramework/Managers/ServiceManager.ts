
import { Application, RequestHandler } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { loadControllers, scopePerRequest } from "awilix-express";
import { asClass, asValue, AwilixContainer, createContainer, InjectionMode, Lifetime, LifetimeType } from "awilix";
import IDataBaseConnectionStrategy from "../Strategies/Database/IDataBaseConnectionStrategy";
import DatabaseStrategyDirector from "../Strategies/Database/DatabaseStrategyDirector";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { ErrorRequestHandler } from "express-serve-static-core";
import ApplicationContext from "../Application/ApplicationContext";
import CacheConnectionManager from "./CacheConnectionManager";
import { RedisClientType } from "redis";
import rateLimit from "express-rate-limit";
import RateLimiterManager from "../Security/RateLimiter/RateLimiterManager";
import { limiterConfig, Limiters } from '../Security/RateLimiter/Limiters';
import { ApplicationErrorMiddleware, ApplicationMiddleware } from "../Middlewares/types/MiddlewareTypes";
import { ClassConstructor, ClassInstance } from "../Utils/types/CommonTypes";


export default class ServiceManager {


	/** Instancia de express */
	private _app: Application;

	/** Ruta base de la aplicación */
	private _api_route: string = process.env.API_BASE_ROUTE ?? "";

	/** Ruta de los controladores */
	private _controllers_route: string = process.env.CONTROLLERS ?? "";

	/** Instancia del logger */
	private _logger: ILoggerManager;

	/** Propiedad que contiene nuestro contenedor de dependencias */
	private _container: AwilixContainer;

	/** Instancia del DatabaseStrategyDirector, el cual nos permite 
	* manipular la conección con la base de datos */
	private _databaseManager: DatabaseStrategyDirector<any, any> | null = null;

	constructor(app: Application) {
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MANAGER,
			entityName: "ServiceManager"
		});

		// Instanciamos la app de express
		this._app = app;

		// Creamos el contenedor de dependencias
		this._container = createContainer({
			injectionMode: InjectionMode.PROXY,
			strict: true,
		});

	}

	/** Método que permite resolver servicios */
	public Resolve<T>(serviceName: string): T {
		try {
			this._logger.Message(LoggerTypes.INFO, `Resolviendo servicio: ${serviceName}`);
			return this._container?.resolve<T>(serviceName);
		} catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, `No se pudo resolver el servicio: ${serviceName}`, err);
			throw new ApplicationException(
				"Resolve",
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
	public async AddControllers(): Promise<void> {
		try {
			this._logger.Activity("AddControllers");
			this._app.use(scopePerRequest(this._container));
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

	/** Método que permite agregar un servicio al contenedor */
	public AddService<I = any, T extends I = any>(
		name: string,
		implementation: new (...args: any[]) => T,
		lifetime: LifetimeType = Lifetime.SCOPED
	) {
		try {
			// this._logger.Activity(`AddService`);

			// Registrar la implementación asociada a la interfaz
			this._container?.register(
				name,
				asClass<T>(implementation, { lifetime })
			);

		} catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddService", err);
			throw new ApplicationException(
				"AddService",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}


	/** Permite registrar la instancia de una clase como singleton */
	public AddInstance<Clase>(name: string, implementation: ClassInstance<Clase>): void;
	public AddInstance<Interface, Clase extends Interface>(name: string, implementation: ClassInstance<Clase>): void
	public AddInstance<Interface, Clase extends Interface>(name: string, implementation: ClassInstance<Clase>): void {
		try {

			// Registrar la implementación asociada a la interfaz
			this._container?.register(name, asValue(implementation));

		} catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddService", err);
			throw new ApplicationException(
				"AddInstance",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Permite agregar un singleton en base a una clase */
	public AddSingleton<Class>(name: string, implementation: ClassConstructor<Class>): void;
	public AddSingleton<Interface, Class extends Interface>(name: string, implementation: ClassConstructor<Class>): void
	public AddSingleton<Interface, Class extends Interface>(name: string, implementation: ClassConstructor<Class>): void {
		try {
			// this._logger.Activity(`AddInstance`);
			let instance;
			const contextExists = this._container.hasRegistration("applicationContext");

			if (contextExists) {
				// Inyectamos el context
				const applicationContext = this.Resolve<ApplicationContext>("applicationContext");
				instance = new implementation({ applicationContext });
			} else {
				instance = new implementation();
			}
			// Registrar la implementación asociada a la interfaz
			this._container?.register(name, asValue(instance));
		} catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddService", err);
			throw new ApplicationException(
				"AddSingleton",
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
	public AddMiddleware(middleware: ApplicationMiddleware | ApplicationErrorMiddleware) {
		this._logger.Activity(`AddMiddleware`);
		this._app.use(middleware.Intercept as RequestHandler | ErrorRequestHandler);
	}

	/** Agrega middleware para validación del api */
	public AddApiValidation(middleware: ApplicationMiddleware) {
		this._logger.Activity(`AddApiValidation`);
		this.AddMiddleware(middleware);
	}

	/** Se conecta al servidor de caché y agrega un singleton 
	 * con dicha conección al contenedor de dependencias*/
	public async AddCacheClient() {

		const applicationContext = this.Resolve<ApplicationContext>("applicationContext");
		const cacheManager = new CacheConnectionManager({ applicationContext });
		const cacheClient = cacheManager.Connect();

		this.AddInstance<RedisClientType<any, any, any>>("cacheClient", cacheClient);
	}

	/** Permite agregar una instancia del RateLimiter 
	 * Middleware como singleton */
	public AddRateLimiters() {
		const cacheClient = this.Resolve<RedisClientType<any, any, any>>("cacheClient");
		const applicationContext = this.Resolve<ApplicationContext>("applicationContext");
		const manager = new RateLimiterManager({ cacheClient, applicationContext });

		/** Registramos los limiters según la configuración */
		Object.entries(limiterConfig).forEach(([limiterName, options]) => {
			manager.BuildStore(limiterName as Limiters, options);
			this._container?.register(limiterName, asValue(rateLimit(options)));
		});
	}

	/** Permite configurar el contexto de la aplicación */
	public AddAplicationContext() {
		this._logger.Activity(`AddAplicationContext`);
		this.AddInstance<ApplicationContext>("applicationContext", new ApplicationContext());
	}

	/** Método que permite agregar un director de estrategias */
	public async AddStrategy<Director, Strategy>(
		name: string,
		director: ClassConstructor<Director>,
		strategyType: ClassConstructor<Strategy>
	) {
		try {
			this._logger.Activity(`AddStrategy`);
			const applicationContext = this.Resolve<ApplicationContext>("applicationContext");
			const strategy = new strategyType({ applicationContext })
			const implementation = new director({ strategy, applicationContext });
			this.AddInstance<Director>(name, implementation);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddStrategy", err);

			throw new ApplicationException(
				"AddStrategy",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
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
			const applicationContext = this.Resolve<ApplicationContext>("applicationContext");

			// Crear una instancia de la estrategia con el parámetro resuelto
			const strategy = new strategyType({ applicationContext });

			// se inserta la estrategia al DatabaseManager
			const databaseManager = new DatabaseStrategyDirector({ strategy, applicationContext });

			// Se inicia la conección a la base de datos
			await databaseManager.Connect();

			const database = databaseManager.GetInstance();

			// Agrega la instancia de la base de datos al contenedor de dependencias
			this.AddInstance<InstanceType>("database", database);

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