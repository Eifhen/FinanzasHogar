
import { Application, RequestHandler } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { loadControllers } from "awilix-express";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { ErrorRequestHandler } from "express-serve-static-core";
import { ApplicationErrorMiddleware, ApplicationMiddleware } from "../Middlewares/Types/MiddlewareTypes";
import { ClassConstructor, ClassInstance } from "../Utils/Types/CommonTypes";
import IContainerManager from "./Interfaces/IContainerManager";
import { Lifetime, LifetimeType } from "awilix";
import IServiceManager from "./Interfaces/IServiceManager";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import ApplicationContext  from "./ApplicationContext";


export interface IServiceManagerDependencies {
	app: Application;
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
}

/** Maneja la implementación de todo tipo de servicios
 *  ya sea a la cadena de middlewares o al contenedor de dependencias */
export default class ServiceManager implements IServiceManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Instancia de express */
	private readonly _app: Application;

	/** Manejador de contenedor */
	private readonly _containerManager: IContainerManager;

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

	/** Agrega los controladores a la aplicación de express */
	public AddControllers(): void {
		try {
			this._logger.Activity("AddControllers");
			
			/** Obtenemos el path para los controladores del negocio */
			const path = this._configurationSettings.apiData.controllersPath.businessControllersPath;

			/** Obtenemos la ruta base de la app */
			const apiRoute = this._configurationSettings.apiData.baseRoute;

			/** Agregamos los controllers a la cadena de middlewares */
			this._app.use(
				apiRoute,
				loadControllers(path, { cwd: __dirname })
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
	public AddMiddleware<T extends ApplicationMiddleware | ApplicationErrorMiddleware>(middleware: ClassConstructor<T>): void {
		try {
			this._logger.Activity(`AddMiddleware`);
			const instance = this._containerManager.ResolveClass(middleware);
			this._app.use(instance.Intercept as RequestHandler | ErrorRequestHandler);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddMiddleware", err);
			throw new ApplicationException(
				"AddMiddleware",
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
	public AddMiddlewareInstance(instance: ClassInstance<ApplicationMiddleware | ApplicationErrorMiddleware>): void {
		try {
			this._logger.Activity(`AddMiddlewareInstance`);
			this._app.use(instance.Intercept as RequestHandler | ErrorRequestHandler);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddMiddlewareInstance", err);
			throw new ApplicationException(
				"AddMiddlewareInstance",
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

	/** Permite agregar un manager que maneja sus propias estrategias 
   * Para esto el método inyecta el contenedor de dependencias directamente al manager */
	public AddStrategyManager<Class>(name:string, classManager: ClassConstructor<Class>) : void {
		try {
			this._logger.Activity(`AddStrategyManager`);
			const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");
			
			const classImplementation = new classManager({ 
				containerManager: this._containerManager, 
				applicationContext 
			});

			this._containerManager.AddInstance<Class>(name, classImplementation);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddStrategyManager", err);

			throw new ApplicationException(
				"AddStrategyManager",
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