import ApplicationContext from "../Application/ApplicationContext";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
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
  constructor(message?: string, applicationContext?: ApplicationContext, path?: string, innerException?: Error) {
    const msg = message ? message : applicationContext ? applicationContext.translator.Translate("internal-error") : "";
    super(
      msg,
      HttpStatusName.InternalServerError,
      HttpStatusCode.InternalServerError,
      applicationContext?.requestID,
      path,
      innerException
    );
  }
}

/** Error a ejecutar cuando un registro no es encontrado, devuelve un objeto ApplicationException */
export class NotFoundException extends ApplicationException {
  constructor(applicationContext: ApplicationContext, path?: string, innerException?: Error) {
    super(
      applicationContext.translator.Translate("not-found"),
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
      applicationContext.translator.Translate("null-parameter-exception", [message]),
      HttpStatusName.NullParameterException,
      HttpStatusCode.BadRequest,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}

/** Cuando la request tiene algún error */
export class BadRequestException extends ApplicationException {
  constructor(message?: string, applicationContext?: ApplicationContext, path?: string, innerException?: Error) {
    const msg = message ? message : applicationContext ? applicationContext.translator.Translate("bad-request") : "";
    super(
      msg,
      HttpStatusName.BadRequest,
      HttpStatusCode.BadRequest,
      applicationContext?.requestID,
      path,
      innerException
    );
  }
}

/** Cuando un registro ya existe 
 * @param {Array} message - Recibe un array de dos posiciones strings
 * @param {ApplicationContext} applicationContext - Contexto de la aplicación
 * @param {string} path - Path desde donde ocurre el error
 * @param {Error} innerException - Error ocurrido ( si lo hay )
*/
export class RecordAlreadyExistsException extends ApplicationException {
  constructor(message: [string, string], applicationContext: ApplicationContext, path?: string, innerException?: Error) {
    super(
      applicationContext.translator.Translate("record-exists", [message[0], message[1]]),
      HttpStatusName.RecordAlreadyExists,
      HttpStatusCode.BadRequest,
      applicationContext.requestID,
      path,
      innerException
    );
  }
}