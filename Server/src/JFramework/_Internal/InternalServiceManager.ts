import SqlTransactionManager from "../../Infraestructure/Repositories/Generic/SqlTransactionManager";
import ErrorHandlerMiddleware from "../ErrorHandling/ErrorHandlerMiddleware";
import { EmailDataManager } from "../Managers/EmailDataManager";
import EmailManager from "../Managers/EmailManager";
import EmailTemplateManager from "../Managers/EmailTemplateManager";
import EncrypterManager from "../Managers/EncrypterManager";
import { FileManager } from "../Managers/FileManager";
import { IEmailDataManager } from "../Managers/Interfaces/IEmailDataManager";
import IEmailManager from "../Managers/Interfaces/IEmailManager";
import { IEmailTemplateManager } from "../Managers/Interfaces/IEmailTemplateManager";
import IEncrypterManager from "../Managers/Interfaces/IEncrypterManager";
import IFileManager from "../Managers/Interfaces/IFileManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import ITokenManager from "../Managers/Interfaces/ITokenManager";
import LoggerManager from "../Managers/LoggerManager";
import TokenManager from "../Managers/TokenManager";
import { CloudinaryImageStrategy } from "../Strategies/Image/CloudinaryImageStrategy";
import ImageStrategyDirector from "../Strategies/Image/ImageStrategyDirector";
import IInternalServiceManager from "./types/IInternalServiceManager";
import IServiceManager from "./types/IServiceManager";


export class InternalServiceManager implements IInternalServiceManager {


	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Manejador de servicios */
	private readonly _serviceManager: IServiceManager;

	constructor(serviceManager: IServiceManager) {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "InternalServiceManager"
		});

		this._serviceManager = serviceManager;
	}

	/** Agregamos las estrategias de desarrollo interno */
	public async AddInternalStrategies(): Promise<void> {
		try {
			this._logger.Activity("AddInternalStrategies");
			this._serviceManager.AddStrategy("imageDirector", ImageStrategyDirector, CloudinaryImageStrategy);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalStrategies", err);
			throw err;
		}
	}

	/** Agregamos los manejadores internos de la aplicación */
	public async AddInternalManagers(): Promise<void> {
		try {
			this._logger.Activity("AddInternalManagers");

			this._serviceManager.AddService<SqlTransactionManager>("sqlTransactionManager", SqlTransactionManager);
			this._serviceManager.AddService<IEncrypterManager, EncrypterManager>("encrypterManager", EncrypterManager);
			this._serviceManager.AddService<ITokenManager, TokenManager>("tokenManager", TokenManager);
			this._serviceManager.AddService<IEmailManager, EmailManager>("emailManager", EmailManager);
			this._serviceManager.AddService<IEmailDataManager, EmailDataManager>("emailDataManager", EmailDataManager);
			this._serviceManager.AddService<IEmailTemplateManager, EmailTemplateManager>("emailTemplateManager", EmailTemplateManager);
			this._serviceManager.AddService<IFileManager, FileManager>("fileManager", FileManager);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddInternalManagers", err);
			throw err;
		}
	}

	/** Se agregan los manejadores de excepciones */
	public async AddExceptionManager(): Promise<void> {
		try {
			this._logger.Activity("AddExceptionHandlers");

			/** Agregamos el middleware para manejo de errores 
			* Debe ser el último de la lista siempre*/
			this._serviceManager.AddMiddleware(ErrorHandlerMiddleware);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddExceptionHandlers", err);
			throw err;
		}
	}

}