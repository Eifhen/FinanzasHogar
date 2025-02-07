import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import ITokenManager from "./Interfaces/ITokenManager";
import jwt, { JwtPayload } from 'jsonwebtoken';
import LoggerManager from "./LoggerManager";
import ApplicationContext from '../Application/ApplicationContext';
import { BaseException } from "../ErrorHandling/Exceptions";
import bcrypt from 'bcrypt';


interface TokenManagerDependencies {
  applicationContext: ApplicationContext;
}
export default class TokenManager implements ITokenManager {

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Hash o secret para el token  */
  private readonly secret: string;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  constructor(deps: TokenManagerDependencies) {
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MANAGER,
      entityName: "TokenManager"
    });

    this._applicationContext = deps.applicationContext;
    this.secret = this._applicationContext.settings.apiData.tokenKey;
  }

  /** Permite generar un token jwt con un payload del tipo ingresado */
  public GeneratePayloadToken = async <T>(payload: T): Promise<string> => {
    try {
      this._logger.Activity("Generate");
      const data = { data: payload };
      return jwt.sign(data, this.secret, {
        algorithm: "HS256"
      });
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.ERROR, "Generate", err);
      throw new BaseException(
        "GeneratePayloadToken",
        err.message,
        this._applicationContext,
        __filename
      );
    }
  }
  /** Permite decodificar un token jwt ingresado */
  public Decode = async (token: string): Promise<string | JwtPayload> => {
    try {
      this._logger.Activity("Decode");
      const tk = token.split(" ")[1];  // quitamos el Bearer
      const decoded = jwt.verify(tk, this.secret);
      return decoded;
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.ERROR, "Decode", err);
      throw new BaseException(
        "Decode",
        err.message,
        this._applicationContext,
        __filename
      );
    }
  }

  /**
 * Genera un token aleatorio y seguro (No JWT), y lo hashea usando bcrypt
 * @returns {Promise<string>} - El token hasheado generado
 */
  public GenerateToken = async (): Promise<string> => {
    try {
      this._logger.Activity("GenerateToken");
      
      const LENGTH = 32;
      const SALT_ROUNDS = 10;

      // Generar una cadena aleatoria
      const token = [...Array(LENGTH)].map(() => Math.random().toString(36)[2]).join('');

      // Hashear la cadena usando bcrypt
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const result = await bcrypt.hash(token, salt);

      // Devolvemos el token
      return result;

    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.ERROR, "GenerateToken", err);
      throw new BaseException(
        "GenerateToken",
        err.message,
        this._applicationContext,
        __filename
      );
    }
  }

}