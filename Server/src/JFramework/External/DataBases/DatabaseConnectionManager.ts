
import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import IDatabaseConnectionManager from "./Interfaces/IDatabaseConnectionManager";
import IDatabaseConnectionStrategy from "./Interfaces/IDatabaseConnectionStrategy";
import SqlConnectionStrategy from "./Strategies/SqlConnectionStrategy";
import { DatabaseType } from "./Types/DatabaseType";



interface DatabaseConnectionManagerDependencies {
	containerManager: IContainerManager;
	configurationSettings: ConfigurationSettings;
}

export default class DatabaseConnectionManager<DataBaseEntity> implements IDatabaseConnectionManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Estrategia de conneccion */
	private _strategy?: IDatabaseConnectionStrategy<any, any>;

	/** Objeto de configuraciones del sistema */
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
				this._strategy = this._containerManager.ResolveClass(SqlConnectionStrategy<DataBaseEntity>);
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
			if (this._strategy) {

				/** Realizamos la conección con la base de datos */
				await this._strategy.Connect();

				/** Obtenemos la instancia de la base de datos */
				const instance = this._strategy.GetInstance();
				
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