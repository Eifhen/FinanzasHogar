import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import ApplicationRequest from "../../Application/ApplicationRequest";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { Constructor } from "awilix";



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

  /** Propiedad estática que marca a la clase como middleware. */
  static __middleware = true;

  /** Función que retorna un función de tipo middleware */
  abstract Init: () => MiddleWareFunction | Promise<MiddleWareFunction>;

  /** Middleware de intercepción de solicitudes*/
  abstract Intercept: ApplicationRequestHandler;

}

/** Todos los middlewares de manejo de errores de 
 * la aplicación deben implementar esta clase abstracta */
export abstract class ApplicationErrorMiddleware {
  /** Propiedad estática que marca a la clase como middleware. */
  static __middleware = true;

  /** Función que retorna un función de tipo middleware */
  abstract Init: () => MiddleWareFunction | Promise<MiddleWareFunction>;

  /** Middleware de intercepción de solicitudes de error */
  abstract Intercept: ApplicationExceptionHandler;
}


/** Indica si la función ingresada es una instancia de ApplicationMiddleware 
 * para eso se evalua si al convertir una función a string si esta tiene la palabra clase
 * en su definición y se evalua que la función tenga definida la propiedad estatica __middleware
*/
export function isApplicationMiddleware(fn: any): fn is Constructor<ApplicationMiddleware> {
  return (typeof fn === "function" && /^class\s/.test(fn.toString()) && (fn.__middleware === true));
}



