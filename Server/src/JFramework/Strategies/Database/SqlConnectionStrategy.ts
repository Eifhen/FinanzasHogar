import { Kysely, MssqlDialect, SqliteDriver } from "kysely";
import ILoggerManager, { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import IDBConnectionStrategy from "./IDBConnectionStrategy";
import * as tarn from 'tarn';
import * as tedious from 'tedious';
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusCode } from "../../Utils/HttpCodes";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { ApplicationSQLDatabase, DataBase } from "../../../Infraestructure/DataBase";


/** 
  Si la connección no funciona revisar las credenciales de acceso y 
  que el Sql Agent esté corriendo
*/

/** Estrategia de conección a SQL usandoy Kysely */
export default class SqlConnectionStrategy implements IDBConnectionStrategy<MssqlDialect, ApplicationSQLDatabase> {

  /** Logger Manager Instance */
  private _loggerManager: ILoggerManager = new LoggerManager({
    entityCategory: LoggEntityCategorys.STRATEGY,
    entityName: "SqlConnectionStrategy"
  });

  private _dialect: MssqlDialect|null = null;
  private _instance: ApplicationSQLDatabase|null = null;

  constructor() { }

  /** Método que permite realizar la conección a SQL Server */
  public Connect = () => {
    try {
      this._loggerManager.Activity("Connect");
      const dialect = new MssqlDialect({
        tarn: {
          ...tarn,
          options: {
            min: 1, // tamaño minimo del conection pool
            max: 10, // tamaño maximo del connection pool
          },
        },
        tedious: {
          ...tedious,
          connectionFactory: () => {
          
            /** 
              Agregar esto al logger para ver que datos están entrando.
                 {
                  userName: process.env.DB_USERNAME,
                  password: process.env.DB_PASSWORD ?? "",
                  database: process.env.DB_NAME,
                  port: process.env.DB_PORT,
                  server: process.env.DB_SERVER,
                }
            */

            this._loggerManager.Register("INFO", "connectionFactory");

            return new tedious.Connection({
              server: process.env.DB_SERVER ?? "",
              options: {
                database: process.env.DB_NAME ?? "",
                instanceName: process.env.DB_INSTANCE ?? "",
                // port: Number(process.env.DB_PORT ?? 0),
                trustServerCertificate: true,
                abortTransactionOnError: true, // Aborta cualquier transacción automaticamente si ocurre un error en sql.
                connectTimeout: 3000, // The number of milliseconds before the attempt to connect is considered failed (default: 15000).

                /**
                  maxRetriesOnTransientErrors: 2, // The maximum number of connection retries for transient errors. (default: 3).
                  requestTimeout: 1000, // The number of milliseconds before a request is considered failed, or 0 for no timeout (default: 15000).
                  cancelTimeout: 1000, // The number of milliseconds before the cancel (abort) of a request is considered failed (default: 5000).
                  connectionRetryInterval: 1000, // Tiempo entre intentos (en ms)
                */
              },
              authentication: {
                type: 'default',
                options: {
                  userName: process.env.DB_USERNAME ?? "",
                  password: process.env.DB_PASSWORD ?? "",
                  //domain: process.env.DB_DOMAIN ?? "",
                },
              },
            })
          },
        },
      });

      this._dialect = dialect;
      return dialect;
    }
    catch (err: any) {
      this._loggerManager.Error("FATAL", "Connect", err);
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  };


  /** Método que permite obtener una instancia de la connección a SQL Server */
  public GetInstance = () => {
    try {
      this._loggerManager.Activity("GetInstance");
      if(this._dialect === null){
        throw Error("Por el momento no hay un dialecto disponible");
      }

      this._instance = new Kysely<DataBase>({ 
        dialect: this._dialect 
      });

      return this._instance; 
    }
    catch(err:any){
      this._loggerManager.Error("FATAL", "GetInstance", err);
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  };

  /** Método que permite cerrar la connección con la base de datos */
  public CloseConnection = async () => {
    try {
      this._loggerManager.Activity("CloseDataBaseConnection");
      
      if(this._instance === null){
        throw Error("Por el momento no hay una instancia disponible");
      }

      await this._instance.destroy();
      this._loggerManager.Message("INFO", "Database connection pool has been closed.");
    }
    catch(err: any){
      this._loggerManager.Error("FATAL", "CloseConnection", err);
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