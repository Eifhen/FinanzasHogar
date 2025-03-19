import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import ITokenManager from "./Interfaces/ITokenManager";
import jwt, { JwtPayload } from 'jsonwebtoken';
import LoggerManager from "./LoggerManager";
import ApplicationContext from '../Context/ApplicationContext';
import { BaseException } from "../ErrorHandling/Exceptions";
import bcrypt from 'bcrypt';
import { HttpStatusName } from "../Utils/HttpCodes";
import { DEFAULT_TOKEN_LENGTH } from "../Utils/const";


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
			applicationContext: deps.applicationContext,
			entityName: "TokenManager",
		});

		this._applicationContext = deps.applicationContext;
		this.secret = this._applicationContext.settings.apiData.tokenKey;
	}

	/** Permite generar un token jwt con un payload del tipo ingresado */
	public async GeneratePayloadToken<T>(payload: T): Promise<string> {
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
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename
			);
		}
	}
	/** Permite decodificar un token jwt ingresado */
	public async Decode(token: string): Promise<string | JwtPayload> {
		try {
			this._logger.Activity("Decode");
			const BEARER_POSITION = 1;
			const tk = token.split(" ")[BEARER_POSITION];  // quitamos el Bearer
			const decoded = jwt.verify(tk, this.secret);
			return decoded;
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "Decode", err);
			throw new BaseException(
				"Decode",
				HttpStatusName.InternalServerError,
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
	public async GenerateToken(): Promise<string> {
		try {
			this._logger.Activity("GenerateToken");

			const SALT_ROUNDS = 10;
			const BASE_STRING = 36; /** Indica que el string es base36 */
			const CHAR_INDEX = 2;
			
			/** Generar una cadena aleatoria  
			 * Para cada elemento del arreglo de longitud LENGTH, se genera un número aleatorio con Math.random().
			 * Ese número se convierte a una cadena en base 36.
			 * Se toma el tercer carácter de la cadena resultante (índice 2).
			 * Finalmente, se unen todos esos caracteres para formar la cadena aleatoria. */

			const token = [...Array(DEFAULT_TOKEN_LENGTH)].map(() => Math.random().toString(BASE_STRING)[CHAR_INDEX]).join('');

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
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename
			);
		}
	}

}