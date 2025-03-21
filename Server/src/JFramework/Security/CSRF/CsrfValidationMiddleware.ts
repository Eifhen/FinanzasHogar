import { Response, NextFunction } from "express";
import ApplicationRequest from "../../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "../../Middlewares/Types/MiddlewareTypes";
import ILoggerManager, { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { HttpAllowedMethods, HttpAllowedReadMethods, HttpAllowedWriteMethods } from "../../Utils/HttpCodes";
import { BadRequestException, InternalServerException } from "../../ErrorHandling/Exceptions";
import IsNullOrEmpty from "../../Utils/utils";
import { AutoClassBinder } from "../../Helpers/Decorators/AutoBind";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ApplicationContext from "../../Configurations/ApplicationContext";


interface ICsrfValidationMiddlewareDependencies {
	applicationContext: ApplicationContext;
}

@AutoClassBinder
export default class CsrfValidationMiddleware extends ApplicationMiddleware {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Representa el contexto de la aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: ICsrfValidationMiddlewareDependencies) {
		super();

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MIDDLEWARE,
			entityName: "CsrfValidationMiddleware"
		});

		/** Contexto de aplicación */
		this._applicationContext = deps.applicationContext;
	}

	/** Valida el token CSRF que envia el usuario tanto en el header como en las cookies */
	public async Intercept(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
		try {
			this._logger.Activity("Intercept");

			/** Nombre del header donde se espera que exista el token csrf */
			const csrfTokenHeaderName = this._applicationContext.settings.apiData.headers.csrfTokenHeader;

			/** Nombre de la cookie donde se espera que exista el token csrf */
			const csrfTokenCookieData = this._applicationContext.settings.apiData.cookieData.csrfTokenCookie;

			/** Validamos que el verbo del request sea un verbo permitido */
			if (!Object.values(HttpAllowedMethods).includes(req.method as HttpAllowedMethods)) {
				throw new BadRequestException("Intercept", "invalid-verb", this._applicationContext, __filename);
			}

			/** Para métodos de lectura, si el token no existe envia un error */
			if (Object.values(HttpAllowedReadMethods).includes(req.method as HttpAllowedReadMethods)){

				/** Verificamos la existencia del token en la cookie */
				const token = req.cookies[csrfTokenCookieData.name];

				if(IsNullOrEmpty(token)){
					throw new BadRequestException("Intercept", "csrf-token-doesnt-exists", this._applicationContext, __filename);
				}

				/** Si todo va bien continua */
				return next();
			}

 			/** Para métodos modificadores, leemos el token de la cookie y del encabezado */
			if(Object.values(HttpAllowedWriteMethods).includes(req.method as HttpAllowedWriteMethods)){
				/** Obtenemos el token en la cookie */
				const tokenFromCookie = req.cookies[csrfTokenCookieData.name];
	
				/** Obtenemos el token en el header */
				const tokenFromHeader = req.get(csrfTokenHeaderName) 
				
				/** Verifica que el token exista tanto en la cookie como en el header */
				if(IsNullOrEmpty(tokenFromCookie) || IsNullOrEmpty(tokenFromHeader)){
					throw new BadRequestException("Intercept", "csrf-token-doesnt-exists", this._applicationContext, __filename);
				}

				/** El token que está en la cookie y el token que está en el header deben ser iguales,
				 *  Si alguno de ellos no existe o no coinciden, se lanza un error. */
				if (tokenFromCookie !== tokenFromHeader) {
					throw new BadRequestException("Intercept", "invalid-csrf-token", this._applicationContext, __filename);
				}
	
				/** Si todo va bien entonces continuamos */
				return next();
			}

			/** Lanza error si por alguna razón las demás condiciones son las demas condiciones no se cumplen */
			throw new InternalServerException("Intercept", "out-of-range", this._applicationContext, __filename);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Intercept", err);

			if(err instanceof ApplicationException){
				next(err);
			}

			next(new InternalServerException("Intercept", "csrf-error", this._applicationContext, __filename, err));
		}
	}
}