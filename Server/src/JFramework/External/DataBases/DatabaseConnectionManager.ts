
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
import { DatabaseType } from "./Types/DatabaseType";


interface DatabaseConnectionManagerOptions {
	/** Define el ambiente de conexión */
	connectionEnvironment: ConnectionEnvironment;

	/** Tipo de base de datos (mongodb o sql), si el tipo NO es especificado se toamará desde el objeto de configuración */
	databaseType: DatabaseType

	/** Define el nombre que tendrá la instancia de la base de datos dentro del contenedor de dependencias */
	databaseInstanceName: string;
}

interface DatabaseConnectionManagerDependencies {

	/** Manejador del contenedor de dependencias  */
	containerManager: IContainerManager;

	/** Objeto de configuración del sistema */
	configurationSettings: ConfigurationSettings;

	/** Opciones de configuración para el Manager */
	options: Partial<DatabaseConnectionManagerOptions>
}

export default class DatabaseConnectionManager<DataBaseEntity, ConfigurationType> implements IDatabaseConnectionManager<ConfigurationType> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Objeto de configuraciones del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Estrategia de conneccion */
	private _strategy?: IDatabaseConnectionStrategy<any, any, any>;

	/** Opciones de configuración */
	private _options: DatabaseConnectionManagerOptions;

	constructor(deps: DatabaseConnectionManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "DatabaseConnectionManager"
		});

		this._containerManager = deps.containerManager;
		this._configurationSettings = deps.configurationSettings;

		const env = deps.options.connectionEnvironment ?? ConnectionEnvironment.internal

		this._options = {
			connectionEnvironment: env,
			databaseType: deps.options.databaseType ?? this._configurationSettings.databaseConnectionData[env].type,
			databaseInstanceName: deps.options.databaseInstanceName ?? "",
		};

	}

	/** Permite setear la estrategia de conección según el tipo de 
	 * base de datos en la configuración y retorna la instancia del manager */
	public SetConnectionStrategy() : this {
		this._logger.Activity("SetConnectionStrategy");

		/** Ejecutamos una estrategía de conección según el tipo de base de datos
		 * especificado en la configuración */
		switch (this._options.databaseType) {
			case DatabaseType.ms_sql_database:
				
				/** Resolvemos la estrategía */
				this._strategy = this._containerManager.ResolveClass(SqlConnectionStrategy<DataBaseEntity>);

				/** Establecemos el ambiente de conexión */
				this._strategy.SetConnectionEnvironment(this._options.connectionEnvironment);
				break;
			case DatabaseType.mongo_database:
				throw new Error("Estrategía de conexión No implementada");
		}

		return this;
	}

	/** Permite setear de forma manual la configuración de conexión, 
	 * si la configuración es seteada de forma manual entonces los datos de configuración 
	 * obtenidos por el objeto de configuración serán reescritos en su mayoria*/
	public SetConnectionConfiguration(config: ConfigurationType): this {
		try {
			this._logger.Activity("SetConnectionConfiguration");

			if (this._strategy) {

				/** Seteamos la configuración */
				this._strategy.SetConnectionConfiguration(config);

				return this;

			} else {
				throw new ApplicationException(
					"SetConnectionConfiguration",
					HttpStatusName.DatabaseConnectionException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

		}
		catch (err: any) {
			this._logger.Error("FATAL", "Connect", err);
			throw new ApplicationException(
				"SetConnectionConfiguration",
				HttpStatusName.DatabaseConnectionException,
				"Ha ocurrido un error al definir la configuración de conexión",
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
			);
		}
	}

	/** Realiza la conección a la base de datos */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("Connect");

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