import { Transaction } from "kysely";
import ApplicationException from "../../../JFramework/ErrorHandling/ApplicationException";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../../JFramework/Utils/const";
import { HttpStatusCode, HttpStatusName } from "../../../JFramework/Utils/HttpCodes";
import { ApplicationSQLDatabase, DataBase } from "../../DataBase";
import IMssSqlGenericRepository from "./Interfaces/IMssSqlGenericRepository";
import ApplicationContext from "../../../JFramework/Application/ApplicationContext";
import IsNullOrEmpty from "../../../JFramework/Utils/utils";
import { BaseException } from "../../../JFramework/ErrorHandling/Exceptions";
import { ApplicationPromise, IApplicationPromise } from "../../../JFramework/Application/ApplicationPromise";



interface MssSqlTransactionBuilderDependencies {
  applicationContext: ApplicationContext;
  database: ApplicationSQLDatabase;
}

/** Clase para generar transacciones sql */
export default class MssSqlTransactionBuilder {

  // ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
  private _database: ApplicationSQLDatabase;

  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Repositorios que usaran la transacción */
  private _repositorys?: IMssSqlGenericRepository<any, any>[];

  /** contexto de aplicación */
  private _applicationContext: ApplicationContext;

  constructor(deps:MssSqlTransactionBuilderDependencies) {

    // Instanciamos el logger
    this._logger = new LoggerManager({
      applicationContext: deps.applicationContext,
      entityCategory: LoggEntityCategorys.BUILDER,
      entityName: "MssSqlTransactionBuilder"
    });

    this._applicationContext =  deps.applicationContext;
    this._database = deps.database;
  }


  /** Inicia una nueva transacción */
  public Start = async <T>(action: (builder:MssSqlTransactionBuilder, trx: Transaction<DataBase>) => Promise<T>): IApplicationPromise<T> => {
    this._logger.Activity("Start");

    return ApplicationPromise.Try<T>(new Promise<T>((resolve, reject) => {
      this._database.transaction().setIsolationLevel("serializable").execute(async (transaction) => {

        /** Validamos si es necesario setear las transacciones en los repositorios */
        if (this._repositorys && this._repositorys.length > 0) {
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
        reject(transactionErr);

      }).finally(() => {
        if (this._repositorys && this._repositorys.length > 0) {
          this._logger.Message("INFO", "Limpiando transacciones de los repostorios");
          this.SetRepositoryTransactions(null).catch(cleanupErr => {
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

      if (this._repositorys && this._repositorys.length > 0) {
        await Promise.all(this._repositorys.map(repository => repository.setTransaction(transaction)));
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
  public SetWorkingRepositorys = async (transaction: Transaction<DataBase>, repositorys: IMssSqlGenericRepository<any, any>[]) => {
    try {
      this._logger.Activity("SetWorkingRepositorys");
      this._repositorys = repositorys;
      this.SetRepositoryTransactions(transaction);
    }
    catch(err:any){
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