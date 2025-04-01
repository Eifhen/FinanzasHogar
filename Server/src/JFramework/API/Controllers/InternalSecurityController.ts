
import { GET, route } from "awilix-express";
import LoggerManager from "../../Managers/LoggerManager";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import Middlewares from "../../Helpers/Decorators/Middlewares";
import RateLimiterMiddleware from "../../Security/RateLimiter/RateLimiterMiddleware";
import ApplicationRequest from "../../Helpers/ApplicationRequest";
import { NextFunction, Response } from "express";
import { HttpStatusCode, HttpStatusMessage } from "../../Utils/HttpCodes";
import { ApplicationResponse } from "../../Helpers/ApplicationResponse";
import CsrfToken from "../../Helpers/DTOs/CsrfToken";
import ApplicationContext from "../../Configurations/ApplicationContext";
import IInternalSecurityService from "../Services/Interfaces/IInternalSecurityService";


interface InternalSecurityControllerDependencies {
	applicationContext: ApplicationContext;
	internalSecurityService: IInternalSecurityService;
}

@route("/security")
export default class InternalSecurityController {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Servicio manejador de cookies */
	private readonly _internalSecurityService: IInternalSecurityService;

	constructor(deps: InternalSecurityControllerDependencies) {

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "CONTROLLER",
			entityName: "InternalSecurityController"
		});

		/** Agregamos el contexto de applicación */
		this._applicationContext = deps.applicationContext;

		/** Agregamos el servicio manejador de cookies */
		this._internalSecurityService = deps.internalSecurityService;
	}


	/** Endpoint que permite obtener un token CSRF y lo añade a las cookies del usuario */
	@route("/csrf")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetCsrfProtection(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetCsrfToken");

			/** Creamos la data para CSRF */
			const data = await this._internalSecurityService.CreateCsrfProtection();

			/** Agregamos la cookie al objeto response */
			res.cookie(data.cookie.name, data.cookie.value, data.cookie.options);

			return res.status(HttpStatusCode.OK).send(
				new ApplicationResponse<CsrfToken>(
					this._applicationContext,
					HttpStatusMessage.Created,
					data.token
				)
			);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetCsrfToken", err);
			return next(err);
		}
	}

}