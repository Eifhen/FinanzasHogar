import { Transaction } from "kysely";
import { ApplicationSQLDatabase, DataBase } from "../../../../Infraestructure/DataBase";
import ApplicationContext from "../../../Context/ApplicationContext";
import { IApplicationPromise, ApplicationPromise } from "../../../Helpers/ApplicationPromise";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { DatabaseTransactionException, BaseException } from "../../../ErrorHandling/Exceptions";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { ARRAY_LENGTH_EMPTY } from "../../../Utils/const";
import { HttpStatusName } from "../../../Utils/HttpCodes";
import ISqlGenericRepository from "../Interfaces/ISqlGenericRepository";



interface MssSqlTransactionBuilderDependencies {
	applicationContext: ApplicationContext;
	database: ApplicationSQLDatabase;
}

/** Clase para generar transacciones sql */
export default class SqlTransactionManager {

	// ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
	private _database: ApplicationSQLDatabase;

	/** Instancia del logger */
	private _logger: ILoggerManager;

	/** Repositorios que usaran la transacción */
	private _repositorys?: ISqlGenericRepository<any, any>[];

	/** contexto de aplicación */
	private _applicationContext: ApplicationContext;

	constructor(deps: MssSqlTransactionBuilderDependencies) {

		// Instanciamos el logger
		this._logger = new LoggerManager({
			applicationContext: deps.applicationContext,
			entityCategory: LoggEntityCategorys.BUILDER,
			entityName: "SqlTransactionManager"
		});

		this._applicationContext = deps.applicationContext;
		this._database = deps.database;
	}


	/** Inicia una nueva transacción */
	public Start = async <T>(action: (builder: SqlTransactionManager, trx: Transaction<DataBase>) => Promise<T>): IApplicationPromise<T> => {
		this._logger.Activity("Start");

		return ApplicationPromise.Try<T>(new Promise<T>((resolve, reject) => {
			this._database.transaction().setIsolationLevel("serializable").execute(async (transaction) => {

				/** Validamos si es necesario setear las transacciones en los repositorios */
				if (this._repositorys && this._repositorys.length > ARRAY_LENGTH_EMPTY) {
					this._logger.Message("INFO", "Configurando transacciones en los repositorios");
					await this.SetRepositoryTransactions(transaction);
				}

				/** Ejecutamos la acción y pasamos la transacción al callback */
				this._logger.Message("INFO", "Ejecutando acción con transacción");
				const result = await action(this, transaction);

				/** Resolvemos la promesa con el resultado de la acción */
				this._logger.Message("INFO", "Transacción ejecutada exitosamente");
				resolve(result);

			}).catch(transactionErr => {
				/** Cuando ocurre un error en la transacción este catch se ejecuta siempre y se ejecuta de
				 * forma asyncrona ya que transaction.execute es una IO operation */
				this._logger.Error("ERROR", "Transaction Execution Error", transactionErr);

				if (transactionErr instanceof ApplicationException) {
					reject(transactionErr);
				}
				else {
					reject(new DatabaseTransactionException("Start", this._applicationContext, __filename, transactionErr));
				}
			}).finally(() => {
				if (this._repositorys && this._repositorys.length > ARRAY_LENGTH_EMPTY) {
					this._logger.Message("INFO", "Limpiando transacciones de los repostorios");
					this.SetRepositoryTransactions(null)
					.catch((cleanupErr:ApplicationException) => {
						// si ocurre un error al limpiar las transacciones
						this._logger.Error("ERROR", "SetTransactions | Cleanup", cleanupErr);
						reject(cleanupErr);
					});
				}
			});
		}));
	}

	/** Setea las transacciones en los repositorios */
	private SetRepositoryTransactions = async (transaction: Transaction<DataBase> | null) => {
		try {
			this._logger.Activity("SetTransactions");

			if (this._repositorys && this._repositorys.length > ARRAY_LENGTH_EMPTY) {
				await Promise.all(this._repositorys.map(repository => repository.SetTransaction(transaction)));
			}

		}
		catch (err: any) {
			this._logger.Error("ERROR", "SetTransactions", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new BaseException(
				"SetTransactions",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			)
		}
	}

	/** Setea los repositorios que se van a utilizar en la transacción*/
	public SetWorkingRepositorys = async (transaction: Transaction<DataBase>, repositorys: ISqlGenericRepository<any, any>[]) => {
		try {
			this._logger.Activity("SetWorkingRepositorys");
			this._repositorys = repositorys;
			await this.SetRepositoryTransactions(transaction);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "SetWorkingRepositorys", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new BaseException(
				"SetWorkingRepositorys",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			)
		}
	}
}