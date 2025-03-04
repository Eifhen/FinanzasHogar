import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import ApplicationException from "../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { DatabaseType } from "../Strategies/Database/DatabaseType";
import IDatabaseConnectionStrategy from "../Strategies/Database/IDatabaseConnectionStrategy";
import SqlConnectionStrategy from "../Strategies/Database/SqlConnectionStrategy";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";
import IContainerManager from "./types/IContainerManager";
import IDatabaseConnectionManager from "./types/IDatabaseConnectionManager";


interface DatabaseConnectionManagerDependencies {
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
}

export default class DatabaseConnectionManager implements IDatabaseConnectionManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Estrategia de conneccion */
	private strategy?: IDatabaseConnectionStrategy<any, any>;

	private _configurationSettings: ConfigurationSettings;

	constructor(deps: DatabaseConnectionManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "DatabaseConnectionManager"
		});

		this._containerManager = deps.containerManager;
		this._configurationSettings = deps.configurationSettings;
	}

	/** Permite setear la estrategia de conección según el tipo de 
	 * base de datos en la configuración */
	private SetConnectionStrategy(): void {
		this._logger.Activity("SetConnectionStrategy");
		
		/** Ejecutamos una estrategía de conección según el tipo de base de datos
		 * especificado en la configuración */
		switch (this._configurationSettings.databaseConnectionData.type) {
			case DatabaseType.ms_sql_database:
				this.strategy = this._containerManager.ResolveClass(SqlConnectionStrategy);
				break;
			case DatabaseType.mongo_database:
				throw new Error("Estrategía de conección No implementada");
		}
	}

	/** Realiza la conección a la base de datos */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("Connect");
			
			/** Seteamos la estrategia de conección */
			this.SetConnectionStrategy();

			/** Verificamos si la estraegia se insertó correctamente */
			if (this.strategy) {

				/** Realizamos la conección con la base de datos */
				await this.strategy.Connect();

				/** Obtenemos la instancia de la base de datos */
				const instance = this.strategy.GetInstance();
				
				/** Agrega la instancia de la base de datos al contenedor de dependencias */
				this._containerManager.AddInstance("database", instance);
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
			if (this.strategy) {

				/** Cerramos la conección con la base de datos */
				await this.strategy.CloseConnection();
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