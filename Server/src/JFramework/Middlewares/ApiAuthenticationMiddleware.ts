import { NextFunction, Response } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { ApplicationRequestHandler, IApplicationMiddleware, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import ApplicationContext from "../Application/ApplicationContext";
import IsNullOrEmpty from "../Utils/utils";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { ApplicationPromise } from "../Application/ApplicationPromise";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import ServiceManager from "../Managers/ServiceManager";
import ITokenManager from "../Managers/Interfaces/ITokenManager";


/** Middleware de autenticación */
export default class ApiAuthenticationMiddleware implements IApplicationMiddleware {


  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Manejador de servicios */
  private _serviceManager: ServiceManager;

  constructor(serviceManager: ServiceManager){
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MIDDLEWARE,
      entityName: "ApiAuthenticationMiddleware"
    });

    this._serviceManager = serviceManager;
  }

  /** Agregar ApiContext */
  private AddApiContext = async (req: ApplicationRequest) => {
    const request_id = IsNullOrEmpty(req.requestID) ? NO_REQUEST_ID : req.requestID;
    const ipAddress = IsNullOrEmpty(req.ip) ? "" : req.ip!;
    
    try {
      const context = new ApplicationContext();
      context.requestID = request_id
      context.ipAddress = ipAddress

      this._serviceManager.AddInstance<ApplicationContext>("applicationContext", context);
    }
    catch(err:any){
      throw new ApplicationException(
        "ApiContext",
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        request_id,
        __filename
      );
    }
  }


  /** Middleware que intercepta la respuesta http para aplicar cambios a la solicitud */
  public Intercept:ApplicationRequestHandler = async (req: ApplicationRequest, res: Response, next:NextFunction) => {
    try {
      this._logger.Activity("Intercept");

      /** Token que ingresa en la solicitud */
      const token = req.headers.authorization;
      
      const tokenManager = this._serviceManager.Resolve<ITokenManager>("tokenManager");
      const userRepository = this._serviceManager.Resolve<IUsuariosSqlRepository>("usuariosRepository");
      
      const [err, data] = await userRepository.getAll();



      console.log("Data =>", data);

      
      /**
       Si se envía un usuario debe validarse, si el usuario enviado NO es 
       valido entonces se devuelve error.

       No todos los EndPoints requieren de authenticación.
      */

      /** Agregamos el contexto de aplicación */
      await this.AddApiContext(req);


      return next();

    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "Intercept", err);
      next(err);
    }
  }

  /** Inicialización del middleware  */
  public Init = (): MiddleWareFunction => {
    this._logger.Activity("Init");
    return this.Intercept;
  }
}
