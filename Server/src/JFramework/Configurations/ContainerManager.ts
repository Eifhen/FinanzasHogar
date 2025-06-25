
import { asClass, asValue, AwilixContainer, BuildResolverOptions, ClassOrFunctionReturning, createContainer, InjectionMode, Lifetime, LifetimeType, Resolver } from "awilix";
import IContainerManager from "./Interfaces/IContainerManager";
import ILoggerManager, { LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";
import { ClassInstance, ClassConstructor, FactoryFunction } from "../Utils/Types/CommonTypes";
import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";
import ApplicationContext from "./ApplicationContext";


@AutoClassBinder
export default class ContainerManager implements IContainerManager {

	/** Propiedad que contiene nuestro contenedor de dependencias */
	private _container: AwilixContainer;

	/** Instancia del logger */
	private _logger: ILoggerManager;

	/** Identificador */
	public _identifier: string = "ROOT_CONTAINER";

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
	public ResolveFactory<Factory>(factory: FactoryFunction<Factory>): Factory {
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
	public AddClass<Interface, Class extends Interface>(name: string, service: ClassConstructor<Class>, lifetime: LifetimeType = Lifetime.SCOPED) {
		try {
			this._logger.Message("INFO",`Añadiendo clase ${name}`);

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
			this._logger.Message("INFO",`Añadiendo instancia ${name}`);
			
			// Registrar la implementación asociada a la interfaz
			this._container?.register(name, asValue(implementation));

		} catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "AddInstance", err);
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
			this._logger.Message("INFO",`Añadiendo singleton ${name}`);
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
			this._logger.Message("INFO",`Añadiendo objeto ${name}`);

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
	public CreateScopedContainer(): IContainerManager {
		try {
			this._logger.Activity(`CreateScopedContainer`);
			const scopedContainer = this._container.createScope();
			// console.log("Scoped container =>", scopedContainer);

			return new ContainerManager(scopedContainer, this._logger);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "CreateScopedContainer", err);

			throw new ApplicationException(
				"CreateScopedContainer",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Revisa si el registro indicado existe dentro 
	 * del contenedor de dependencias */
	public CheckRegistration(name:string) : boolean {
		try {
			this._logger.Activity(`CheckRegistration`);
			return this._container.hasRegistration(name);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "CheckRegistration", err);

			throw new ApplicationException(
				"CheckRegistration",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}


	/** Reescribimos la implementación del método build de awilix,
	 * esta implementación de build es llamada por la función `loadControllers`,
	 * awilix utiliza build para resolver sus dependencias internas al 
	 * momento de resolver los controladores, en este caso estamos pasando 
	 * una instancia de ContainerManager al objeto request (ver interfaz ApplicationRequest)
	 * por esta razón necesitamos implementar nosotros el método build, para poder entonces
	 * pasar una instancia del ContainerManager al objeto request en lugar de una instancia
	 * directa del contenedor de awilix
	 */
	public build<Factory>(
		targetOrResolver: ClassOrFunctionReturning<Factory> | Resolver<Factory>,
		opts?: BuildResolverOptions<Factory>
	): Factory {
		try {
			this._logger.Activity("Build");
			
			return this._container.build(targetOrResolver, opts);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Build", err);
			throw new ApplicationException(
				"Build",
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