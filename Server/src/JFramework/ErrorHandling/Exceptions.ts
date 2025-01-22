import ApplicationContext from "../Application/ApplicationContext";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "./ApplicationException";


/** Error base, si el error ingresado es una instancia de ApplicationException 
 * utiliza esa instancia para llenar el error, del o contrario utiliza los 
 * datos pasados a BaseException*/
export class BaseException extends ApplicationException {

  /**
   * @param {string} name - Nombre de la excepción
   * @param {string} message - Mensaje de la excepción 
   * @param {ApplicationContext} applicationContext - Contexto de aplicación o requestId
   * @param {string} path - path del lugar donde ocurre la excepción 
   * @param {Error} error - Error ocurrido
   */
  constructor(name: string, message: string, applicationContext: ApplicationContext, path?: string, error?: any) {
    super(
      message,
      name,
      HttpStatusCode.InternalServerError,
      applicationContext.requestID,
      path,
      error
    );
  } 
}

/** Cuando ocurre un error interno  */
export class InternalServerException extends ApplicationException {
  constructor(message: string, applicationContext: ApplicationContext, path?: string, innerException?: Error) {
    super(
      message,
      HttpStatusName.InternalServerError,
      HttpStatusCode.InternalServerError,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

/** Error a ejecutar cuando un registro no es encontrado, devuelve un objeto ApplicationException */
export class NotFoundException extends ApplicationException {
  constructor(message: string, applicationContext: ApplicationContext, path?: string, innerException?: Error) {
    super(
      message,
      HttpStatusName.NotFound,
      HttpStatusCode.NotFound,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

/** Cuando se envia un parámetro que es requerido de forma nula */
export class NullParameterException extends ApplicationException {
  constructor(message: string, applicationContext: ApplicationContext, path?: string, innerException?: Error) {
    super(
      message,
      "NullParameterException",
      HttpStatusCode.BadRequest,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

/** Cuando la request tiene algún error */
export class BadRequestException extends ApplicationException {
  constructor(message: string, applicationContext: ApplicationContext, path?: string, innerException?: Error) {
    super(
      message,
      HttpStatusName.BadRequest,
      HttpStatusCode.BadRequest,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

