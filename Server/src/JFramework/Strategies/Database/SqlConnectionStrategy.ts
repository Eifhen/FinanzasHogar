import { Kysely, MssqlDialect } from "kysely";
import ILoggerManager, { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import IDataBaseConnectionStrategy from "./IDataBaseConnectionStrategy";
import * as tarn from 'tarn';
import * as tedious from 'tedious';
import { HttpStatusCode, HttpStatusName } from "../../Utils/HttpCodes";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { ApplicationSQLDatabase, DataBase } from "../../../Infraestructure/DataBase";
import ApplicationContext from "../../Application/ApplicationContext";



/** 
  Si la connección no funciona revisar las credenciales de acceso y 
  que el Sql Agent esté corriendo
*/
interface ISqlStrategyDependencies {
  applicationContext: ApplicationContext;
}

/** Estrategia de conección a SQL usandoy Kysely */
export default class SqlConnectionStrategy implements IDataBaseConnectionStrategy<MssqlDialect, ApplicationSQLDatabase> {

  /** Logger Manager Instance */
  private _loggerManager: ILoggerManager;

  /** Dialecto sql */
  private _dialect: MssqlDialect | null = null;

  /** Instancia de sql */
  private _instance: ApplicationSQLDatabase | null = null;

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
  public Connect = async () => {
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
            this._loggerManager.Register("INFO", "connectionFactory");
            const connection = new tedious.Connection(this._applicationContext.settings.databaseConnectionConfig.sqlConnectionConfig);

            // Manejador de conexión exitosa
            connection.on("connect", (err) => {
              if (err) {
                // Si ocurre un error al conectar, se rechaza la promesa
                this._loggerManager.Message("FATAL", "Database Connection failed", err);
              } else {
                // Si la conexión es exitosa, se resuelve la promesa
                this._loggerManager.Message("INFO", "Database Connection established");
              }
            });
             
            return connection;
          },
        },
      });

      this._dialect = dialect;
      return dialect;
    }
    catch (err: any) {
      this._loggerManager.Error("FATAL", "Connect", err);
      throw new ApplicationException(
        "Connect",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  };


  /** Método que permite obtener una instancia de la connección a SQL Server */
  public GetInstance = () => {
    try {
      this._loggerManager.Activity("GetInstance");
      if (this._dialect === null) {
        throw Error("Por el momento no hay un dialecto disponible");
      }

      this._instance = new Kysely<DataBase>({
        dialect: this._dialect
      });

      return this._instance;
    }
    catch (err: any) {
      this._loggerManager.Error("FATAL", "GetInstance", err);
      throw new ApplicationException(
        "GetInstance",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  };

  /** Método que permite cerrar la connección con la base de datos */
  public CloseConnection = async () => {
    try {
      this._loggerManager.Activity("CloseDataBaseConnection");

      if (this._instance === null) {
        throw Error("Por el momento no hay una instancia disponible");
      }

      await this._instance.destroy();
      this._loggerManager.Message("INFO", "Database connection pool has been closed.");
    }
    catch (err: any) {
      this._loggerManager.Error("FATAL", "CloseConnection", err);
      throw new ApplicationException(
        "CloseConnection",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  }

}