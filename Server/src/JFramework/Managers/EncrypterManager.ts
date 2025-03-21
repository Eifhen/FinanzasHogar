import ApplicationContext from "../Configurations/ApplicationContext";
import { BaseException } from "../ErrorHandling/Exceptions";
import { HttpStatusName } from "../Utils/HttpCodes";
import IEncrypterManager from "./Interfaces/IEncrypterManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import bcrypt from 'bcrypt';


interface EncrypterManagerDependencies {
	applicationContext: ApplicationContext;
}
export default class EncrypterManager implements IEncrypterManager {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	private readonly saltRounds: number = 10;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: EncrypterManagerDependencies) {
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MANAGER,
			applicationContext: deps.applicationContext,
			entityName: "EncrypterManager",
		});

		this._applicationContext = deps.applicationContext;
	}

	/** Método que permite encryptar un valor string */
	public async Encrypt(value: string): Promise<string> {
		try {
			this._logger.Activity("Encrypt");
			const salt = await bcrypt.genSalt(this.saltRounds);
			const result = await bcrypt.hash(value, salt);
			return result;
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "Encrypt", err);

			throw new BaseException(
				"Encrypt",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Función que permite comparar dos valores */
	public async Compare(value: string, hashedValue: string): Promise<boolean> {
		try {
			this._logger.Activity("Compare");
			return await bcrypt.compare(value, hashedValue);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "Compare", err);

			throw new BaseException(
				"Compare",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}
}