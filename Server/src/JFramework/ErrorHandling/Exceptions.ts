import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "./ApplicationException";
import ApplicationContext from "../Configurations/ApplicationContext";

export type ErrorMessageData = {

	/** Este atributo debe ser un key de un diccionario 
	 * EN_US_SYSTEM, ES_DO_SYSTEM, etc*/
	message: string;

	/** argumentos del mensaje */
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
			applicationContext.requestContext.requestId,
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
			applicationContext?.requestContext.requestId,
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
			applicationContext.language.Translate(messageData.message, messageData.args),
			HttpStatusCode.TooManyRequests,
			applicationContext?.requestContext.requestId,
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
			applicationContext.language.Translate("record-not-found", value),
			HttpStatusCode.NotFound,
			applicationContext.requestContext.requestId,
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
			applicationContext.language.Translate("null-parameter-exception", [parameterName]),
			HttpStatusCode.BadRequest,
			applicationContext.requestContext.requestId,
			path,
			innerException
		);
	}
}

/** Cuando se envia un parámetro que es requerido de forma incorrecta*/
export class InvalidParameterException extends ApplicationException {
	constructor(
		methodName: string,
		parameterName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.InvalidParameterException,
			applicationContext.language.Translate("invalid-parameter-exception", [parameterName]),
			HttpStatusCode.BadRequest,
			applicationContext.requestContext.requestId,
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
			applicationContext?.requestContext.requestId,
			path,
			innerException
		);

		this.message = this.GetErrorMessage(messageData, applicationContext, "bad-request");

	}
}

/** Error que indica que un recurso no está implementado */
export class NotImplementedException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext?: ApplicationContext,
		path?: string,
	) {
		super(
			methodName,
			HttpStatusName.NotImplementedException,
			"",
			HttpStatusCode.InternalServerError,
			applicationContext?.requestContext.requestId,
			path,
		);

		this.message = this.GetErrorMessage(
			"not-implemented-exception",
			applicationContext,
			"not-implemented-exception"
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
		methodName: string,
		message: [string, string],
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.RecordAlreadyExists,
			applicationContext.language.Translate("record-exists", message),
			HttpStatusCode.BadRequest,
			applicationContext.requestContext.requestId,
			path,
			innerException
		);
	}
}

/** Error al construir consulta */
export class DatabaseQueryBuildException extends ApplicationException {
	constructor(
		methodName: string,
		param: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseConnectionException,
			applicationContext.language.Translate("database-query-exception", [param]),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)
	}
}

/** Error al realizar operación DML */
export class DatabaseOperationException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseConnectionException,
			applicationContext.language.Translate("database-dml-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)
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
			applicationContext.language.Translate("database-connection-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)
	}
}

/** Error al cerrar la conección a la base de datos */
export class DatabaseDesconnectionException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseDisconnectException,
			applicationContext.language.Translate("database-desconnection-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
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
			applicationContext.language.Translate("database-no-instance-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
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
			applicationContext.language.Translate("database-no-dialect-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
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
			applicationContext.language.Translate("database-transaction-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)
	}
}

/** Error al cargar estrategia de conexión */
export class DatabaseStrategyException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseStrategyException,
			applicationContext.language.Translate("database-strategy-exception"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)
	}
}

/** Error al buscar conexiones */
export class DatabaseUndefinedConnectionException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseStrategyException,
			applicationContext.language.Translate("database-undefined-connections"),
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)
	}
}

/** Error de base de datos genérico */
export class DatabaseException extends ApplicationException {
	constructor(
		methodName: string,
		messageData: string | ErrorMessageData,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseException,
			"",
			HttpStatusCode.InternalServerError,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)

		this.message = this.GetErrorMessage(messageData, applicationContext, "database-exception");
	}
}

/** Error de compromiso, base de datos comprometida */
export class DatabaseCommitmentException extends ApplicationException {
	constructor(
		methodName: string,
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.DatabaseCommitmentException,
			applicationContext.language.Translate("database-commitment-exception"),
			HttpStatusCode.BadRequest,
			applicationContext?.requestContext.requestId,
			path,
			innerException
		);
	}
}

/** Error de validación de zod */
export class ValidationException extends ApplicationException {

	constructor(
		methodName: string,
		messageData: ErrorMessageData[],
		applicationContext: ApplicationContext,
		path?: string,
		innerException?: Error
	) {
		super(
			methodName,
			HttpStatusName.ValidationException,
			applicationContext.language.Translate("database-exception"),
			HttpStatusCode.BadRequest,
			applicationContext.requestContext.requestId,
			path,
			innerException
		)

		this.message = this.ProcessErrorMessages(messageData, applicationContext, "internal-error");
	}
}