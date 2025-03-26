
import ApplicationContext from "../../Configurations/ApplicationContext";
import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import { ConnectionEnvironment } from "../../Configurations/Types/IConnectionService";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import IDatabaseConnectionManager from "./Interfaces/IDatabaseConnectionManager";
import IDatabaseConnectionStrategy from "./Interfaces/IDatabaseConnectionStrategy";
import SqlConnectionStrategy from "./Strategies/SqlConnectionStrategy";
import { DatabaseConnectionManagerOptions, DatabaseType } from "./Types/DatabaseType";




interface DatabaseConnectionManagerDependencies {

	/** Manejador del contenedor de dependencias  */
	containerManager: IContainerManager;

	/** Objeto de configuración del sistema */
	configurationSettings: ConfigurationSettings;

	/** Opciones de configuración para el Manager */
	options: Partial<DatabaseConnectionManagerOptions>
}

export default class DatabaseConnectionManager<DataBaseEntity> implements IDatabaseConnectionManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Objeto de configuraciones del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Estrategia de conneccion */
	private _strategy?: IDatabaseConnectionStrategy<any, any>;

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
	
		/** seteamos el ambiente de conexión */
		this._connectionEnv = deps.options.connectionEnvironment ?? ConnectionEnvironment.internal;

		this._options = {
			connectionEnvironment: this._connectionEnv,
			databaseType: deps.options.databaseType ?? this._configurationSettings.databaseConnectionData.connections[this._connectionEnv].type,
			databaseInstanceName: deps.options.databaseInstanceName ?? "",
		};

	}

	/** Permite setear la estrategia de conección según el tipo de 
	 * base de datos en la configuración y retorna la instancia del manager */
	private SetConnectionStrategy(): void {
		this._logger.Activity("SetConnectionStrategy");

		const applicationContext = this._containerManager.Resolve<ApplicationContext>("applicationContext");

		/** Ejecutamos una estrategía de conección según el tipo de base de datos
		 * especificado en la configuración */
		switch (this._options.databaseType) {
			case DatabaseType.ms_sql_database:

				/** Resolvemos la estrategía */
				this._strategy = new SqlConnectionStrategy<DataBaseEntity>({
					applicationContext,
					connectionOptions: {
						env: this._connectionEnv,
						connectionConfig: this._configurationSettings.databaseConnectionConfig[this._connectionEnv].sqlConnectionConfig,
						connectionData: this._configurationSettings.databaseConnectionData.connections[this._connectionEnv],
					}
				});

				break;
			case DatabaseType.mongo_database:
				throw new Error("Estrategía de conexión No implementada");
		}

	}

	/** Realiza la conección a la base de datos */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("Connect");

			/** seteamos la estrategia de conexión */
			this.SetConnectionStrategy();

			/** Verificamos si la estraegia se insertó correctamente */
			if (this._strategy) {

				/** Realizamos la conección con la base de datos */
				await this._strategy.Connect();

				/** Obtenemos la instancia de la base de datos */
				const instance = this._strategy.GetInstance();

				/** Agrega la instancia de la base de datos al contenedor de dependencias */
				this._containerManager.AddInstance(this._options.databaseInstanceName, instance);

				/** Notifcamos el environment al cual nos hemos conectado */
				this._logger.Message("INFO", `El servidor está conectado a la base de datos [${this._options.connectionEnvironment.toUpperCase()}]`);
			}
			else {
				throw new ApplicationException(
					"Connect",
					HttpStatusName.DatabaseConnectionException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Connect", err);

			// Si ya se creó parcialmente una instancia, intenta cerrarla para liberar recursos
			if (this._strategy && this._strategy.GetInstance()) {
				try {
					this._logger.Message("WARN", "Se ha detectado una instancia de la base de datos abierta, el sistema procedera a cerrarla");
					await this._strategy.CloseConnection();
				} catch (closeErr) {
					this._logger.Error("FATAL", "Error cerrando la instancia", closeErr);
				}
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
			if (this._strategy) {

				/** Cerramos la conección con la base de datos */
				await this._strategy.CloseConnection();
			}
			else {
				throw new ApplicationException(
					"Disconnect",
					HttpStatusName.DatabaseConnectionException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
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