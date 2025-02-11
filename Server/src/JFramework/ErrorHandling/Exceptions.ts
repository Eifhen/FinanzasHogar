import ApplicationContext from "../Application/ApplicationContext";
import { HttpStatusCode, HttpStatusName, HttpStatusNames } from "../Utils/HttpCodes";
import IsNullOrEmpty from "../Utils/utils";
import ApplicationException from "./ApplicationException";


/** Error base, si el error ingresado es una instancia de ApplicationException 
 * utiliza esa instancia para llenar el error, del o contrario utiliza los 
 * datos pasados a BaseException
 * @param {string} name - Nombre de la excepción
 * @param {string} message - Mensaje de la excepción 
 * @param {ApplicationContext} applicationContext - Contexto de aplicación o requestId
 * @param {string} path - path del lugar donde ocurre la excepción 
 * @param {Error} error - Error ocurrido
 * */
export class BaseException extends ApplicationException {
  constructor(
    methodName: string, 
    errorName:HttpStatusNames, 
    message: string, 
    applicationContext: ApplicationContext, 
    path?: string, 
    error?: any
  ) {
    super(
      methodName,
      errorName,
      message,
      HttpStatusCode.InternalServerError,
      applicationContext.requestID,
      path,
      error
    );
  }
}

/** Cuando ocurre un error interno  */
export class InternalServerException extends ApplicationException {
  constructor(
    methodName: string, 
    message?: string, 
    applicationContext?: ApplicationContext, 
    path?: string, 
    innerException?: Error
  ) {
    const errMsg = message ? message : applicationContext ? applicationContext.translator.Translate("internal-error") : "";
    super(
      methodName,
      HttpStatusName.InternalServerError,
      errMsg,
      HttpStatusCode.InternalServerError,
      applicationContext?.requestID,
      path,
      innerException
    );
  }
}

/** Error a ejecutar cuando un registro no es encontrado, devuelve un objeto ApplicationException */
export class NotFoundException extends ApplicationException {
  constructor(
    methodName:string, 
    value:string[], 
    applicationContext: ApplicationContext, 
    path?: string, 
    innerException?: Error
  ) {
    super(
      methodName,
      HttpStatusName.NotFound,
      applicationContext.translator.Translate("record-not-found", value),
      HttpStatusCode.NotFound,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

/** Cuando se envia un parámetro que es requerido de forma nula */
export class NullParameterException extends ApplicationException {
  constructor(
    methodName:string, 
    message: string, 
    applicationContext: ApplicationContext, 
    path?: string, 
    innerException?: Error
  ) {
    super(
      methodName,
      HttpStatusName.NullParameterException,
      applicationContext.translator.Translate("null-parameter-exception", [message]),
      HttpStatusCode.BadRequest,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

/** Cuando la request tiene algún error */
export class BadRequestException extends ApplicationException {
  constructor(
    methodName:string, 
    message?: string, 
    applicationContext?: ApplicationContext, 
    path?: string, 
    innerException?: Error
  ) {
    const msg = !IsNullOrEmpty(message) ? message! : applicationContext ? applicationContext.translator.Translate("bad-request") : "";
    super(
      methodName,
      HttpStatusName.BadRequest,
      msg,
      HttpStatusCode.BadRequest,
      applicationContext?.requestID,
      path,
      innerException
    );
  }
}

/** Cuando un registro ya existe 
 * @param {string}  methodName - Nombre del método
 * @param {Array} message - Recibe un array de dos posiciones strings
 * @param {ApplicationContext} applicationContext - Contexto de la aplicación
 * @param {string} path - Path desde donde ocurre el error
 * @param {Error} innerException - Error ocurrido ( si lo hay )
*/
export class RecordAlreadyExistsException extends ApplicationException {
  constructor(
    methodName:string, 
    message: [string, string], 
    applicationContext: ApplicationContext, 
    path?: string, 
    innerException?: Error
  ) {
    super(
      methodName,
      HttpStatusName.RecordAlreadyExists,
      applicationContext.translator.Translate("record-exists", [message[0], message[1]]),
      HttpStatusCode.BadRequest,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}