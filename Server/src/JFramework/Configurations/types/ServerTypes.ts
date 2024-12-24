import { ErrorRequestHandler, RequestHandler, } from 'express';

/** Función que representa un Middleware o RequestHandler de express */
export type MiddleWareFunction = RequestHandler | ErrorRequestHandler ;

/** Todos los middlewares de la aplicación deben implementar esta interfaz */
export interface ApplicationMiddleware {

  // Función que retorna un función de tipo middleware
  Init() : MiddleWareFunction;
}