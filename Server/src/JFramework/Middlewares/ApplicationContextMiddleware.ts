import { NextFunction, Response, Request } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { IApplicationMiddleware, ApplicationRequestHandler, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ApplicationContext from "../Application/ApplicationContext";
import IsNullOrEmpty from "../Utils/utils";
import { NO_REQUEST_ID } from "../Utils/const";
import ServiceManager from "../Managers/ServiceManager";
import { ApplicationSQLDatabase } from "../../Infraestructure/DataBase";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";



/** Middleware que maneja el contexto de aplicación */
export default class ApplicationContextMiddleware implements IApplicationMiddleware {
  
  
  /** Instancia del serviceManager */
  private serviceManager: ServiceManager;

  constructor (services: ServiceManager) {
    this.serviceManager = services;
  }

  /**  Intercepta el request en curso y agrega funcionalidad */
  public Intercept: ApplicationRequestHandler = (req: ApplicationRequest, res: Response, next:NextFunction) : any => {

    const database = this.serviceManager.Resolve<ApplicationSQLDatabase>("database");
    const configurationSettings = this.serviceManager.Resolve<ConfigurationSettings>("configurationSettings");
    const context = new ApplicationContext({ database, configurationSettings});

    context.requestID = IsNullOrEmpty(req.requestID) ? NO_REQUEST_ID : req.requestID;
    context.ipAddress = IsNullOrEmpty(req.ip) ? "" : req.ip!;

    this.serviceManager.AddInstance<ApplicationContext>("applicationContext", context);
    return next();
  }

  /** Función que inicializa el middleware */
  public Init = (): MiddleWareFunction => {
    return this.Intercept;
  }

}