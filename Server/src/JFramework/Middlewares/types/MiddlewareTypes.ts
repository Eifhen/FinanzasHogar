/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import ApplicationRequest from "../../Application/ApplicationRequest";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { ClassConstructor } from "../../Utils/types/CommonTypes";



/** Representa un request de la aplicación */
export type ApplicationRequestHandler = ((req: ApplicationRequest, res: Response, next: NextFunction) => any);

/** Representa un request con error */
export type ApplicationExceptionHandler = ((error: ApplicationException, req: ApplicationRequest, res: Response, next: NextFunction) => any);

/** Función que representa un Middleware o RequestHandler de express */
export type MiddleWareFunction =
	| RequestHandler
	| ErrorRequestHandler
	| ApplicationRequestHandler
	| ApplicationExceptionHandler;



/** Todos los middlewares de la aplicación 
 * deben implementar esta clase abstracta */
export abstract class ApplicationMiddleware {

	/** Propiedad estática que marca a la clase como middleware.
	* recordar que las propiedades estaticas 
	* se agregan al constructor de la clase */
	static __middleware = true;

	/** Middleware de intercepción de solicitudes. 
	 * Es necesario siempre hacer un binding de esta implementación*/
	abstract Intercept(req: ApplicationRequest, res: Response, next: NextFunction): any;

}

/** Todos los middlewares de manejo de errores de 
 * la aplicación deben implementar esta clase abstracta */
export abstract class ApplicationErrorMiddleware {
	/** Propiedad estática que marca a la clase como middleware.
	 * recordar que las propiedades estaticas 
	 * se agregan al constructor de la clase */
	static __middleware = true;

	/** Middleware de intercepción de solicitudes de error.
	 * Es necesario siempre hacer un binding de esta implementación*/
	abstract Intercept(error: ApplicationException, req: ApplicationRequest, res: Response, next: NextFunction): any;
}


/** Indica si la función ingresada es una instancia de ApplicationMiddleware 
 * para eso se evalua si al convertir una función a string si esta tiene la palabra clase
 * en su definición y se evalua que la función tenga definida la propiedad estatica __middleware
*/
export function isMiddleware(fn: any): fn is ClassConstructor<ApplicationMiddleware> {
	return (typeof fn === "function" && /^class\s/.test(fn.toString()) && (fn.__middleware === true));
}


