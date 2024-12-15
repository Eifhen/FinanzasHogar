import * as tedious from 'tedious'
import * as tarn from 'tarn'
import { Kysely, MssqlDialect } from 'kysely'
import { DataBase } from '../Data/DataBase'
import ILoggerManager, { LoggEntityCategorys } from '../Managers/Interfaces/ILoggerManager'
import LoggerManager from '../Managers/LoggerManager'
import { NO_REQUEST_ID } from '../Shered/CommonTypes/const'
import { HttpStatusCode } from '../Utils/HttpCodes'
import ApplicationException from '../Shered/ErrorHandling/ApplicationException'
import IDataBaseConfig from './types/IDataBaseConfig'


/** Esta clase sirve para manejar la 
 * configuración del acceso a la base de datos 
 */
export default class DataBaseConfig implements IDataBaseConfig {


  /** Logger Manager Instance */
  private _loggerManager: ILoggerManager = new LoggerManager({
    entityCategory: LoggEntityCategorys.CONFIGURATION,
    entityName: "DataBaseConfig"
  });

  /** Keysely DataBase instance */
  public instance: Kysely<DataBase>;

  constructor() {
    this._loggerManager.Register("INFO", "CONSTRUCTOR");
    this.instance = this.GetDataBaseInstance();
  }

  /** Este método ejecuta la conección con la base de datos */
  private Build = (): MssqlDialect => {
    try {
      this._loggerManager.Activity("Build");

      const dialect = new MssqlDialect({
        tarn: {
          ...tarn,
          options: {
            min: 0,
            max: 10,
          },
        },
        tedious: {
          ...tedious,
          connectionFactory: () => {
            // console.log("data =>", {
            //   userName: process.env.DB_USERNAME,
            //   password: process.env.DB_PASSWORD ?? "",
            //   database: process.env.DB_NAME,
            //   port: process.env.DB_PORT,
            //   server: process.env.DB_SERVER,
            // });
            this._loggerManager.Register("INFO", "connectionFactory");
            return new tedious.Connection({
              server: process.env.DB_SERVER ?? "",
              options: {
                database: process.env.DB_NAME ?? "",
                instanceName: process.env.DB_INSTANCE ?? "",
                // port: Number(process.env.DB_PORT ?? 0),
                trustServerCertificate: true,
                abortTransactionOnError: true, // Aborta cualquier transacción automaticamente si ocurre un error en sql.

                /**
                  maxRetriesOnTransientErrors: 2, // The maximum number of connection retries for transient errors. (default: 3).
                  requestTimeout: 1000, // The number of milliseconds before a request is considered failed, or 0 for no timeout (default: 15000).
                  cancelTimeout: 1000, // The number of milliseconds before the cancel (abort) of a request is considered failed (default: 5000).
                  connectTimeout: 1000, // The number of milliseconds before the attempt to connect is considered failed (default: 15000).
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

      return dialect;
    }
    catch (err: any) {
      this._loggerManager.Error("FATAL", "Build", err);
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  }

  /**
   * @description
   *  Database interface is passed to Kysely's constructor, and from now on, Kysely 
      knows your database structure.
      Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
      to communicate with your database.

    * @returns - Keysely database instance 
  */
  private GetDataBaseInstance = (): Kysely<DataBase> => {
    this._loggerManager.Activity("GetDataBaseInstance");
    const dialect = this.Build();
    return new Kysely<DataBase>({ dialect });
  }


  /** Cierra el pool de conexiones */
  public async CloseDataBaseConnection(): Promise<void> {
    try {
      this._loggerManager.Activity("CloseDataBaseConnection");
      await this.instance.destroy();
      this._loggerManager.Message("INFO", "Database connection pool has been closed.");
    } catch (err: any) {
      this._loggerManager.Error("FATAL", "CloseDataBaseConnection", err);
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



