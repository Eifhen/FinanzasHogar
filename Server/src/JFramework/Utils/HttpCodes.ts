

export const HttpStatusCode = {
	// Información
	OK : 200,
	Created : 201,
	Accepted : 202,
	NoContent : 204,
	Updated : 200,

	// Errores de cliente
	BadRequest : 400,
	Unauthorized : 401,
	Forbidden : 403,
	NotFound : 404,
	MethodNotAllowed : 405,
	UnprocessableEntity : 422,
	TooManyRequests: 429,

	// Errores de servidor
	InternalServerError : 500,
	NotImplemented : 501,
	BadGateway : 502,
	ServiceUnavailable : 503,
} as const;

export const HttpStatusMessage = {
	// Información
	OK : "ok-result",
	Created : "created",
	Accepted : "accepted",
	Updated : "updated",
	Deleted : "deleted",
	NoContent : "no-content",

	// Errores de cliente
	BadRequest : "bad-request",
	Unauthorized : "unauthorized",
	Forbidden : "forbidden",
	NotFound : "not-found",
	MethodNotAllowed : "method-not-allowed",
	UnprocessableEntity : "unprocessable-entity",
	TooManyRequests: "too-many-requests",

	// Errores de servidor
	InternalServerError : "internal-error",
	NotImplemented :  "not-implemented",
	BadGateway : "bad-gateway",
	ServiceUnavailable : "service-unavailable",

} as const;

export const HttpStatusName = {
	// Información
	OK : 'OK',
	Created : 'Created',
	Accepted : 'Accepted',
	Updated : 'Updated',
	Deleted : 'Deleted',
	NoContent : 'NoContent',

	// Errores de cliente
	BadRequest : 'BadRequest',
	Unauthorized : 'Unauthorized',
	Forbidden : 'Forbidden',
	NotFound : 'NotFound',
	MethodNotAllowed : 'MethodNotAllowed',
	UnprocessableEntity : 'UnprocessableEntity',
	TooManyRequests: "TooManyRequests",

	// Errores de servidor
	InternalServerError : 'InternalServerError',
	NotImplemented : 'NotImplemented',
	BadGateway : 'BadGateway',
	ServiceUnavailable : 'ServiceUnavailable',

	// Custom Errors
	NullParameterException:  "NullParameterException",
	InvalidParameterException: "InvalidParameterException",
	RecordAlreadyExists: "RecordAlreadyExists",
	ValidationException: "ValidationException",

	// Database Custom Errors
	DatabaseConnectionException: "DatabaseConnectionException",
	DatabaseDisconnectException: "DatabaseDisconnectException",
	DatabaseNoInstanceException: "DatabaseNoInstanceException",
	DatabaseNoDialectException: "DatabaseNoDialectException",
	DatabaseTransactionException: "DatabaseTransactionException",
	DatabaseCommitmentException: "DatabaseCommitmentException",
	DatabaseException: "DatabaseException",

	// Cloud Errors
	CloudStorageConnectionException: "CloudStorageConnectionException",
	CloudStorageDisconnectException: "CloudStorageDisconnectException",
	CloudStorageNoInstanceException: "CloudStorageNoInstanceException",

} as const


/** Indica los métodos http que son para 
 * leer información que están permitidos en nuestra app */
export const HttpAllowedReadMethods = {
	GET: "GET",
	// HEAD: "HEAD",
	// OPTIONS: "OPTIONS",
} as const;

/** Indica los métodos http que son para escribir información que 
 * están permitidos en nuestra app POST, PUT, DELETE, PATCH */
export const HttpAllowedWriteMethods = {
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	// PATCH: "PATCH"
} as const;

/** Indica los métodos http permitidos en nuestra aplicación */
export const HttpAllowedMethods = {
	...HttpAllowedReadMethods,
	...HttpAllowedWriteMethods
} as const;


export type HttpAllowedWriteMethods = (typeof HttpAllowedWriteMethods)[keyof typeof HttpAllowedWriteMethods];

export type HttpAllowedReadMethods = (typeof HttpAllowedReadMethods)[keyof typeof HttpAllowedReadMethods];

export type HttpAllowedMethods = (typeof HttpAllowedMethods)[keyof typeof HttpAllowedMethods];

export type HttpStatusName = (typeof HttpStatusName)[keyof typeof HttpStatusName];

export type HttpStatusCode = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];

export type HttpStatusMessage = (typeof HttpStatusMessage)[keyof typeof HttpStatusMessage];
