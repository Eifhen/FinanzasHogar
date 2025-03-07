import ErrorHandlerMiddleware from "../ErrorHandling/ErrorHandlerMiddleware";
import { EmailDataManager } from "../Managers/EmailDataManager";
import EmailManager from "../Managers/EmailManager";
import EmailTemplateManager from "../Managers/EmailTemplateManager";
import EncrypterManager from "../Managers/EncrypterManager";
import { FileManager } from "../Managers/FileManager";
import { IEmailDataManager } from "../Managers/Interfaces/IEmailDataManager";
import IEmailManager from "../Managers/Interfaces/IEmailManager";
import { IEmailTemplateManager } from "../Managers/Interfaces/IEmailTemplateManager";
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
import ICacheConnectionManager from "../DataBases/Cache/Interfaces/ICacheConnectionManager";
import IDatabaseConnectionManager from "../DataBases/SQL/Interfaces/IDatabaseConnectionManager";
import CacheConnectionManager from "../DataBases/Cache/CacheConnectionManager";
import DatabaseConnectionManager from "../DataBases/SQL/DatabaseConnectionManager";
import { CloudinaryStorageStrategy } from "../CloudStorage/Strategies/CloudinaryStorageStrategy";
import SqlTransactionManager from "../../Infraestructure/Repositories/Generic/SqlTransactionManager";


interface InternalServiceManagerDependencies {
	configurationSettings: ConfigurationSettings;
	serviceManager: IServiceManager,
	containerManager: IContainerManager;
}

export class InternalServiceManager<DataBaseEntity> implements IInternalServiceManager {


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
		this._databaseConnecctionManager = new DatabaseConnectionManager<DataBaseEntity>({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		});

		/** Agregamos el manejador de conección caché */
		this._cacheConnectionManager = new CacheConnectionManager({
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		});
	}

	/** Agregamos las estrategias de desarrollo interno */
	public async AddInternalStrategies(): Promise<void> {
		try {
			this._logger.Activity("AddInternalStrategies");
			this._serviceManager.AddStrategyManager<CloudinaryStorageStrategy>("cloudStorageManager", CloudinaryStorageStrategy);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalStrategies", err);
			throw err;
		}
	}

	/** Agregamos los manejadores internos de la aplicación */
	public async AddInternalManagers(): Promise<void> {
		try {
			this._logger.Activity("AddInternalManagers");

			this._serviceManager.AddService<SqlTransactionManager>("sqlTransactionManager", SqlTransactionManager);
			this._serviceManager.AddService<IEncrypterManager, EncrypterManager>("encrypterManager", EncrypterManager);
			this._serviceManager.AddService<ITokenManager, TokenManager>("tokenManager", TokenManager);
			this._serviceManager.AddService<IEmailManager, EmailManager>("emailManager", EmailManager);
			this._serviceManager.AddService<IEmailDataManager, EmailDataManager>("emailDataManager", EmailDataManager);
			this._serviceManager.AddService<IEmailTemplateManager, EmailTemplateManager>("emailTemplateManager", EmailTemplateManager);
			this._serviceManager.AddService<IFileManager, FileManager>("fileManager", FileManager);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalManagers", err);
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