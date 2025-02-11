import { NextFunction, Response } from 'express';
import ApplicationRequest from '../Application/ApplicationRequest';
import { IApplicationMiddleware, ApplicationRequestHandler, MiddleWareFunction } from '../Configurations/types/ServerTypes';
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from '../Managers/Interfaces/ILoggerManager';
import LoggerManager from '../Managers/LoggerManager';
import IsNullOrEmpty from '../Utils/utils';
import ApplicationException from '../ErrorHandling/ApplicationException';
import { HttpStatusCode, HttpStatusName } from '../Utils/HttpCodes';
import { v4 as uuidv4 } from 'uuid';
import ApplicationContext from '../Application/ApplicationContext';
import ServiceManager from '../Managers/ServiceManager';
import ConfigurationSettings from '../Configurations/ConfigurationSettings';


interface ApiValidationMiddlewareDependencies {
  applicationContext : ApplicationContext
}

/** Middleware para manejo de la validación del api */
export default class ApiValidationMiddleware implements IApplicationMiddleware {

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Manejador de servicios */
  private readonly _serviceManager: ServiceManager;

  /** Contexto de applicación */
  private readonly _applicationContext: ApplicationContext;


  constructor(services: ServiceManager, applicationContext: ApplicationContext){

    this._serviceManager = services;
    this._applicationContext = applicationContext;

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MIDDLEWARE,
      entityName: "ApiValidationMiddleware"
    });
  }

  /** Intercepta el request en curso y agrega funcionalidad */
  public Intercept:ApplicationRequestHandler = async (req: ApplicationRequest, res: Response, next: NextFunction) : Promise<any> => {
    try {
      this._logger.Activity("Intercept");
      const configurationSettings = this._applicationContext.settings;
      
      /** Data de aplicación */
      const apiData = configurationSettings.apiData;
      
      /** ApiKey recibida en la request */
      const incomingApiKey = req.headers[apiData.headers.apiKeyHeader];
     
      /** Creamos un nuevo RequestID */
      const request_id = uuidv4().slice(0, 8);

      /** Validamos si el ApiKey está definido en el contexto o 
       * si el ApiKey no fue ingresado en la request */
      if(IsNullOrEmpty(apiData.apiKey) || IsNullOrEmpty(incomingApiKey)){
        throw new ApplicationException(
          "ApiValidationMiddleware",
          HttpStatusName.InternalServerError,
          this._applicationContext.translator.Translate("apikey-no-definido"),
          HttpStatusCode.InternalServerError,
          request_id,
          __filename
        );
      }

      /** Validamos que el ApiKey definido en el context y 
       * el ApiKey ingresado en la request concuerden */
      if(apiData.apiKey !== incomingApiKey){
        const invalidKey = Array.isArray(incomingApiKey) ? incomingApiKey : [incomingApiKey ? incomingApiKey : ""] ;
        throw new ApplicationException(
          "ApiValidationMiddleware",
          HttpStatusName.BadRequest,
          this._applicationContext.translator.Translate("apikey-invalido", invalidKey),
          HttpStatusCode.BadRequest,
          request_id,
          __filename
        );
      }

      /** Agregamos el ApiKey al contexto */
      this._applicationContext.requestID = request_id;

      /** Agregamos el ApiKey a la request */
      req.requestID = request_id;

      return next();
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "Intercept", err);
      next(err);
    }
  }

  /** Función que inicializa el middleware */
  public Init = (): MiddleWareFunction => {
    this._logger.Activity("Init");
    return this.Intercept;
  }

}