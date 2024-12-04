import { CorsOptions } from "cors";
import { ErrorRequestHandler, RequestHandler } from "express";
import { Server } from "http";


/**
  Objeto de configuración del servidor web
  @param {MiddleWareFunction} middlewares - Arreglo de middlewares a ejecutar en la aplicación
  @param {CorsOption} cors - Objeto con la  configuración de Cors deseada
  @param {string} json_limit - Configuración de la respuesta JSON de la aplicación
*/
export interface WebServerBuildOptions {

  /** Arreglo de middlewares a ejecutar en la aplicación antes de instanciar los controladores */
  middlewares?: MiddleWareFunction[];

  /** Arreglo de middlewares a ejecutar en la aplicación después de instanciar los controladores */
  nextMiddlewares?: MiddleWareFunction[];
  
  /** Objeto con la  configuración de Cors deseada */
  cors?: CorsOptions;

  /** Configuración de la respuesta JSON de la aplicación */
  json_limit?: string;
}

/** Callback que retorna un Servidor HTTP */
export type WebServer = (port: number, callback?: () => void) =>  Server;

/** Función que representa un Middleware o RequestHandler de express */
export type MiddleWareFunction = RequestHandler | ErrorRequestHandler ;