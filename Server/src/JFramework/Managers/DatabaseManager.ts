import { NO_REQUEST_ID } from '../CommonTypes/const';
import IDatabaseConnectionStrategy from '../Strategies/Database/IDatabaseConnectionStrategy';
import ApplicationException from '../ErrorHandling/ApplicationException';
import { HttpStatusCode } from '../Utils/HttpCodes';
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import LoggerManager from './LoggerManager';


interface IDatabaseManagerDependencies<C, I> {
  strategy: IDatabaseConnectionStrategy<C,I>;
}

/** Implementa la estrategia de base de datos */
export default class DatabaseManager<ConnectionType, InstanceType> {
  
  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Instancia de la estrategia de conección a utilizar */
  private _strategy: IDatabaseConnectionStrategy<ConnectionType, InstanceType>;

  constructor(deps: IDatabaseManagerDependencies<ConnectionType, InstanceType>){
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MANAGER,
      entityName: "DatabaseManager"
    });

    this._strategy = deps.strategy;
  }
  
  /** Realiza la connección a la base de datos */
  public Connect =() : ConnectionType => {
    try {
      this._logger.Activity("Connect");
      return this._strategy.Connect();
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.FATAL, "Connect");
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  }

  /** Obtiene la instancia de la base de datos */
  public GetInstance = () : InstanceType => {
    try {
      this._logger.Activity("GetInstance");
      return this._strategy.GetInstance();
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.FATAL, "GetInstance");
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  }

  /** Método que permite cerrar la conección SQL */
  public CloseConnection =  async () => {
    try {
      this._logger.Activity("CloseConnection");
      await this._strategy.CloseConnection();
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.FATAL, "CloseConnection");
      throw new ApplicationException(
        err.message,
        NO_REQUEST_ID,
        HttpStatusCode.InternalServerError,
        __filename,
        err
      );
    }
  };


}