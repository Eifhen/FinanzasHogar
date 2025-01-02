import ApplicationException from "../ErrorHandling/ApplicationException";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import ITokenManager from "./Interfaces/ITokenManager";
import jwt, { JwtPayload } from 'jsonwebtoken';
import LoggerManager from "./LoggerManager";
import IsNullOrEmpty from "../Utils/utils";


export default class TokenManager implements ITokenManager {

  /** Instancia del logger */
  private _logger: ILoggerManager;
  
  /** Hash o secret para el token  */
  private readonly secret: string;

  constructor(){
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MANAGER,
      entityName: "TokenManager"
    });

    this.secret = IsNullOrEmpty(process.env.TOKEN_KEY) ? "" : process.env.TOKEN_KEY!;
  }

  public Generate = async <T>(payload: T) : Promise<string> => {
    try {
      this._logger.Activity("Generate");
      const data = { data: payload };
      return jwt.sign(data, this.secret, {
        algorithm: "HS256"
      });
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "Generate", err);
      throw new ApplicationException(
        "Generate",
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename
      );
    }
  }

  public Decode = async (token: string) : Promise<string | JwtPayload> => {
    try {
      this._logger.Activity("Decode");
      const tk = token.split(" ")[1];  // quitamos el Bearer
      const decoded = jwt.verify(tk, this.secret);
      return decoded;
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "Decode", err);
      throw new ApplicationException(
        "Decode",
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename
      );
    }
  }

}