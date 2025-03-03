import { asClass, asValue, AwilixContainer, createContainer, InjectionMode, Lifetime, LifetimeType } from "awilix";
import IContainerManager from "./types/IContainerManager";
import ILoggerManager, { LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import ApplicationContext from "../Application/ApplicationContext";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";
import { ClassInstance, ClassConstructor, FactoryFunction } from "../Utils/types/CommonTypes";


export default class ContainerManager implements IContainerManager {

	/** Propiedad que contiene nuestro contenedor de dependencias */
	private _container: AwilixContainer;

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(container?: AwilixContainer, logger?: ILoggerManager) {
		// Instanciamos el logger
		this._logger = logger || new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "ContainerManager"
		});

		this._container = container || createContainer({
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

	/** Permite resolver las dependencias de una clase */
	public ResolveClass<Class>(implementation: ClassConstructor<Class>): ClassInstance<Class> {
		try {
			this._logger.Message(LoggerTypes.INFO, `Resolviendo clase: ${implementation.name}`);
			const resolve = this._container.build(implementation);
			return resolve;
		}
		catch (err: any) {
			throw new ApplicationException(
				"ResolveClass",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Método que permite resolver las dependencias de una función factory */
	public ResolveFactory<Factory>(factory: FactoryFunction<Factory>) : Factory {
		try {
			this._logger.Message(LoggerTypes.INFO, `Resolviendo Factory: ${factory.name}`);
			const resolve = this._container.build(factory);
			return resolve;
		}
		catch (err: any) {
			throw new ApplicationException(
				"ResolveClass",
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
			// this._logger.Activity(`AddService`);

			// Registrar la implementación asociada a la interfaz
			this._container?.register(name, asClass<Class>(service, { lifetime }));

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

	/** Permite agregar un valor como singleton */
	public AddValue<ValueType>(name: string, value: ValueType): void {
		try {
			// Registrar la implementación asociada a la interfaz
			this._container?.register(name, asValue(value));

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

	/** Método que permite agregar un director de estrategias */
	public AddStrategy<Director, Strategy>(name: string, director: ClassConstructor<Director>, strategy: ClassConstructor<Strategy>): void {
		try {
			this._logger.Activity(`AddStrategy`);
			const applicationContext = this.Resolve<ApplicationContext>("applicationContext");
			const strategyImplementation = new strategy({ applicationContext })
			const classImplementation = new director({ strategyImplementation, applicationContext });

			this.AddInstance<Director>(name, classImplementation);
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

	/** Retornamos el contenedor de dependencias */
	public GetContainer(): AwilixContainer {
		try {
			this._logger.Activity(`GetContainer`);

			return this._container;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "GetContainer", err);

			throw new ApplicationException(
				"GetContainer",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Crea una instancia de ContainerManager usando un scope del contenedor actual */
	public CreateScopedManager(): IContainerManager {
		try {
			this._logger.Activity(`CreateScopedManager`);
			const scopedContainer = this._container.createScope();
			return new ContainerManager(scopedContainer, this._logger);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "CreateScopedManager", err);

			throw new ApplicationException(
				"CreateScopedManager",
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