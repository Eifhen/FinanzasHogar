import { ErrorRequestHandler, NextFunction, RequestHandler, Response } from 'express';
import ApplicationRequest from '../../Application/ApplicationRequest';
import ApplicationException from '../../ErrorHandling/ApplicationException';




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

  

/** Todos los middlewares de la aplicación deben implementar esta interfaz */
export interface IApplicationMiddleware {

  // Función que retorna un función de tipo middleware
  Init() : MiddleWareFunction | Promise<MiddleWareFunction>;

  /** Middleware de intercepción */
  Intercept: ApplicationRequestHandler|ApplicationExceptionHandler;
}


/** Representa una función resolver de Awilix */
export type ApplicationResolver<T> = (serviceName: string) => T