import { loadControllers } from "awilix-express";
import { Application } from "express";
import DatabaseConnectionManager from "../External/DataBases/DatabaseConnectionManager";
import SqlTransactionManager from "../External/DataBases/Generic/SqlTransactionManager";
import IDatabaseConnectionManager from "../External/DataBases/Interfaces/IDatabaseConnectionManager";
import ISqlTransactionManager from "../External/DataBases/Interfaces/ISqlTransactionManager";
import ErrorHandlerMiddleware from "../ErrorHandling/ErrorHandlerMiddleware";
import CacheConnectionManager from "../Managers/CacheConnectionManager";
import EmailManager from "../Managers/EmailManager";
import EncrypterManager from "../Managers/EncrypterManager";
import { FileManager } from "../Managers/FileManager";
import ICacheConnectionManager from "../Managers/Interfaces/ICacheConnectionManager";
import IEmailManager from "../Managers/Interfaces/IEmailManager";
import IEncrypterManager from "../Managers/Interfaces/IEncrypterManager";
import IFileManager from "../Managers/Interfaces/IFileManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import ITokenManager from "../Managers/Interfaces/ITokenManager";
import LoggerManager from "../Managers/LoggerManager";
import TokenManager from "../Managers/TokenManager";
import { BUSINESS_DATABASE_INSTANCE_NAME, INTERNAL_DATABASE_INSTANCE_NAME } from "../Utils/const";
import ConfigurationSettings from "./ConfigurationSettings";
import IContainerManager from "./Interfaces/IContainerManager";
import IInternalServiceManager from "./Interfaces/IInternalServiceManager";
import IServiceManager from "./Interfaces/IServiceManager";
import CloudStorageManager from "../External/CloudStorage/CloudStorageManager";
import IInternalSecurityService from "../API/Services/Interfaces/IInternalSecurityService";
import InternalSecurityService from "../API/Services/InternalSecurityService";
import { ConnectionEnvironment } from "./Types/IConnectionService";
import IProyectsInternalRepository from "../API/DataAccess/Repositories/Interfaces/IProyectsInternalRepository";
import ProyectsInternalRepository from "../API/DataAccess/Repositories/ProyectsInternalRepository";
import ITenantsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantsInternalRepository";
import TenantsInternalRepository from "../API/DataAccess/Repositories/TenantsInternalRepository";
import ITenantDetailsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantDetailsInternalRepository";
import TenantDetailsInternalRepository from "../API/DataAccess/Repositories/TenantDetailsInternalRepository";
import IInternalTenantService from "../API/Services/Interfaces/IInternalTenantService";
import InternalTenantService from "../API/Services/InternalTenantService";
import IInternalSecurityManager from "./Interfaces/IInternalSecurityManager";
import InternalSecurityManager from "./InternalSecurityManager";



export interface InternalServiceManagerDependencies {
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

	/** Manejador de seguridad interna */
	private readonly _internalSecurityManager: IInternalSecurityManager;

	/** Manejador de conexón a la base de datos de uso interno */
	private readonly _internalDatabaseConnecctionManager: IDatabaseConnectionManager;

	/** Manejador de conexión de base de datos para el negocio si la variable isMultitenant 
	 * en el objeto de configuración es true, entonces este objeto será undefined*/
	private readonly _businessDatabaseConnectionManager?: IDatabaseConnectionManager;

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

