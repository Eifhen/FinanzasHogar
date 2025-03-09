import ApplicationContext from "../Context/ApplicationContext";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "./ApplicationException";
import { EN } from '../Translations/en_US';

export type ErrorMessageData = {
	message: keyof typeof EN;
	args?: (string | number)[]
}

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
		errorName: HttpStatusName,
		messageData: string | ErrorMessageData,
		applicationContext: ApplicationContext,
		path?: string,
		error?: any
	) {

		super(
			methodName,
			errorName,
			"",
			HttpStatusCode.InternalServerError,
			applicationContext.requestID,
			path,
			error
		);

		this.message = this.GetErrorMessage(messageData, applicationContext, "internal-error");
	}
}

/** Cuando ocurre un error interno  */
export class InternalServerException extends ApplicationException {
	constructor(
		methodName: string,
		messageData: string | ErrorMessageData,
		applicationContext?: ApplicationContext,
		path?: string,
		innerException?: Error,
	) {

		super(
			methodName,
			HttpStatusName.InternalServerError,
			"",
			HttpStatusCode.InternalServerError,
			applicationContext?.requestID,
			path,
			innerException
		);

		this.message = this.GetErrorMessage(messageData, applicationContext, "internal-error");

	}
}

/** Error que indica que se ejecutaron demasiadas solicitudes */
export class TooManyRequestsException extends ApplicationException {
	constructor(
		methodName: string,
		messageData: ErrorMessageData,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error,
	) {

		super(
			methodName,
			HttpStatusName.TooManyRequests,
			applicationContext.translator.Translate(messageData.message, messageData.args),
			HttpStatusCode.TooManyRequests,
			applicationContext?.requestID,
			path,
			innerException
		)
	}
}

/** Error a ejecutar cuando un registro no es encontrado, devuelve un objeto ApplicationException */
export class NotFoundException extends ApplicationException {
	constructor(
		methodName: string,
		value: string[],
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
		methodName: string,
		parameterName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.NullParameterException,
			applicationContext.translator.Translate("null-parameter-exception", [parameterName]),
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
		methodName: string,
		messageData?: string | ErrorMessageData,
		applicationContext?: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.BadRequest,
			"",
			HttpStatusCode.BadRequest,
			applicationContext?.requestID,
			path,
			innerException
		);

		this.message = this.GetErrorMessage(messageData, applicationContext, "bad-request");

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
		methodName: string,
		message: [string, string],
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.RecordAlreadyExists,
			applicationContext.translator.Translate("record-exists", message),
			HttpStatusCode.BadRequest,
			applicationContext.requestID,
			path,
			innerException
		);
	}
}

/** Error que indica que hay un problema de conección a la base de datos */
export class DatabaseConnectionException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseConnectionException,
			applicationContext.translator.Translate("database-connection-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestID,
			path,
			innerException
		)
	}
}

/** Error que indica que no existe una instancia de la base de datos */
export class DatabaseNoInstanceException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseNoInstanceException,
			applicationContext.translator.Translate("database-no-instance-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestID,
			path,
			innerException
		)
	}
}

/** Error que indica que no hay un dialecto disponible para la base de datos */
export class DatabaseNoDialectException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseNoDialectException,
			applicationContext.translator.Translate("database-no-dialect-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestID,
			path,
			innerException
		)
	}
}

/** Error que indica que hay un problema al realizar una transacción */
export class DatabaseTransactionException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseTransactionException,
			applicationContext.translator.Translate("database-transaction-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestID,
			path,
			innerException
		)
	}
}

/** Error de base de datos genérico */
export class DatabaseException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseException,
			applicationContext.translator.Translate("database-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestID,
			path,
			innerException
		)
	}
}
