import { NO_REQUEST_ID } from "../Utils/const";
import { EnvironmentStatus } from "../Utils/Environment";
import { HttpStatusCode, HttpStatusCodes, HttpStatusMessage, HttpStatusName, HttpStatusNames } from "../Utils/HttpCodes";
import IsNullOrEmpty from "../Utils/utils";



/** Esta clase representa una excepción de la aplicación  */
export default class ApplicationException extends Error {


  /** Nombre del error */
  public name: HttpStatusNames|string;

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


  constructor(message:string, name: HttpStatusNames|string, status: HttpStatusCodes, requestID?:string, path?:string, innerException?:Error){
    super(message);
    
    this.name = IsNullOrEmpty(name) ? HttpStatusName.InternalServerError : name;
    this.status = IsNullOrEmpty(status) ? HttpStatusCode.InternalServerError : status;
    this.message = IsNullOrEmpty(message) ? HttpStatusMessage.InternalServerError : message;
    this.path = IsNullOrEmpty(path) ? "" : path;
    this.requestID = IsNullOrEmpty(requestID) ? NO_REQUEST_ID : requestID;

    if(innerException){
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
      const error:any = {
        name: this.name,
        status: this.status,
        message: this.message,
        path: this.path,
        requestID: this.requestID,
        // innerException: this.stack,
      };

      // solo agregamos el stack en desarrollo
      if(process.env.NODE_ENV?.toUpperCase() === EnvironmentStatus.DEVELOPMENT){
        error.innerException = this.stack;
      }

      return error; 
    }
}