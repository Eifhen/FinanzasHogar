import {  POST, route } from "awilix-express";
import { NextFunction, Response } from "express";
import ApplicationRequest from "../../JFramework/Helpers/ApplicationRequest";
import IAuthenticationService from "../../Application/Services/Interfaces/IAuthenticationService";
import ApplicationArgs from "../../JFramework/Helpers/ApplicationArgs";
import { HttpStatusCode } from "../../JFramework/Utils/HttpCodes";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import SignUpDTO from "../../Application/DTOs/SignUpDTO";
import SignInDTO from "../../Application/DTOs/SignInDTO";
import RateLimiterMiddleware from "../../JFramework/Security/RateLimiter/RateLimiterMiddleware";
import Middlewares from "../../JFramework/Decorators/Middlewares";




interface IAuthenticationDependencies {
	authenticationService: IAuthenticationService;
	applicationContext: ApplicationContext
}



@route("/auth")
export default class AuthenticationController {

	/** Instancia del Servicio de autenticación de usuario */
	private authenticationService: IAuthenticationService;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;


	constructor(deps: IAuthenticationDependencies){
		this.authenticationService = deps.authenticationService;
		this._applicationContext = deps.applicationContext;

		this._logger = new LoggerManager({
			entityName: "AuthenticationController",
			entityCategory: LoggEntityCategorys.CONTROLLER,
			applicationContext: this._applicationContext,
		});

	}

 
	/** EndPoint que se encarga del registro del usuario en la aplicación */
	@route("/sign-up")
	@POST()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async SignUp(req: ApplicationRequest, res: Response, next: NextFunction){
		try {
			this._logger.Activity("SignUp");
			const args = new ApplicationArgs<SignUpDTO>(req);
			const result = await this.authenticationService.SignUp(args);
			return res.status(HttpStatusCode.OK).send(result);
		}
		catch(err:any){
			this._logger.Error(LoggerTypes.ERROR, "SignUp", err);
			return next(err);
		}
	}

	/** EndPoint que se encarga del inicio de sesión a la aplicación */
	@route("/sign-in")
	@POST()
	@Middlewares([RateLimiterMiddleware("authLimiter")])
	public async SignIn (req: ApplicationRequest, res: Response, next: NextFunction){
		try {
			this._logger.Activity("SignIn");
			const args = new ApplicationArgs<SignInDTO>(req);
			const result = await this.authenticationService.SignIn(args);
			return res.status(HttpStatusCode.OK).send(result);
		}
		catch(err:any){
			this._logger.Error(LoggerTypes.ERROR, "SignIn", err);
			return next(err);
		}
	}
}