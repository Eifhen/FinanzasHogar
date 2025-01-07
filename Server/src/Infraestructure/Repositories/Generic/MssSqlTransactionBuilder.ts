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


/** Clase para generar transacciones sql */
export default class MssSqlTransactionBuilder {

  // ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
  private _database: ApplicationSQLDatabase;

  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Repositorios que usaran la transacción */
  private _repositorys: IMssSqlGenericRepository<any, any>[];

  /** contexto de aplicación */
  private _context: ApplicationContext;


  constructor(context:ApplicationContext, repositorys: IMssSqlGenericRepository<any, any>[]) {
    
    // Instanciamos el logger
    this._logger = new LoggerManager({
      applicationContext: context,
      entityCategory: LoggEntityCategorys.BUILDER,
      entityName: "MssSqlTransactionBuilder"
    });
    
    this._context = context;
    this._database = this._context.database;
    this._repositorys = repositorys;
  }


  /** Inicia una nueva transacción */
  public Start = async <T>(action: (trx: Transaction<DataBase>) => Promise<T>): Promise<T> => {

    this._database.transaction()
    return await this._database.transaction().setIsolationLevel("serializable").execute(async (transaction)=>{
      try {
        this._logger.Activity("Start");
        // Setea la transacción a todos los repositorios ingresados
        await this.SetTransactions(transaction);

        /** Ejecuta una acción y pasa la transacción para su manipulación en un nivel superior */
        return await action(transaction);
      }
      catch(err:any){
        /** Lanza un ApplicationException en caso de error, esto realiza un rollback automatico */
        this._logger.Error("ERROR", "Start", err);

        if(err instanceof ApplicationException ){
          throw err;
        }

        throw new ApplicationException(
          err.message,
          "Start",
          HttpStatusCode.InternalServerError,
          IsNullOrEmpty(this._context.requestID) ? NO_REQUEST_ID : this._context.requestID,
          __filename,
          err
        );
      }
      finally {
        /** Cierra la instancia de la transacción en los repositorios */
        await this.SetTransactions(null);
      }
    });
  }

  /** Setea las transacciones en los repositorios */
  private SetTransactions = async (transaction: Transaction<DataBase>|null) => {
    try {
      this._logger.Activity("SetTransactions");

      console.log("SetTransactions =>", transaction);

      if (this._repositorys && this._repositorys.length > 0) {
        await Promise.all(this._repositorys.map(repository => repository.setTransaction(transaction)));
      }
      
    }
    catch(err:any){
      this._logger.Error("ERROR", "SetTransactions", err);

      if(err instanceof ApplicationException ){
        throw err;
      }
      
      throw new ApplicationException(
        err.message,
        "SetTransactions",
        HttpStatusCode.InternalServerError,
        IsNullOrEmpty(this._context.requestID) ? NO_REQUEST_ID : this._context.requestID,
        __filename,
        err
      );
    }
  }
}