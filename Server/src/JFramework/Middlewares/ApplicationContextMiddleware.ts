import { NextFunction, Response, Request } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { IApplicationMiddleware, ApplicationRequestHandler, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ApplicationContext from "../Application/ApplicationContext";
import IsNullOrEmpty from "../Utils/utils";
import { NO_REQUEST_ID } from "../Utils/const";



/** Middleware que maneja el contexto de aplicación */
export default class ApplicationContextMiddleware implements IApplicationMiddleware {
  
  /** Función que permite agregar una instancia al controlador */
  private _AddInstance: (implementation:ApplicationContext) => void;

  constructor (callback: (implementation:ApplicationContext) => void) {
    this._AddInstance = callback;
  }

  /**  Intercepta el request en curso y agrega funcionalidad */
  public Intercept: ApplicationRequestHandler = (req: ApplicationRequest, res: Response, next:NextFunction) : any => {

    const context = new ApplicationContext();

    context.requestID = IsNullOrEmpty(req.requestID) ? NO_REQUEST_ID : req.requestID;
    context.ipAddress = IsNullOrEmpty(req.ip) ? "" : req.ip!;

    this._AddInstance(context);
    return next();
  }

  /** Función que inicializa el middleware */
  public Init = (): MiddleWareFunction => {
    return this.Intercept;
  }

}