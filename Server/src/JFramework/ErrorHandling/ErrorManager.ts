

import ApplicationContext from "../Application/ApplicationContext";
import { EnvironmentStatus } from "../Utils/Environment";
import { HttpStatusCodes, HttpStatusNames } from "../Utils/HttpCodes";
import ApplicationException from "./ApplicationException";
import IErrorManager from "./Interfaces/IErrorManager";




interface ErrorManagerDependencies {
  applicationContext: ApplicationContext;
}

/**
  Esta clase está dedicada al manejo de errores de la aplicación
*/
export default class ErrorManager implements IErrorManager {

  /** Contexto de la aplicación */
  private _applicationContext: ApplicationContext;

  constructor(deps: ErrorManagerDependencies) {
    this._applicationContext = deps.applicationContext;
  }

  /**  Retorna un objeto ApplicationException en base a la configuración ingresada */
  public GetException = (name: HttpStatusNames, status: HttpStatusCodes, msg: string, path: string, innerException?: Error): ApplicationException => {

    const exception = new ApplicationException(msg, name, status);

    // muestra el stack solo en desarrollo.
    if (this._applicationContext.environment === EnvironmentStatus.DEVELOPMENT) {
      exception.path = path;
      exception.innerException = innerException?.stack;
    }

    return exception;
  }


}