import { loadControllers } from "awilix-express";
import { Application } from "express";
import SqlTransactionManager from "../External/DataBases/Generic/SqlTransactionManager";
import IDatabaseConnectionManager from "../External/DataBases/Interfaces/IDatabaseConnectionManager";
import ISqlTransactionManager from "../External/DataBases/Interfaces/ISqlTransactionManager";
import ErrorHandlerMiddleware from "../ErrorHandling/ErrorHandlerMiddleware";
import CacheConnectionManager from "../External/Cache/CacheConnectionManager";
import EmailManager from "../Managers/EmailManager";
import EncrypterManager from "../Managers/EncrypterManager";
import { FileManager } from "../Managers/FileManager";
import IEmailManager from "../Managers/Interfaces/IEmailManager";
import IEncrypterManager from "../Managers/Interfaces/IEncrypterManager";
import IFileManager from "../Managers/Interfaces/IFileManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import ITokenManager from "../Managers/Interfaces/ITokenManager";
import LoggerManager from "../Managers/LoggerManager";
import TokenManager from "../Managers/TokenManager";
import { BUSINESS_DATABASE_INSTANCE_NAME, BUSINESS_DATABASE_REGISTRY_NAME, INTERNAL_DATABASE_INSTANCE_NAME, INTERNAL_DATABASE_REGISTRY_NAME } from "../Utils/const";
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
import TenantConnectionsInternalRepository from "../API/DataAccess/Repositories/TenantConnectionsInternalRepository";
import ITenantConnectionsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantConnectionsInternalRepository";
import DatabaseInstanceManager from "../External/DataBases/DatabaseInstanceManager";
import MultidatabaseConnectionManager from '../External/DataBases/MultidatabaseConnectionManager';
import ApplicationContext from "./ApplicationContext";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import ApiValidationMiddleware from "../Middlewares/ApiValidationMiddleware";
import TenantResolverMiddleware from "../Middlewares/TenantResolverMiddleware";
import CsrfValidationMiddleware from "../Middlewares/CsrfValidationMiddleware";
import IServerConfigurationManager from "./Interfaces/IServerConfigurationManager";
import ServerConfigurationManager from "./ServerConfigurationManager";
import ApplicationException from "../ErrorHandling/ApplicationException";
import ICacheConnectionManager from "../External/Cache/Types/ICacheConnectionManager";



export interface InternalServiceManagerDependencies {
	configurationSettings: ConfigurationSettings;
	serviceManager: IServiceManager,
	containerManager: IContainerManager;
	applicationContext: ApplicationContext;
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

	/** Manejador de conexiones multiples, nos permite manejar la conexión a la base de datos interna
	 * y la conexión al a base de datos del negocio. La conexión a la base de datos del negocio
	 * solo se realiza si la app es multitenant */
	private readonly _multiDatabaseConnectionManager: IDatabaseConnectionManager;

	/** Manejador de instancias de base de datos */
	private readonly _databaseInstanceManager: DatabaseInstanceManager;

	/** Manejador de conección a servidor caché */
	private readonly _cacheConnectionManager: ICacheConnectionManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Manager de configuración del servidor */
	private readonly _serverConfigurationManager: IServerConfigurationManager;

	/** Instancia de express */
	private readonly _app: Application;

