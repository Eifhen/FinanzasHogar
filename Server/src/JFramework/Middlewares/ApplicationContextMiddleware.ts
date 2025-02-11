import { NextFunction, Response, Request } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { IApplicationMiddleware, ApplicationRequestHandler, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ApplicationContext from "../Application/ApplicationContext";
import IsNullOrEmpty from "../Utils/utils";
import { NO_REQUEST_ID } from "../Utils/const";
import ServiceManager from "../Managers/ServiceManager";
import { ApplicationSQLDatabase } from "../../Infraestructure/DataBase";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import { ApplicationLenguage, ApplicationLenguages } from "../Application/types/types";
import { ITranslatorHandler } from "../Translations/Interfaces/ITranslatorHandler";
import TranslatorHandler from "../Translations/TranslatorHandler";



/** Middleware que maneja el contexto de aplicación */
export default class ApplicationContextMiddleware implements IApplicationMiddleware {
  
  
  /** Instancia del serviceManager */
  private serviceManager: ServiceManager;
  private _callback?: (context:ApplicationContext) => void;

  constructor (services: ServiceManager, callback?:(context:ApplicationContext)=> void) {
    this.serviceManager = services;
    if(callback){
      this._callback = callback;
    }
  }

  /** Obtiene la configuración de idioma de la requeste en curso */
  private GetLenguageConfig = (req: ApplicationRequest, settings: ConfigurationSettings) => {
    if(IsNullOrEmpty(req.headers[settings.apiData.headers.langHeader])){
      return ApplicationLenguages.en
    }
    else {
      return req.headers[settings.apiData.headers.langHeader] as ApplicationLenguage ;
    }
  }

  /**  Intercepta el request en curso y agrega funcionalidad */
  public Intercept: ApplicationRequestHandler = (req: ApplicationRequest, res: Response, next:NextFunction) : any => {

    // const database = this.serviceManager.Resolve<ApplicationSQLDatabase>("database");
    const configurationSettings = this.serviceManager.Resolve<ConfigurationSettings>("configurationSettings");
    const applicationContext = this.serviceManager.Resolve<ApplicationContext>("applicationContext");

    applicationContext.settings = configurationSettings;

    /** Seteamos la configuración de idioma al contexto */
    applicationContext.lang = this.GetLenguageConfig(req, configurationSettings);
    
    /** Agregamos la ip actual */
    applicationContext.ipAddress = IsNullOrEmpty(req.ip) ? "" : req.ip!;

    /** Agregamos el request Id */
    // applicationContext.requestID = IsNullOrEmpty(req.requestID) ? NO_REQUEST_ID : req.requestID;

    this.serviceManager.AddInstance<ApplicationContext>("applicationContext", applicationContext);
    
    if(this._callback){
      this._callback(applicationContext);
    }

    return next();
  }

  /** Función que inicializa el middleware */
  public Init = (): MiddleWareFunction => {
    return this.Intercept;
  }

}