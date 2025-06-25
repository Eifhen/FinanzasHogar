import ApplicationContext from "../../Configurations/ApplicationContext";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import { IConnectionService } from "../../Configurations/Types/IConnectionService";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import IDatabaseConnectionStrategy from "./Interfaces/IDatabaseConnectionStrategy";
import MssqlConnectionStrategy from "./Strategies/MssqlConnectionStrategy";
import PostgreSqlConnectionStrategy from "./Strategies/PostgreSqlConnectionStrategy";
import { DatabaseType, MultiTenantConnectionManagerOptions } from "./Types/DatabaseType";



interface MultiTenantConnectionManagerDependencies {
	/** Contexto de aplicación */
	applicationContext: ApplicationContext;

	/** ContainerManager de la request en curso */
	scopedContainerManager: IContainerManager;

	/** Opciones de configuración para el Manager */
	options: MultiTenantConnectionManagerOptions;
}


export class MultiTenantConnectionManager implements IConnectionService {

	/** Logger Manager Instance */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** ContainerManager de la request en curso */
	private readonly _scopedContainerManager: IContainerManager;

	/** Estrategia de conexión */
	private _strategy?: IDatabaseConnectionStrategy<any, any>;

	/** Opciones de configuración */
	private _options: MultiTenantConnectionManagerOptions;

	constructor(deps: MultiTenantConnectionManagerDependencies) {
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			applicationContext: deps.applicationContext,
			entityName: "MultiTenantConnectionManager"
		});

		/** Agregamos el contexto de aplicación */
		this._applicationContext = deps.applicationContext;

		/** ContainerManager de la request en curso */
		this._scopedContainerManager = deps.scopedContainerManager;

		/** Agregamos opciones de configuración */
		this._options = deps.options;

	}

	/** Permite setear la estrategia de conección según el tipo de 
	 * base de datos en la configuración y retorna la instancia del manager */
	private SetConnectionStrategy(): void {
		this._logger.Activity("SetConnectionStrategy");

		/** Ejecutamos una estrategía de conección según el tipo de base de datos
		 * especificado en la configuración */
		switch (this._options.databaseType) {

			/** Resolvemos la estrategía de MSSQL*/
			case DatabaseType.ms_sql_database:
				this._strategy = new MssqlConnectionStrategy({
					applicationContext: this._applicationContext,
					connectionOptions: this._options.strategyOptions
				});
				break;

			/** Resolvemos la estrategia PostGreSQL*/
			case DatabaseType.postgre_sql_database:
				this._strategy = new PostgreSqlConnectionStrategy({
					applicationContext: this._applicationContext,
					connectionOptions: this._options.strategyOptions
				});
				break;
			
			/** Resolvemos la estrategia de MongoDB*/
			case DatabaseType.mongo_database:
				throw new Error("Estrategía de conexión No implementada");
			
			/** Throw en el caso de que no exista */
			default:
				throw new Error(`La estrategía ${this._options.databaseType as string} no está implementada`);
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
				this._scopedContainerManager.AddInstance(this._options.databaseContainerInstanceName, instance);

				/** Notifcamos el environment al cual nos hemos conectado */
				this._logger.Message("INFO", `El servidor está conectado a la base de datos [${this._options.strategyOptions.connectionEnvironment.toUpperCase()}]`);
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
			this._logger.Error("FATAL", "Connect", err);

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
			this._logger.Error("FATAL", "Desconnect", err);

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