	constructor(deps: InternalServiceManagerDependencies) {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "InternalServiceManager"
		});

		/** Agregamos la instancia de express */
		this._app = deps.app;

		this._serviceManager = deps.serviceManager;
		this._configurationSettings = deps.configurationSettings;
		this._containerManager = deps.containerManager;
		this._applicationContext = deps.applicationContext;

		/** Instanciamos la configuración del server */
		this._serverConfigurationManager = new ServerConfigurationManager({
			app: this._app,
			serviceManager: this._serviceManager,
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings,
			applicationContext: this._applicationContext
		});

		/** Agregamos el manager de seguridad internal */
		this._internalSecurityManager = new InternalSecurityManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings,
			applicationContext: this._applicationContext
		});

		/** Agregamos el manejador de instancias de base de datos */
		this._databaseInstanceManager = new DatabaseInstanceManager({
			configurationSettings: this._configurationSettings,
			containerManager: this._containerManager
		});

		/** Agregamos el manejador de conexiones multiples, se realiza una conexión 
		 * por cada item agregado al connectionOptions, cada item en connectionOptions
		 * contiene los datos de conexión necesarios para esa conexión */
		this._multiDatabaseConnectionManager = new MultidatabaseConnectionManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings,
			databaseInstanceManager: this._databaseInstanceManager,
			applicationContext: this._applicationContext,
			connectionOptions: [
				{
					/** Agregamos las opciones de la base de datos de uso interno */
					connectionEnvironment: ConnectionEnvironment.INTERNAL,
					databaseType: this._configurationSettings.databaseConnectionData.connections[ConnectionEnvironment.INTERNAL].type,
					databaseContainerInstanceName: INTERNAL_DATABASE_INSTANCE_NAME,
					databaseRegistryName: INTERNAL_DATABASE_REGISTRY_NAME,
				},
				{
					// Agregamos las opciones de la base de datos del negocio
					connectionEnvironment: ConnectionEnvironment.BUSINESS,
					databaseType: this._configurationSettings.databaseConnectionData.connections[ConnectionEnvironment.BUSINESS].type,
					databaseContainerInstanceName: BUSINESS_DATABASE_INSTANCE_NAME,
					databaseRegistryName: BUSINESS_DATABASE_REGISTRY_NAME,

					/** Si la aplicación NO implementa multi-tenants, agregamos 
							* manejador de conexión para la base de datos del negocio.
						* El connectionCondition nos ayuda a realizar la conexión solo 
						* si la condición se cumple. */
					connectionCondition: !this._configurationSettings.databaseConnectionData.isMultitenants
				}
			]
		})

		/** Agregamos el manejador de conección caché */
		this._cacheConnectionManager = new CacheConnectionManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		});
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
			const internalControllersDir = this._configurationSettings.apiData.controllersPath.internalControllersPath;

			// Cargamos los controladores internos usando awilix-express
			this._app.use(
				internalRoute,
				loadControllers(internalControllersDir, { cwd: __dirname })
			);

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddInternalEndpoints", err);
			throw new InternalServerException(
				"AddInternalEndpoints",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
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
			throw new InternalServerException(
				"AddInternalServices",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Permite añadir los repositorios de uso interno al contenedor de dependencias */
	public async AddInternalRepositories(): Promise<void> {
		try {
			this._logger.Activity("AddInternalRepositories");

			this._serviceManager.AddService<IProyectsInternalRepository, ProyectsInternalRepository>("proyectsInternalRepository", ProyectsInternalRepository);
			this._serviceManager.AddService<ITenantsInternalRepository, TenantsInternalRepository>("tenantsInternalRepository", TenantsInternalRepository);
			this._serviceManager.AddService<ITenantDetailsInternalRepository, TenantDetailsInternalRepository>("tenantDetailsInternalRepository", TenantDetailsInternalRepository);
			this._serviceManager.AddService<ITenantConnectionsInternalRepository, TenantConnectionsInternalRepository>("tenantConnectionsInternalRepository", TenantConnectionsInternalRepository);

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddInternalRepositories", err);
			throw new InternalServerException(
				"AddInternalRepositories",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Agregamos las estrategias de desarrollo interno */
	public async AddInternalStrategies(): Promise<void> {
		try {
			this._logger.Activity("AddInternalStrategies");
			this._serviceManager.AddStrategyManager<CloudStorageManager>("cloudStorageManager", CloudStorageManager);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalStrategies", err);
			throw new InternalServerException(
				"AddInternalStrategies",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
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
			throw new InternalServerException(
				"AddInternalManagers",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Permite agregar la configuración de seguridad interna */
	public async AddInternalSecurity(): Promise<void> {
		try {
			this._logger.Activity("AddInternalSecurity");

			/** Agregamos el middleware de validación de API */
			this._serviceManager.AddMiddleware(ApiValidationMiddleware);

			/** Agregamos el middleware del contenedor de dependencias para crear 
			 * uno nuevo en cada request, esto se hace después de validar el apiKey*/
			this._serverConfigurationManager.AddContainerMiddleware();

			/** Agrega los RateLimiters */
			this._internalSecurityManager.AddRateLimiters();

			/** Agregamos la protección CSRF | Este middleware debe agregarse a nivel del controller */
			// this._serviceManager.AddMiddleware(CsrfValidationMiddleware);

			/** Middleware para resolver el Tenant de la request 
			 * solo se agrega si la API es multitenant*/
			if (this._configurationSettings.databaseConnectionData.isMultitenants) {
				this._serviceManager.AddMiddleware(TenantResolverMiddleware);
			}

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalSecurity", err);
			throw new InternalServerException(
				"AddInternalSecurity",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Conectar a los servicios que realizan conecciones */
	public async RunConnectionServices(): Promise<void> {
		try {
			this._logger.Activity("RunConnectionServices");

			/** Realiza conección con el cliente de caché (Redis) */
			await this._cacheConnectionManager.Connect();

			/** Realizamos la conexión a la base de datos*/
			await this._multiDatabaseConnectionManager.Connect();

		} catch (err: any) {
			this._logger.Error("FATAL", "RunConnectionServices", err);
			throw new InternalServerException(
				"RunConnectionServices",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Desconectar los servicios que realizan conecciones */
	public async DisconnectConnectionServices(): Promise<void> {
		try {
			this._logger.Activity("DisconnectConnectionServices");

			/** Cerramos la conexión con el servidor caché */
			await this._cacheConnectionManager.Disconnect();

			/** Desconecta TODAS las instancias registradas */
			await this._databaseInstanceManager.DisconnectAllInstances();

		} catch (err: any) {
			this._logger.Error("FATAL", "DisconnectConnectionServices", err);
			throw new InternalServerException(
				"DisconnectConnectionServices",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Administramos la configuración inicial del servidor */
	public async AddInternalConfiguration(): Promise<void> {
		try {
			this._logger.Activity("AddInternalConfiguration");

			/** Agregamos la configuración de cors */
			this._serverConfigurationManager.AddCorsConfiguration();

			/** Parsea la respuesta a json */
			this._serverConfigurationManager.AddJsonResponseConfiguration();

			/** Agrega el cookie-parser como middleware y establece la firma de las cookies */
			await this._serverConfigurationManager.AddCookieConfiguration();
		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddInternalConfiguration", err);

			if(err instanceof ApplicationException){
				throw err;
			}

			throw new InternalServerException(
				"AddInternalConfiguration",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
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
			
			if(err instanceof ApplicationException){
				throw err;
			}

			throw new InternalServerException(
				"AddExceptionManager",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}
}