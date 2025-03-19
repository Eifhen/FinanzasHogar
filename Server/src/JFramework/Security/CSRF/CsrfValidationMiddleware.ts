import { Response, NextFunction } from "express";
import ApplicationRequest from "../../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "../../Middlewares/Types/MiddlewareTypes";
import ILoggerManager, { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import ApplicationContext from "../../Context/ApplicationContext";
import { HttpAllowedMethods, HttpAllowedReadMethods, HttpAllowedWriteMethods } from "../../Utils/HttpCodes";
import { BadRequestException, InternalServerException } from "../../ErrorHandling/Exceptions";
import IsNullOrEmpty from "../../Utils/utils";



export default class CsrfValidationMiddleware extends ApplicationMiddleware {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	constructor() {
		super();

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MIDDLEWARE,
			entityName: "CsrfValidationMiddleware"
		});
	}

	/** Valida el token CSRF que envia el usuario tanto en el header como en las cookies */
	public async Intercept(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
		try {
			this._logger.Activity("Intercept");

			/** Obtenemos el contexto de aplicación */
			const applicationContext = req.container.Resolve<ApplicationContext>("applicationContext");
			
			/** Representa el  header de la cookie que si es httpOnly */

			/** ESTO es el nombre de la COOKIE, puedo agregar un objeto COOKIES en al 
			 * configuración para almacenar nombres de cookies */
			const csrfHeader = applicationContext.settings.apiData.headers.csrfTokenHeader;

			/** Representa el header de la cookie que va a leer el cliente (la que no es httpOnly)*/
			const csrfClientHeader = applicationContext.settings.apiData.headers.csrfTokenClientHeader;

			/** Validamos que el verbo del request sea un verbo permitido */
			if (!Object.values(HttpAllowedMethods).includes(req.method as HttpAllowedMethods)) {
				throw new BadRequestException("Intercept", "invalid-verb", applicationContext, __filename);
			}

			/** Para métodos de lectura, si el token no existe envia un error */
			if (Object.values(HttpAllowedReadMethods).includes(req.method as HttpAllowedReadMethods)){

				/** Verificamos la existencia del token en la cookie */
				const token = req.cookies[csrfClientHeader];
				if(IsNullOrEmpty(token)){
					throw new BadRequestException("Intercept", "csrf-token-doesnt-exists", applicationContext, __filename);
				}

				/** Si todo va bien continua */
				return next();
			}

 			/** Para métodos modificadores, leemos el token de la cookie y del encabezado */
			if(Object.values(HttpAllowedWriteMethods).includes(req.method as HttpAllowedWriteMethods)){
				/** Obtenemos el token en la cookie */
				const tokenFromCookie = req.cookies[csrfClientHeader];
	
				/** Obtenemos el token en el header */
				const tokenFromHeader = req.get(csrfHeader) 
	
				/** El token que está en la cookie y el token que está en el header deben ser iguales,
				 *  Si alguno de ellos no existe o no coinciden, se lanza un error. */
				if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
					throw new BadRequestException("Intercept", "invalid-csrf-token", applicationContext, __filename);
				}
	
				/** Si todo va bien entonces continuamos */
				return next();
			}

			/** Lanza error si por alguna razón las demás condiciones son las demas condiciones no se cumplen */
			throw new InternalServerException("Intercept", "out-of-range", applicationContext, __filename);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Intercept", err);
			next(err);
		}
	}
}