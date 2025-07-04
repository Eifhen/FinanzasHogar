/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Response } from "express";
import ApplicationException from "./ApplicationException";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationErrorMiddleware } from "../Middlewares/Types/MiddlewareTypes";
import { AutoBind } from "../Helpers/Decorators/AutoBind";


/** Esta clase representa al middleware de manejo de errores de la aplicación */
export default class ErrorHandlerMiddleware implements ApplicationErrorMiddleware {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(){
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MIDDLEWARE,
			entityName: "ErrorHandlerMiddleware"
		});
	}

	/** Middleware que permite interceptar los errores de la aplicación */
	@AutoBind
	public Intercept (error: ApplicationException|Error, req: ApplicationRequest, res: Response, next:NextFunction) : any {
		this._logger.Register("WARN", "Intercept", error);
		
		const status = error instanceof ApplicationException && error.status ? error.status : HttpStatusCode.InternalServerError;

		if(error instanceof ApplicationException){
			return res.status(status).send(error);
		}
		
		return res.status(status).send(new ApplicationException(
			HttpStatusName.InternalServerError,
			HttpStatusName.InternalServerError,
			error.message,
			status,
			req.requestID,
			__filename,
			error
		));
	}

}