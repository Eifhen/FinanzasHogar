

import ApplicationContext from "../ApplicationContext/ApplicationContext";
import { EnvironmentStatus } from "../Utils/Environment";
import { HttpStatusCodes } from "../Utils/HttpCodes";
import ApplicationException from "./ApplicationException";
import IErrorManager from "./Interfaces/IErrorManager";




interface ErrorManagerDependencies {
  context: ApplicationContext;
}

/**
  Esta clase está dedicada al manejo de errores de la aplicación
*/
export default class ErrorManager implements IErrorManager {

  /** Contexto de la aplicación */
  private _context: ApplicationContext;

  constructor(deps: ErrorManagerDependencies){
    this._context = deps.context;
  }

  /**  Retorna un objeto ApplicationException en base a la configuración ingresada */
  public GetException = (status:HttpStatusCodes, msg: string, path:string, innerException?: Error) : ApplicationException => {

    const exception = new ApplicationException(msg);

    exception.name = "ApplicationException";
    exception.status = status;
    
    // muestra el stack solo en desarrollo.
    if(this._context.environment === EnvironmentStatus.DEVELOPMENT){
      exception.path = path;
      exception.fullDescription = innerException && innerException.stack ? innerException.stack :  "";
    }

    return exception;
  } 


}