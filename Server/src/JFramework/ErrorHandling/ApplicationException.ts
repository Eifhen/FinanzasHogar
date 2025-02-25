import { NO_REQUEST_ID } from "../Utils/const";
import { EnvironmentStatus } from "../Utils/Environment";
import { HttpStatusCode, HttpStatusCodes, HttpStatusMessage, HttpStatusName, HttpStatusNames } from "../Utils/HttpCodes";
import IsNullOrEmpty from "../Utils/utils";


interface ApplicationError {
  /** Id del request en curso */
  requestID: string;

  /** Nombre del error */
  errorName: string;

  /** Codigo del error */
  status: number;

  /** Mensaje de error */
  message: string;

  /** Detalle del error */
  details?: ApplicationDetails;
}

interface ApplicationDetails {
  /** Ubicación del error */
  path?: string;

  /** Stack del error */
  innerException?: string;

  /** Nombre del método que explotó */
  methodName?: string;

}

/** Esta clase representa una excepción de la aplicación  */
export default class ApplicationException extends Error {


  /** Nombre del error */
  public errorName: HttpStatusNames;

  /** Nombre del método donde ocurrio el error */
  public methodName?: string;

  /** Código de la excepción */
  public status: HttpStatusCodes;

  /** Mensaje de error de la excepción */
  public message: string;

  /** Ruta en la cual ocurrió el error */
  public path?: string;

  /** ID del request dónde ocurrió el error */
  public requestID?: string;

  /** Descripción completa del error */
  public stack?: string;


  constructor(
    methodName: string,
    errorName: HttpStatusNames,
    message: string,
    status: HttpStatusCodes,
    requestID?: string,
    path?: string,
    innerException?: Error
  ) {
    super(message);

    this.errorName = IsNullOrEmpty(errorName) ? HttpStatusName.InternalServerError : errorName;
    this.status = IsNullOrEmpty(status) ? HttpStatusCode.InternalServerError : status;
    this.message = IsNullOrEmpty(message) ? HttpStatusMessage.InternalServerError : message;
    this.path = IsNullOrEmpty(path) ? "" : path;
    this.requestID = IsNullOrEmpty(requestID) ? NO_REQUEST_ID : requestID;
    this.methodName = methodName;

    if (innerException) {
      this.stack = innerException?.stack;
    }

    /** 
      When an instance of a constructor is created via new, the value of new.target is set 
      to be a reference to the constructor function initially used to allocate the instance. 
      If a function is called rather than constructed via new, 
      new.target is set to undefined.

      new.target comes in handy when Object.setPrototypeOf or __proto__ needs 
      to be set in a class constructor. One such use case is inheriting 
      from Error in NodeJS v4 and higher. 
    */
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Sobrescribe el método toJSON para asegurar 
  que todas las propiedades sean serializables */
  toJSON() {
    const error: ApplicationError = {
      requestID: IsNullOrEmpty(this.requestID) ? NO_REQUEST_ID : this.requestID!,
      errorName: this.errorName,
      status: this.status,
      message: this.message,
      // details : {
      //   path: this.path ?? "",
      //   innerException: this.stack,
      //   methodName: this.methodName
      // }
    };

    // solo agregamos el stack en desarrollo
    if (process.env.NODE_ENV?.toUpperCase() === EnvironmentStatus.DEVELOPMENT) {
      error.details = {
        path: this.path ?? "",
        innerException: this.stack,
        methodName: this.methodName
      }
    }

    return error;
  }
}