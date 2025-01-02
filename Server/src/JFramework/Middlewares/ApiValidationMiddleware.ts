import { NextFunction, Response } from 'express';
import ApplicationRequest from '../Application/ApplicationRequest';
import { IApplicationMiddleware, ApplicationRequestHandler, MiddleWareFunction } from '../Configurations/types/ServerTypes';
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from '../Managers/Interfaces/ILoggerManager';
import LoggerManager from '../Managers/LoggerManager';
import IsNullOrEmpty from '../Utils/utils';
import ApplicationException from '../ErrorHandling/ApplicationException';
import { HttpStatusCode, HttpStatusName } from '../Utils/HttpCodes';
import { v4 as uuidv4 } from 'uuid';


/** Middleware para manejo de la validación del api */
export default class ApiValidationMiddleware implements IApplicationMiddleware {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Contiene el nombre del header que contiene el api key en el request en curso */
  private readonly headerName = process.env.API_KEY_HEADER ?? "";

  private readonly apiKey = process.env.API_KEY ?? "";

  constructor(){
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
      
      const key = req.headers[this.headerName];
      const request_id = uuidv4().slice(0, 8);

      if(IsNullOrEmpty(this.apiKey) || IsNullOrEmpty(key)){
        throw new ApplicationException(
          "ApiKey no definido",
          HttpStatusName.InternalServerError,
          HttpStatusCode.InternalServerError,
          request_id,
          __filename
        );
      }

      if(this.apiKey !== key){
        throw new ApplicationException(
          "ApiKey invalido",
          HttpStatusName.BadRequest,
          HttpStatusCode.BadRequest,
          request_id,
          __filename
        );
      }

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