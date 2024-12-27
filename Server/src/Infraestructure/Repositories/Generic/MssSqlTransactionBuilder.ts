import { Transaction } from "kysely";
import ApplicationException from "../../../JFramework/ErrorHandling/ApplicationException";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../../JFramework/Utils/const";
import { HttpStatusCode } from "../../../JFramework/Utils/HttpCodes";
import { ApplicationSQLDatabase, DataBase } from "../../DataBase";
import IMssSqlGenericRepository from "./Interfaces/IMssSqlGenericRepository";


/** Clase para generar transacciones sql */
export default class MssSqlTransactionBuilder {

  // ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
  private _database: ApplicationSQLDatabase;

  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Repositorios que usaran la transacción */
  private _repositorys: IMssSqlGenericRepository<any, any>[];


  constructor(database: ApplicationSQLDatabase, repositorys: IMssSqlGenericRepository<any, any>[]) {
    this._database = database;
    
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.BUILDER,
      entityName: "MssSqlTransactionBuilder"
    });

    this._repositorys = repositorys;

  }


  /** Inicia una nueva transacción */
  public Start = async <T>(action: (trx: Transaction<DataBase>) => Promise<T>): Promise<T> => {
    return await this._database.transaction().execute(async (transaction)=>{
      try {
        this._logger.Activity("Start");

        // Setea la transacción a todos los repositorios ingresados
        this.SetTransactions(transaction);

        /** Ejecuta una acción y pasa la transacción para su manipulación en un nivel superior */
        return await action(transaction);
      }
      catch(err:any){
        /** Lanza un ApplicationException en caso de error, esto realiza un rollback automatico */
        this._logger.Error("ERROR", "Start", err);
        throw new ApplicationException(
          err.message,
          NO_REQUEST_ID,
          HttpStatusCode.InternalServerError,
          __filename,
          err
        );
      }
      finally {
        /** Cierra la instancia de la transacción en los repositorios */
        this.SetTransactions(null);
      }
    });
  }

  /** Setea las transacciones en los repositorios */
  private SetTransactions = async (transaction: Transaction<DataBase>|null) => {
    try {
      this._logger.Activity("SetTransactions");

      if(this._repositorys && this._repositorys.length > 0){
        this._repositorys.forEach(repository => {
          repository.setTransaction(transaction);
        })
      }
    }
    catch(err:any){
      this._logger.Error("ERROR", "SetTransactions", err);
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  }
}