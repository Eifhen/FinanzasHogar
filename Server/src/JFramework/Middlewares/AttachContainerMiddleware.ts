import { Response, NextFunction } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { ApplicationMiddleware } from "./types/MiddlewareTypes";
import IContainerManager from "../_Internal/types/IContainerManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";



/** Middleware para adjuntar un container por request */
export default class AttachContainerMiddleware extends ApplicationMiddleware {

	/** Manejador del contenedor de dependencias */
	private readonly _containerManager: IContainerManager;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	constructor(containerManager: IContainerManager) {
		super();
		this._containerManager = containerManager;
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "MIDDLEWARE",
			entityName: "AttachContainerMiddleware"
		});
	}

	/** Intercepta la solicitud y realiza la operación */
	public Intercept(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("Intercept");
			req.containerManager = this._containerManager;
			next();
		}
		catch(err:any){
			this._logger.Error("ERROR", "Intercept", err);
			next(err);
		}
	}

}