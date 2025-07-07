import ApplicationContext from "../../Configurations/ApplicationContext";
import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { DatabaseConnectionException, DatabaseDesconnectionException, DatabaseStrategyException, DatabaseUndefinedConnectionException } from "../../ErrorHandling/Exceptions";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { DEFAULT_NUMBER, NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import DatabaseInstanceManager from "./DatabaseInstanceManager";
import IDatabaseConnectionManager from "./Interfaces/IDatabaseConnectionManager";
import DatabaseStrategyDirector from "./Strategies/DatabaseStrategyDirector";
import { ConnectionEntity, DatabaseConnectionManagerOptions } from "./Types/DatabaseType";


interface MultidatabaseConnectionManagerDependencies {

	/** Manejador del contenedor de dependencias  */
	containerManager: IContainerManager;

	/** Objeto de configuración del sistema */
	configurationSettings: ConfigurationSettings;

	/** Manejador de instancia de base de datos */
	databaseInstanceManager: DatabaseInstanceManager;

	/** Opciones de configuración para el Manager */
	connectionOptions: DatabaseConnectionManagerOptions[];

	/** Contexto de aplicación */
	applicationContext: ApplicationContext;
}

/** Clase que permite controlar la conexión de multiples bases de datos a la vez */
export default class MultidatabaseConnectionManager<DataBaseEntity> implements IDatabaseConnectionManager {
	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Objeto de configuraciones del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Manejador de intancias de base de datos */
	private readonly _databaseInstanceManager: DatabaseInstanceManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Estrategias de conneccion */
	private _connectionEntities?: ConnectionEntity[];

	constructor(deps: MultidatabaseConnectionManagerDependencies) {
		if (!deps.connectionOptions || !Array.isArray(deps.connectionOptions) || deps.connectionOptions.length === DEFAULT_NUMBER) {
			throw new ApplicationException(
				"MultidatabaseConnectionManager",
				HttpStatusName.InternalServerError,
				"No se proporcionaron configuraciones de conexión",
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename
			);
		}

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "MultidatabaseConnectionManager"
		});


		this._containerManager = deps.containerManager;
		this._configurationSettings = deps.configurationSettings;
		this._databaseInstanceManager = deps.databaseInstanceManager;
		this._applicationContext = deps.applicationContext;


		/** Inicializamos las entidades de conexión */
		this.InitializeDatabaseConnectionEntities(deps.connectionOptions);

	}

	/** Permite setear la estrategia de conección según el tipo de 
 * base de datos en la configuración y retorna la instancia del manager */
	private InitializeDatabaseConnectionEntities(options: DatabaseConnectionManagerOptions[]) {
		try {
			this._logger.Activity("InitializeDatabaseConnectionEntities");

			/** Instanciamos el director de estrategias */
			const databaseStrategyDirector = new DatabaseStrategyDirector({
				applicationContext: this._applicationContext
			})

			/** Seteamos las entidades de conexión */
			this._connectionEntities = options.map(option => databaseStrategyDirector.GetConnectionStrategy<DataBaseEntity>(option));

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "InitializeDatabaseConnectionEntities", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new DatabaseStrategyException(
				"InitializeDatabaseConnectionEntities",
				this._applicationContext,
				__filename,
				err
			);
		}
	}


	/** Realiza la conección a la base de datos */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("Connect");

			/** Validamos que existan entidades de conexión */
			if (!this._connectionEntities) {
				throw new DatabaseUndefinedConnectionException(
					"Connect",
					this._applicationContext,
					__filename,
				)
			}

			/** Recorremos cada conexión */
			const promises = this._connectionEntities.map(async (entity) => {
				try {
					/** Validamos que exista una estrategia de conexión definida */
					if (!entity.strategy) {
						throw new DatabaseStrategyException(
							"Connect",
							this._applicationContext,
							__filename,
						);
					}

					/** Si hay una condición de conexión definida la ejecutamos, si da false detenemos la ejecución */
					if (entity.options.connectionCondition !== undefined) {
						if (typeof entity.options.connectionCondition === "function") {
							if (!entity.options.connectionCondition()) return;
						} else {
							if (!entity.options.connectionCondition) return;
						}
					}

					/** Obtenemos la instancia de la base de datos */
					const dbInstance = await entity.strategy.Connect();

					/** Agrega la instancia de la base de datos al contenedor de dependencias */
					this._databaseInstanceManager.SetDatabaseInstance(
						this._containerManager,
						entity,
						dbInstance,
					);

					/** Notifcamos el environment al cual nos hemos conectado */
					this._logger.Message("INFO", `El servidor está conectado a la base de datos [${entity.options.connectionEnvironment.toUpperCase()}] | [${entity.options.databaseRegistryName}]`);

				}
				catch (err: any) {
					this._logger.Error(LoggerTypes.FATAL, "Connect", err);
					throw new DatabaseConnectionException(
						"Connect",
						this._applicationContext,
						__filename,
						err
					);
				}
			});

			await Promise.all(promises);

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Connect", err);


			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new DatabaseConnectionException(
				"Connect",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Cierra la conección a la base de datos */
	public async Disconnect(): Promise<void> {
		try {
			this._logger.Activity("Disconnect");

			/** Validamos que existan entidades de conexión */
			if (!this._connectionEntities) {
				throw new DatabaseUndefinedConnectionException(
					"Disconnect",
					this._applicationContext,
					__filename,
				)
			}

			const promises = this._connectionEntities.map(async (entity) => {
				try {
					/** Validamos que exista una estrategia de conexión definida */
					if (!entity.strategy) {
						throw new DatabaseStrategyException(
							"Disconnect",
							this._applicationContext,
							__filename,
						);
					}

					await entity.strategy.CloseConnection();
				}
				catch (err: any) {
					this._logger.Error(LoggerTypes.FATAL, "Disconnect", err);
					throw err;
				}
			});

			await Promise.all(promises);

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Desconnect", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new DatabaseDesconnectionException(
				"Disconnect",
				this._applicationContext,
				__filename,
				err
			);
		}
	}
}



