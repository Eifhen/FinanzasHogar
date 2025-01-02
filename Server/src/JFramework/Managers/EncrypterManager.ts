import ApplicationException from "../ErrorHandling/ApplicationException";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../Utils/HttpCodes";
import IEncrypterManager from "./Interfaces/IEncrypterManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import bcrypt from 'bcrypt';



export default class EncrypterManager implements IEncrypterManager {
  
  /** Instancia del logger */
  private _logger: ILoggerManager;

  private readonly saltRounds:number = 10;

  constructor(){
   // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MANAGER,
      entityName: "EncrypterManager"
    });
  }

  /** Método que permite encryptar un valor string */
  Encrypt = async (value:string) : Promise<string> => {
    try {
      this._logger.Activity("Encrypt");
      const salt = await bcrypt.genSalt(this.saltRounds);
      const result = await bcrypt.hash(value, salt);
      return result;
    }
    catch(err:any){
     this._logger.Error(LoggerTypes.ERROR, "Encrypt", err);
     throw new ApplicationException(
        "Encrypt",
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename
      );
    }
  }

  /** Función que permite comparar dos valores */
  Compare = async (value: string, hashedValue: string) : Promise<boolean> => {
    try {
      this._logger.Activity("Compare");
      return await bcrypt.compare(value, hashedValue);
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "Compare", err);
      throw new ApplicationException(
        "Compare",
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename
      );
    }
  }
}