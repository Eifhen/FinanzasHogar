import {Request, Response, NextFunction, ErrorRequestHandler } from "express";
import ApplicationException from "./ApplicationException";
import { ApplicationMiddleware, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { HttpStatusCode } from "../Utils/HttpCodes";


/** Esta clase representa al middleware de manejo de errores de la aplicación */
export default class ErrorHandlerMiddleware implements ApplicationMiddleware {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor(){
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MIDDLEWARE,
      entityName: "ErrorHandlerMiddleware"
    });
  }

  /** Middleware que permite interceptar los errores de la aplicación */
  private Intercept = (error: ApplicationException, req: Request, res: Response, next:NextFunction) : any => {
    this._logger.Register("WARN", "Intercept", error);
    
    const status = error instanceof ApplicationException && error.status ? 
        error.status : HttpStatusCode.InternalServerError;

    return res.status(status).send(new ApplicationException(
      error.message,
      error.request_id,
      error.status ? error.status : HttpStatusCode.InternalServerError,
      error.path,
      error
    ));
  }

  /** Método que nos permite obtener el middleware de intercepción de errores */
  public Init = () : MiddleWareFunction => {
    return this.Intercept;
  }
}