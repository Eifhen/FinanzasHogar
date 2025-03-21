
import { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NextFunction, Response, Request } from "express";
import { Limiters } from "./Limiters";
import { RateLimitRequestHandler } from "express-rate-limit";
import { ErrorMessageData, InternalServerException } from "../../ErrorHandling/Exceptions";
import ApplicationContext from "../../Configurations/ApplicationContext";


// Define una interfaz base para las dependencias comunes
interface CommonDependencies {
	applicationContext: ApplicationContext;
}

/**
 * Utiliza un tipo mapeado para extender la interfaz base con 
 * los limitadores específicos. Esto se hace ya que en un principio
 * no conocemos cual es el nombre del limiter que el usuario desea ejecutar
 * por eso el LimiterName extiende de Limiters por eso cualquiera sea el limiter
 * deseado, este se obtendrá del contenedor de dependencias y se 
 * inyectará en el middleware mediante el `inject()`  
*/
type RateLimiterDependencies<LimiterName extends Limiters> =
	CommonDependencies &
	Record<LimiterName, RateLimitRequestHandler>;

/** 
 * @param {string} limiterName - Nombre del limiter a ejecutar
 * @description 
 * Devuelve una función que recibe las dependencias y 
 * devuelve el RateLimiter ingresado. El tipo de 
 * RateLimiter a ejecutar se define dinámicamente sacandolo del 
 * contenedor de dependencias dependiendo del nombre ingresado. */
export default function RateLimiterMiddleware<LimiterName extends Limiters>(limiterName: LimiterName) {

	return function RateLimiterMiddleware(deps: RateLimiterDependencies<LimiterName>) {
		/** Logger */
		const logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MIDDLEWARE,
			entityName: "RateLimiter",
			applicationContext: deps.applicationContext
		});

		try {
			logger.Activity();

			/** Obtenemos el limiter */
			const rateLimiter: RateLimitRequestHandler = deps[limiterName];

			if (typeof rateLimiter !== "function") {

				const messageData: ErrorMessageData = {
					message: "rate-limiter-invalid",
					args: [limiterName]
				};

				throw new InternalServerException(
					"RateLimiter",
					messageData,
					deps.applicationContext,
					__filename,
				)
			}

			return rateLimiter;
		}
		catch (err: any) {
			/** Si ocurre un error, lo loggeamos y simplemente devolvemos 
			 * un middleware que llame a next y le pasamos el error, 
			 * esto automáticamente hará que nuestro 
			 * middleware de manejo de errores se ejecute*/
			logger.Error("ERROR", "RateLimiter", err);
			return (req: Request, res: Response, next: NextFunction) => {
				next(err);
			}
		}
	}
}