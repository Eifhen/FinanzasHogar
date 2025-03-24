/* eslint-disable @typescript-eslint/unbound-method */

import { Kysely, MssqlDialect, TediousConnection } from "kysely";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import * as tarn from 'tarn';
import * as tedious from 'tedious';
import { HttpStatusCode, HttpStatusName } from "../../../Utils/HttpCodes";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { DatabaseConnectionException, DatabaseNoDialectException, DatabaseNoInstanceException } from "../../../ErrorHandling/Exceptions";
import { AutoBind, AutoClassBinder } from "../../../Helpers/Decorators/AutoBind";
import IDatabaseConnectionStrategy from "../Interfaces/IDatabaseConnectionStrategy";
import ApplicationContext from "../../../Configurations/ApplicationContext";



/** 
	Si la connección no funciona revisar las credenciales de acceso y 
	que el Sql Agent esté corriendo
*/
interface ISqlStrategyDependencies {
	applicationContext: ApplicationContext;
}

/** Estrategia de conección a SQL usandoy Kysely */
@AutoClassBinder
export default class SqlConnectionStrategy<DataBaseEntity> implements IDatabaseConnectionStrategy<MssqlDialect, Kysely<DataBaseEntity>> {

	/** Logger Manager Instance */
	private _loggerManager: ILoggerManager;

	/** Dialecto sql */
	private _dialect: MssqlDialect | null = null;

	/** Instancia de sql */
	private _instance: Kysely<any> | null = null;

	/** Contexto de applicación */
	private _applicationContext: ApplicationContext;

	constructor(deps: ISqlStrategyDependencies) {
		this._loggerManager = new LoggerManager({
			entityCategory: LoggEntityCategorys.STRATEGY,
			applicationContext: deps.applicationContext,
			entityName: "SqlConnectionStrategy"
		});

		this._applicationContext = deps.applicationContext;
	}

	/** Método que permite realizar la conección a SQL Server */
	@AutoBind
	public async Connect() {
		try {
			this._loggerManager.Activity("Connect");

			/** Probamos si la conección se establece correctamente */
			// await this.TestConnection();

			const dialect = new MssqlDialect({
				tarn: {
					...tarn,
					options: {
						min: this._applicationContext.settings.databaseConnectionData.connectionPoolMinSize,
						max: this._applicationContext.settings.databaseConnectionData.connectionPoolMaxSize,
						// propagateCreateError: true, // Propaga los errores de creación de conexión
					},
				},
				tedious: {
					...tedious,
					connectionFactory: this.ConnectionFactory,
				},
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
	};

	/** Crea la connección a sqlserver */
	@AutoBind
	private CreateConnection(): tedious.Connection {
		this._loggerManager.Register("INFO", "CreateConnection");
		const connectionSettings = this._applicationContext.settings.databaseConnectionConfig.sqlConnectionConfig
		const connection = new tedious.Connection(connectionSettings);
		return connection;
	}

	/** Permite generar connecciones nuevas */
	@AutoBind
	private ConnectionFactory(): TediousConnection {
		this._loggerManager.Register("INFO", "ConnectionFactory");

		const connection = this.CreateConnection();

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

	/** Método que permite obtener una instancia de la connección a SQL Server */
	public GetInstance() {
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
	};

	/** Método que permite cerrar la connección con la base de datos */
	public async CloseConnection() {
		try {
			this._loggerManager.Activity("CloseDataBaseConnection");

			if (this._instance === null) {
				throw new DatabaseNoInstanceException("CloseConnection", this._applicationContext, __filename);
			}

			await this._instance.destroy();
			this._loggerManager.Message("INFO", "Database connection pool has been closed.");
		}
		catch (err: any) {
			this._loggerManager.Error("FATAL", "CloseConnection", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"CloseConnection",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestData.requestId,
				__filename,
				err
			);
		}
	}

	/** Prueba la conección a la base de datos */
	// private TestConnection(): Promise<void> {

	//   const connection = this.CreateConnection();

	//   return new Promise((resolve, reject) => {

	//     /** Iniciamos la coneccion */
	//     connection.connect((err) => {
	//       this._loggerManager.Message("INFO", "Testing connection to the database");
	//       if (err) {
	//         // Si ocurre un error al conectar, se rechaza la promesa
	//         this._loggerManager.Message("FATAL", "Testing connection | Database Connection failed", err);

	//         /** Si ocurre un error cerramos la coneccion */
	//         connection.close();
	//         reject(err);
	//       } else {
	//         // Si la conexión es exitosa, se resuelve la promesa
	//         this._loggerManager.Message("INFO", "Testing connection | Database Connection established");

	//         /** Si la conneccion es exitosa cerramos la conección */
	//         connection.close();
	//         resolve();
	//       }
	//     });
	//   });
	// }

}