		/** Agregamos el manager de seguridad internal */
		this._internalSecurityManager = new InternalSecurityManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings,
		});

		/** Agregamos el manejador de conexión para la base de datos de uso interno */
		this._internalDatabaseConnecctionManager = new DatabaseConnectionManager<any>({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings,
			options: {
				connectionEnvironment: ConnectionEnvironment.internal,
				databaseContainerInstanceName: INTERNAL_DATABASE_INSTANCE_NAME,
			}
		});

		/** Si la aplicación NO implementa multi-tenants, agregamos 
		 * manejador de conexión para la base de datos del negocio */
		if (!this._configurationSettings.databaseConnectionData.isMultitenants) {
			/** Agregamos el manejador de conexión */
			this._businessDatabaseConnectionManager = new DatabaseConnectionManager<any>({
				containerManager: this._containerManager,
				configurationSettings: this._configurationSettings,
				options: {
					connectionEnvironment: ConnectionEnvironment.business,
					databaseContainerInstanceName: BUSINESS_DATABASE_INSTANCE_NAME,
				}
			});
		}

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
			const internalRoute = `${this._configurationSettings.apiData.baseRoute}/internal`;

			// Definimos la ruta del directorio donde se encuentran los controladores internos.
			// Por ejemplo, suponiendo que están en src/InternalControllers:
			//  ../../API/Controllers/*.ts
			const internalControllersDir = '../API/Controllers/*.ts';

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

	/** Permite añadir los servicios internos del sistema */
	public async AddInternalServices(): Promise<void> {
		try {
			this._logger.Activity("AddInternalServices");

			/** Servicio para manejo interno de cookies */
			this._serviceManager.AddService<IInternalSecurityService, InternalSecurityService>("internalSecurityService", InternalSecurityService);
			this._serviceManager.AddService<IInternalTenantService, InternalTenantService>("internalTenantService", InternalTenantService);

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddInternalServices", err);
			throw err;
		}
	}

	/** Permite añadir los repositorios de uso interno al contenedor de dependencias */
	public async AddInternalRepositories(): Promise<void> {
		try {
			this._logger.Activity("AddInternalRepositories");

			this._serviceManager.AddService<IProyectsInternalRepository, ProyectsInternalRepository>("proyectsInternalRepository", ProyectsInternalRepository);
			this._serviceManager.AddService<ITenantsInternalRepository, TenantsInternalRepository>("tenantsInternalRepository", TenantsInternalRepository);
			this._serviceManager.AddService<ITenantDetailsInternalRepository, TenantDetailsInternalRepository>("tenantDetailsInternalRepository", TenantDetailsInternalRepository);

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddInternalRepositories", err);
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

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalManagers", err);
			throw err;
		}
	}

	/** Permite agregar la configuración de seguridad interna */
	public async AddInternalSecurity(): Promise<void> {
		try {
			this._logger.Activity("AddInternalSecurity");

			/** Agrega los RateLimiters */
			this._internalSecurityManager.AddRateLimiters();

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalSecurity", err);
			throw err;
		}
	}

	/** Se agregan los manejadores de excepciones */
	public async AddExceptionManager(): Promise<void> {
		try {
			this._logger.Activity("AddExceptionManager");

			/** Agregamos el middleware para manejo de errores 
			* Debe ser el último de la lista siempre*/
			this._serviceManager.AddMiddleware(ErrorHandlerMiddleware);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddExceptionManager", err);
			throw err;
		}
	}

	/** Conectar a los servicios que realizan conecciones */
	public async RunConnectionServices(): Promise<void> {
		try {
			this._logger.Activity("RunConnectionServices");

			/** Realiza conección con el cliente de caché (Redis) */
			await this._cacheConnectionManager.Connect();

			/** Realizamos la conexión a la base de datos de uso interno*/
			await this._internalDatabaseConnecctionManager.Connect();

			/** Realizamos conexión a base de datos del negocio */
			if (this._businessDatabaseConnectionManager) {
				await this._businessDatabaseConnectionManager.Connect();
			}

		} catch (err: any) {
			this._logger.Error("FATAL", "RunConnectionServices", err);
			throw err;
		}
	}

	/** Desconectar los servicios que realizan conecciones */
	public async DisconnectConnectionServices(): Promise<void> {
		try {
			this._logger.Activity("DisconnectConnectionServices");

			/** Cerramos la conexión con el servidor caché */
			await this._cacheConnectionManager.Disconnect();

			/** Cerramos la conexión con la base de datos */
			await this._internalDatabaseConnecctionManager.Disconnect();

			/** Cerramos la conexión a base de datos del negocio */
			if (this._businessDatabaseConnectionManager) {
				await this._businessDatabaseConnectionManager.Disconnect();
			}

		} catch (err: any) {
			this._logger.Error("FATAL", "DisconnectConnectionServices", err);
			throw err;
		}
	}

}