/* eslint-disable @typescript-eslint/no-magic-numbers */

import { GET, route } from "awilix-express";
import ApplicationContext from "../../Context/ApplicationContext";
import LoggerManager from "../../Managers/LoggerManager";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import Middlewares from "../../Decorators/Middlewares";
import RateLimiterMiddleware from "../../Security/RateLimiter/RateLimiterMiddleware";
import ApplicationRequest from "../../Helpers/ApplicationRequest";
import { NextFunction, Response } from "express";
import { HttpStatusCode, HttpStatusMessage } from "../../Utils/HttpCodes";
import ICookieManager from "../../Managers/Interfaces/ICookieManager";
import ITokenManager from "../../Managers/Interfaces/ITokenManager";
import { TimeUnitConverter } from "../../Utils/TimeUnitConverter";
import { ApplicationResponse } from "../../Helpers/ApplicationResponse";
import CsrfToken from "../../DTOs/CsrfToken";


interface InternalEndpointsControllerDependencies {
	applicationContext: ApplicationContext;
	cookieManager: ICookieManager;
	tokenManager: ITokenManager;
}

@route("/internal")
export default class InternalEndpointsController {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Manejador de cookies */
	private readonly _cookieManager: ICookieManager;

	/** Manejador de tokens */
	private readonly _tokenManager: ITokenManager;

	constructor(deps: InternalEndpointsControllerDependencies) {

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "CONTROLLER",
			entityName: "InternalEndpointsController"
		});

		/** Agregamos el contexto de applicación */
		this._applicationContext = deps.applicationContext;

		/** Agregamos el manejador de cookies */
		this._cookieManager = deps.cookieManager;

		/** Agregamos el manejador de tokens */
		this._tokenManager = deps.tokenManager;
	}


	/** Endpoint que permite obtener un token CSRF y lo añade a las cookies del usuario */
	@route("/")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetCsrfToken(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetCsrfToken");

			/** Generamos el token */
			const token = await this._tokenManager.GenerateToken();

			/** Representa el header de la cookie que va a leer el cliente */
			const csrfClientHeader = this._applicationContext.settings.apiData.headers.csrfTokenClientHeader;

			/** Creamos la cookie y la asignamos a la respuesta */
			this._cookieManager.Create(res, csrfClientHeader, token, {
				httpOnly: false, // se envia como false para que el cliente pueda leerla y enviarla
				signed: false,
				maxAge: TimeUnitConverter.ToMilliseconds(2, "hours")
			});

			/** Generamos el objeto de respuesta */
			const response = new ApplicationResponse<CsrfToken>(
				this._applicationContext,
				HttpStatusMessage.Updated, {
					token
				}
			);

			return res.status(HttpStatusCode.OK).send(response);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetCsrfToken", err);
			return next(err);
		}
	}


}