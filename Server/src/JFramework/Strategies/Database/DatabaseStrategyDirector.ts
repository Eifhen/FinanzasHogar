import IDataBaseConnectionStrategy from './IDataBaseConnectionStrategy';
import ApplicationException from '../../ErrorHandling/ApplicationException';
import { HttpStatusCode, HttpStatusName } from '../../Utils/HttpCodes';
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from '../../Managers/LoggerManager';
import ApplicationContext from '../../Application/ApplicationContext';
import { ClassInstance } from '../../Utils/types/CommonTypes';


interface IDatabaseManagerDependencies<C, I> {
	strategy: IDataBaseConnectionStrategy<C, I>;
	applicationContext: ApplicationContext;
}

/** Implementa la estrategia de base de datos */
export default class DatabaseStrategyDirector<ConnectionType, InstanceType> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Instancia de la estrategia de conección a utilizar */
	private readonly _strategy: IDataBaseConnectionStrategy<ConnectionType, InstanceType>;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: IDatabaseManagerDependencies<ConnectionType, InstanceType>) {
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.DIRECTOR,
			applicationContext: deps.applicationContext,
			entityName: "DatabaseManager"
		});

		this._strategy = deps.strategy;
		this._applicationContext = deps.applicationContext;
	}

	/** Realiza la connección a la base de datos */
	public async Connect(): Promise<ConnectionType>{
		try {
			this._logger.Activity("Connect");
			return await this._strategy.Connect();
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "Connect");
			if (err instanceof ApplicationException) {
				throw err;
			}

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
	}

	/** Obtiene la instancia de la base de datos */
	public GetInstance(): ClassInstance<InstanceType> {
		try {
			this._logger.Activity("GetInstance");
			return this._strategy.GetInstance();
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "GetInstance");

			if (err instanceof ApplicationException) {
				throw err;
			}

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
	}

	/** Método que permite cerrar la conección SQL */
	public async CloseConnection() : Promise<void> {
		try {
			this._logger.Activity("CloseConnection");
			await this._strategy.CloseConnection();
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.FATAL, "CloseConnection");

			if (err instanceof ApplicationException) {
				throw err;
			}

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
	};

}