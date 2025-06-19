import { Kysely, PostgresDialect } from "kysely";
import { Pool } from 'pg';
import IDatabaseConnectionStrategy, { IDatabaseConnectionStrategyBaseDependencies } from "../Interfaces/IDatabaseConnectionStrategy";
import { AutoClassBinder } from "../../../Helpers/Decorators/AutoBind";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import ApplicationContext from "../../../Configurations/ApplicationContext";
import { ConnectionStrategyData } from "../Types/DatabaseType";
import LoggerManager from "../../../Managers/LoggerManager";
import { DatabaseConnectionException, DatabaseDesconnectionException, DatabaseNoDialectException, DatabaseNoInstanceException, NullParameterException } from "../../../ErrorHandling/Exceptions";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { DEFAULT_CONNECTION_POOL_SIZE } from "../../../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../../../Utils/HttpCodes";


/**  Si la connección no funciona revisar las 
 * credenciales de acceso y que el Sql Agent de postgres esté corriendo */
interface IPostgreSqlConnectionStrategyDependencies extends IDatabaseConnectionStrategyBaseDependencies {
	
}

/** Estrategia de conexión a PostgreSQL */
@AutoClassBinder
export default class PostgreSqlConnectionStrategy<DataBaseEntity> implements IDatabaseConnectionStrategy<PostgresDialect, Kysely<DataBaseEntity>> {

	/** Logger Manager Instance */
	private _loggerManager: ILoggerManager;

	/** Dialecto sql */
	private _dialect: PostgresDialect | null = null;

	/** Instancia de sql */
	private _instance: Kysely<DataBaseEntity> | null = null;

	/** Contexto de applicación */
	private _applicationContext: ApplicationContext;

	/** Objeto de conexión de para el PostgreSqlConnectionStrategy 
 *  -connectionData = Datos de conexión a la DB */
	private _connectionOptions?: ConnectionStrategyData;

	constructor(deps: IPostgreSqlConnectionStrategyDependencies) {
		this._loggerManager = new LoggerManager({
			entityCategory: LoggEntityCategorys.STRATEGY,
			applicationContext: deps.applicationContext,
			entityName: "PostgreSqlConnectionStrategy"
		});

		/** Seteamos el contexto */
		this._applicationContext = deps.applicationContext;

		/** Seteamos las opciones de conexión */
		this._connectionOptions = deps.connectionOptions;
	}

	/** Permite abrir una conección a la baes de datos */
	public async Connect(): Promise<PostgresDialect> {
		try {
			this._loggerManager.Activity("Connect");

			if (!this._connectionOptions) {
				throw new NullParameterException("CreateConnection", "_strategyConnectionData", this._applicationContext, __filename);
			}

			const dialect = new PostgresDialect({
				pool: new Pool({
					connectionString: this._connectionOptions.connectionData.connectionString ?? "",
					connectionTimeoutMillis: this._connectionOptions.connectionData.connectionTimeout,
					min: this._connectionOptions.connectionData.connectionPoolMinSize ?? DEFAULT_CONNECTION_POOL_SIZE,
					max: this._connectionOptions.connectionData.connectionPoolMaxSize ?? DEFAULT_CONNECTION_POOL_SIZE,
				})
			});

			this._dialect = dialect;
			return dialect;
		}
		catch (err: any) {
			this._loggerManager.Error("FATAL", "Connect", err);
			throw new DatabaseConnectionException(
				"Connect",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Cierra la conección con la base de datos */
	public async CloseConnection(): Promise<void> {
		try {
			this._loggerManager.Activity("CloseConnection");
			if (this._instance === null) {
				throw new DatabaseNoInstanceException("CloseConnection", this._applicationContext, __filename);
			}

			await this._instance.destroy();
			this._loggerManager.Message("INFO", "El grupo de conexiones de base de datos se ha cerrado.");
		}
		catch (err: any) {
			this._loggerManager.Error("FATAL", "CloseConnection", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new DatabaseDesconnectionException(
				"CloseConnection",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtiene la instancia de la conección a la base de datos */
	public GetInstance(): Kysely<DataBaseEntity> {
		try {
			this._loggerManager.Activity("GetInstance");
			if (this._dialect === null) {
				throw new DatabaseNoDialectException("GetInstance", this._applicationContext, __filename);
			}

			this._instance = new Kysely<DataBaseEntity>({
				dialect: this._dialect
			});

			return this._instance;
		}
		catch (err: any) {
			this._loggerManager.Error("FATAL", "GetInstance", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"GetInstance",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestData.requestId,
				__filename,
				err
			);
		}
	}

}