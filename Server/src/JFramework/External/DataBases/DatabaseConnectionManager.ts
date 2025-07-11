
import ApplicationContext from "../../Configurations/ApplicationContext";
import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import { ConnectionEnvironment } from "../../Configurations/Types/IConnectionService";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import DatabaseInstanceManager from "./DatabaseInstanceManager";
import IDatabaseConnectionManager from "./Interfaces/IDatabaseConnectionManager";
import DatabaseStrategyDirector from "./Strategies/DatabaseStrategyDirector";
import { ConnectionEntity, DatabaseConnectionManagerOptions } from "./Types/DatabaseType";




interface DatabaseConnectionManagerDependencies {

	/** Manejador del contenedor de dependencias  */
	containerManager: IContainerManager;

	/** Objeto de configuración del sistema */
	configurationSettings: ConfigurationSettings;

	/** Manejador de instancia de base de datos */
	databaseInstanceManager: DatabaseInstanceManager;

	/** Opciones de configuración para el Manager */
	options: Partial<DatabaseConnectionManagerOptions>;
}

export default class DatabaseConnectionManager<DataBaseEntity> implements IDatabaseConnectionManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Objeto de configuraciones del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Manejador de intancias de base de datos */
	private readonly _databaseInstanceManager: DatabaseInstanceManager;

	/** Entidad de conexión la cual almacena las opciones de conexión 
	 * y la estrategía de conexión */
	private _connectionEntity?: ConnectionEntity;

	/** Opciones de configuración */
	private _options: DatabaseConnectionManagerOptions;

	/** Ambiente de conección */
	private _connectionEnv: ConnectionEnvironment;

	constructor(deps: DatabaseConnectionManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "DatabaseConnectionManager"
		});

		this._containerManager = deps.containerManager;
		this._configurationSettings = deps.configurationSettings;
		this._databaseInstanceManager = deps.databaseInstanceManager;

		/** seteamos el ambiente de conexión */
		this._connectionEnv = deps.options.connectionEnvironment ?? ConnectionEnvironment.INTERNAL;

		this._options = {
			connectionEnvironment: this._connectionEnv,
			databaseType: deps.options.databaseType ?? this._configurationSettings.databaseConnectionData.connections[this._connectionEnv].type,
			databaseTypeContainerName: deps.options.databaseTypeContainerName ?? "",
			databaseContainerInstanceName: deps.options.databaseContainerInstanceName ?? "",
			databaseRegistryName: deps.options.databaseRegistryName ?? ""
		};

	}

	/** Permite setear la estrategia de conección según el tipo de 
	 * base de datos en la configuración y retorna la instancia del manager */
	private SetConnectionStrategy(): void {
		this._logger.Activity("SetConnectionStrategy");

		/** Obtenemos el applicationContext */
		const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");


		/** Obtenemos el strategyDirector */
		const databaseStrategyDirector = new DatabaseStrategyDirector({
			applicationContext
		});

		/** Agregamos la entidad de conexión */
		this._connectionEntity = databaseStrategyDirector.GetConnectionStrategy<DataBaseEntity>(this._options);

	}

	/** Realiza la conección a la base de datos */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("Connect");

			/** seteamos la estrategia de conexión */
			this.SetConnectionStrategy();

			/** Verificamos si la estraegia se insertó correctamente */
			if (!this._connectionEntity || !this._connectionEntity.strategy) {
				throw new ApplicationException(
					"Connect",
					HttpStatusName.DatabaseConnectionException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Realizamos la conección con la base de datos */
			const dbInstance = await this._connectionEntity.strategy.Connect();

			/** Agrega la instancia de la base de datos al contenedor de dependencias */
			this._databaseInstanceManager.SetDatabaseInstance(
				this._containerManager,
				this._connectionEntity,
				dbInstance,
			);

			/** Notifcamos el environment al cual nos hemos conectado */
			this._logger.Message("INFO", `
				El servidor está conectado a la base de datos 
				[${this._options.connectionEnvironment.toUpperCase()}]
			`);

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Connect", err);

			// Si ya se creó parcialmente una instancia, intenta cerrarla para liberar recursos
			if (this._connectionEntity?.strategy) {
				this._logger.Message("WARN", `
					Se ha detectado una instancia de la base de datos abierta, 
					el sistema procedera a cerrarla
				`);

				/** Desconectamos */
				await this.Disconnect().catch((closeErr) => {
					this._logger.Error("FATAL", "Error cerrando la instancia", closeErr);
				});
			}

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Connect",
				HttpStatusName.DatabaseConnectionException,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Cierra la conección a la base de datos */
	public async Disconnect(): Promise<void> {
		try {
			this._logger.Activity("Disconnect");

			/** Verificamos si la estraegia se insertó correctamente */
			if (!this._connectionEntity || !this._connectionEntity.strategy) {
				throw new ApplicationException(
					"Disconnect",
					HttpStatusName.DatabaseConnectionException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Cerramos la conección con la base de datos */
			await this._connectionEntity.strategy.CloseConnection();

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Desconnect", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Desconnect",
				HttpStatusName.DatabaseDisconnectException,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

}