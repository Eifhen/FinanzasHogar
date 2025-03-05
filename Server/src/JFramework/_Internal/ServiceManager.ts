
import { Application, RequestHandler } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { loadControllers } from "awilix-express";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { ErrorRequestHandler } from "express-serve-static-core";
import ApplicationContext from "../Application/ApplicationContext";
import { RedisClientType } from "redis";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import RateLimiterManager from "../Security/RateLimiter/RateLimiterManager";
import { limiterConfig, Limiters } from '../Security/RateLimiter/Limiters';
import { ApplicationErrorMiddleware, ApplicationMiddleware } from "../Middlewares/types/MiddlewareTypes";
import { ClassConstructor, ClassInstance } from "../Utils/types/CommonTypes";
import IContainerManager from "./types/IContainerManager";
import AttachContainerMiddleware from "../Middlewares/AttachContainerMiddleware";
import { Lifetime, LifetimeType } from "awilix";
import IServiceManager from "./types/IServiceManager";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";


interface IServiceManagerDependencies {
	app: Application;
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
}

/** Maneja la implementación de todo tipo de servicios
 *  ya sea a la cadena de middlewares o al contenedor de dependencias */
export default class ServiceManager implements IServiceManager {


	/** Instancia de express */
	private readonly _app: Application;

	/** Manejador de contenedor */
	private readonly _containerManager: IContainerManager;

	/** Ruta base de la aplicación */
	private readonly _api_route: string = process.env.API_BASE_ROUTE ?? "";

	/** Ruta de los controladores */
	private readonly _controllers_route: string = process.env.CONTROLLERS ?? "";

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Objeto de configuración del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	constructor(deps: IServiceManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MANAGER,
			entityName: "ServiceManager"
		});

		/** Instanciamos la app de express */
		this._app = deps.app;

		/** Agregamos el contenedor de dependencias */
		this._containerManager = deps.containerManager;

		/** Agregamos el objeto de configuración del sistema */
		this._configurationSettings = deps.configurationSettings;
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
	public AddMiddleware(middleware: ClassConstructor<ApplicationMiddleware | ApplicationErrorMiddleware>): void {
		this._logger.Activity(`AddMiddleware`);
		const instance = this._containerManager.ResolveClass(middleware);
		this._app.use(instance.Intercept as RequestHandler | ErrorRequestHandler);
	}

	public AddMiddlewareInstance(instance: ClassInstance<ApplicationMiddleware | ApplicationErrorMiddleware>): void {
		this._logger.Activity(`AddMiddlewareInstance`);
		this._app.use(instance.Intercept as RequestHandler | ErrorRequestHandler);
	}

	/** Permite agregar una instancia del RateLimiter 
	 * Middleware como singleton */
	public AddRateLimiters(): void {
		const cacheClient = this._containerManager.Resolve<RedisClientType<any, any, any>>("cacheClient");
		const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");
		const manager = new RateLimiterManager({ cacheClient, applicationContext });

		/** Registramos los limiters según la configuración */
		Object.entries(limiterConfig).forEach(([limiterName, options]) => {
			manager.BuildStore(limiterName as Limiters, options);
			this._containerManager.AddValue<RateLimitRequestHandler>(limiterName, rateLimit(options));
		});
	}
 
	/** Permite configurar el contexto de la aplicación */
	public AddAplicationContext(): void {
		this._logger.Activity(`AddAplicationContext`);
		this._containerManager.AddInstance<ApplicationContext>(
			"applicationContext", 
			new ApplicationContext(this._configurationSettings)
		);
	}

	/** Método que permite agregar un servicio al contenedor */
	public AddService<Interface, Class extends Interface>(name: string, service: ClassConstructor<Class>, lifetime: LifetimeType = Lifetime.SCOPED) {
		try {
			this._logger.Message(`INFO`, `Añadiendo servicio: ${name}`);

			// Registrar la implementación asociada a la interfaz
			this._containerManager.AddClass(name, service, lifetime);

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

	/** Método que permite agregar un director de estrategias */
	public AddStrategy<Director, Strategy>(name: string, director: ClassConstructor<Director>, strategy: ClassConstructor<Strategy>): void {
		try {
			this._logger.Activity(`AddStrategy`);
			const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");
			const strategyImplementation = new strategy({ applicationContext })
			const classImplementation = new director({ strategy: strategyImplementation, applicationContext });

			this._containerManager.AddInstance<Director>(name, classImplementation);
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

}