import { NextFunction, Response } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { ApplicationRequestHandler, IApplicationMiddleware, MiddleWareFunction } from "../Configurations/types/ServerTypes";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
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


  /** Middleware que intercepta la respuesta http para aplicar cambios a la solicitud */
  public Intercept:ApplicationRequestHandler = async (req: ApplicationRequest, res: Response, next:NextFunction) => {
    try {
      this._logger.Activity("Intercept");

      /** Token que ingresa en la solicitud */
      const token = req.headers.authorization;
      
      const tokenManager = this._serviceManager.Resolve<ITokenManager>("tokenManager");
      const userRepository = this._serviceManager.Resolve<IUsuariosSqlRepository>("usuariosRepository");
      
      const [err, data] = await userRepository.getAll();

      
      /**
       Si se envía un usuario debe validarse, si el usuario enviado NO es 
       valido entonces se devuelve error.

       No todos los EndPoints requieren de authenticación.
      */
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
