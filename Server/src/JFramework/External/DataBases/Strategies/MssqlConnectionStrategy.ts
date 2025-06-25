
import { Kysely, MssqlDialect } from "kysely";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import * as tarn from 'tarn';
import * as tedious from 'tedious';
import { HttpStatusCode, HttpStatusName } from "../../../Utils/HttpCodes";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { DatabaseConnectionException, DatabaseDesconnectionException, DatabaseNoDialectException, DatabaseNoInstanceException, NullParameterException } from "../../../ErrorHandling/Exceptions";
import { AutoClassBinder } from "../../../Helpers/Decorators/AutoBind";
import IDatabaseConnectionStrategy, { IDatabaseConnectionStrategyBaseDependencies } from "../Interfaces/IDatabaseConnectionStrategy";
import ApplicationContext from "../../../Configurations/ApplicationContext";
import { ConnectionStrategyData } from "../Types/DatabaseType";
import DatabaseConnectionObject from "../Utils/DatabaseConnectionObject";



/**  Si la connección no funciona revisar las 
 * credenciales de acceso y que el Sql Agent esté corriendo */
interface IMssqlConnectionStrategyDependencies extends IDatabaseConnectionStrategyBaseDependencies {

}

/** Estrategia de conección a SQL usandoy Kysely */
@AutoClassBinder
export default class MssqlConnectionStrategy<DataBaseEntity> implements IDatabaseConnectionStrategy<MssqlDialect, Kysely<DataBaseEntity>> {

	/** Logger Manager Instance */
	private _loggerManager: ILoggerManager;

	/** Dialecto sql */
	private _dialect: MssqlDialect | null = null;

	/** Instancia de sql */
	private _instance: Kysely<DataBaseEntity> | null = null;

	/** Contexto de applicación */
	private _applicationContext: ApplicationContext;

	/** Datos de conexión de para el MssqlConnectionStrategy 
	 *  -connectionData = Datos de conexión a la DB  */
	private _connectionOptions?: ConnectionStrategyData;

	/** Objeto de conexión de para el MssqlConnectionStrategy   */
	private _connectionObject: DatabaseConnectionObject;

	constructor(deps: IMssqlConnectionStrategyDependencies) {
		this._loggerManager = new LoggerManager({
			entityCategory: LoggEntityCategorys.STRATEGY,
			applicationContext: deps.applicationContext,
			entityName: "MssqlConnectionStrategy"
		});

		/** Seteamos el contexto */
		this._applicationContext = deps.applicationContext;

		/** Seteamos las opciones de conexión */
		this._connectionOptions = deps.connectionOptions;

		/** Seteamos el objeto de connección */
		this._connectionObject = new DatabaseConnectionObject({
			connectionOptions: this._connectionOptions
		})
	}


	/** Método que permite obtener una instancia de la connección a SQL Server */
	public GetInstance(): Kysely<DataBaseEntity> {
		try {
			this._loggerManager.Activity("GetInstance");

			if (!this._dialect || !this._instance) {
				throw new DatabaseNoDialectException("GetInstance", this._applicationContext, __filename);
			}

			/** Devolvemos la instancia que tenemos */
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

	/** Permite manejar los eventos de conección */
	private onConnectionEvent(connection: tedious.Connection) {
		this._loggerManager.Register("INFO", "ConnectionFactory");

		connection.on("connect", (err) => {
			this._loggerManager.Message("INFO", "Starting connection to the database");
			if (err) {
				this._loggerManager.Message("FATAL", "Database Connection failed", err);

				/** OJO a esto, se está emitiendo un nuevo error cuando 
				 ocurre un error de conección, desconosco que impacto puede tener esto
				 en Kysely,pero según lo que he podido ver, al emitir el error de esta forma
				 Kysely sobreescribe el error de connección original con el error emitido aquí */
				// connection.emit("error", new DatabaseConnectionException(
				//   "ConnectionFactory", 
				//   this._applicationContext, 
				//   __filename, 
				//   err
				// ));
			} else {
				this._loggerManager.Message("INFO", "Database Connection established");
			}
		});

		connection.on("error", (err) => {
			this._loggerManager.Message("FATAL", "Runtime Database Error", err);
		})

		return connection;
	}

	/** Método que permite realizar la conección a SQL Server */
	public async Connect() {
		try {
			this._loggerManager.Activity("Connect");

			if (!this._connectionOptions) {
				throw new NullParameterException("Connect", "_strategyConnectionData", this._applicationContext, __filename);
			}

			if (this._instance) {
				this._loggerManager.Message("INFO", "El intento de conexión fue pasado por alto ya que ya existe una instancia de esta conexión");
				return this._instance;
			}

			const dialect = new MssqlDialect({
				tarn: {
					...tarn,
					options: {
						min: this._connectionOptions.connectionData.connectionPoolMinSize,
						max: this._connectionOptions.connectionData.connectionPoolMaxSize,
						// propagateCreateError: true, // Propaga los errores de creación de conexión
					},
				},
				tedious: {
					...tedious,
					connectionFactory: () => {
						if (!this._connectionOptions) {
							throw new NullParameterException("ConnectionFactory", "_connectionOptions", this._applicationContext, __filename);
						}

						/** Obtenemos el objeto de conección */
						const connectionData = this._connectionObject.GetMssqlConnectionObject();

						/** Establecemos la conección mediante Tedious */
						const connection = new tedious.Connection(connectionData);

						/** Maneja los eventos de conección */
						this.onConnectionEvent(connection);

						return connection
					}
				},
			});

			/** Agregamos el dialecto */
			this._dialect = dialect;

			/** Agregamos la instancia */
			this._instance = new Kysely<DataBaseEntity>({
				dialect: this._dialect
			});

			return this._instance;
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
	};

	/** Método que permite cerrar la connección con la base de datos */
	public async CloseConnection() {
		try {
			this._loggerManager.Activity("CloseDataBaseConnection");

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

}


