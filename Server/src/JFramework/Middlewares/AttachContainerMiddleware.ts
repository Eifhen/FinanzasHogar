import { Response, NextFunction } from "express";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "./Types/MiddlewareTypes";
import IContainerManager from "../_Internal/Interfaces/IContainerManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { AutoBind } from "../Decorators/AutoBind";
import ApplicationContext from "../Context/ApplicationContext";


interface AttachContainerMiddlewareDependencices {
	containerManager: IContainerManager;
	applicationContext: ApplicationContext;
}

/** Middleware para adjuntar un container por request */
export default class AttachContainerMiddleware extends ApplicationMiddleware {

	/** Manejador del contenedor de dependencias */
	private readonly _containerManager: IContainerManager;

	private readonly _applicationContext: ApplicationContext;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	constructor(deps: AttachContainerMiddlewareDependencices) {
		super();
		this._containerManager = deps.containerManager;
		this._applicationContext = deps.applicationContext;
		
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "MIDDLEWARE",
			entityName: "AttachContainerMiddleware",
			applicationContext: deps.applicationContext
		});
	}

	/** Intercepta la solicitud y realiza la operación */
	@AutoBind
	public Intercept(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("Intercept");

			// console.log("Attatch Container =>", this._containerManager !== undefined);

			const multiplier = 1000000;
			const random = Math.floor(Math.random() * multiplier);
			const scoped = this._containerManager.CreateScopedContainer();
			scoped._identifier = `CONTAINER_#${random}`;

			req.container = scoped;
			next();
		}
		catch(err:any){
			this._logger.Error("ERROR", "Intercept", err);
			next(err);
		}
	}

}