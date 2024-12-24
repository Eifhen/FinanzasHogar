import {Request, Response, NextFunction, ErrorRequestHandler } from "express";
import ApplicationException from "./ApplicationException";
import { ApplicationMiddleware, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { HttpStatusCode } from "../Utils/HttpCodes";


/** Esta clase representa al middleware de manejo de errores de la aplicación */
export default class ErrorHandler implements ApplicationMiddleware {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor(){
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.HANDLER,
      entityName: "ErrorHandler"
    });
  }

  /** Middleware que permite interceptar los errores de la aplicación */
  private Intercept = (error: ApplicationException, req: Request, res: Response, next:NextFunction) : any => {
    this._logger.Register("WARN", "Intercept");
    const status = error instanceof ApplicationException && error.status ? error.status : HttpStatusCode.InternalServerError;
    return res.status(status).send(error);
  }

  /** Método que nos permite obtener el middleware de intercepción de errores */
  public Init = () : MiddleWareFunction => {
    return this.Intercept;
  }
}