
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

  // Errores de servidor
  InternalServerError : 500,
  NotImplemented : 501,
  BadGateway : 502,
  ServiceUnavailable : 503,
} as const;



export const HttpStatusMessage = {
  // Información
  OK : 'Petición exitosa',
  Created : 'Recurso creado exitosamente',
  Accepted : 'Petición aceptada',
  Updated : 'Recurso actualizado exitosamente',
  Deleted : 'Recurso eliminado exitosamente',
  NoContent : 'Sin Contenido',

  // Errores de cliente
  BadRequest : 'Solicitud incorrecta',
  Unauthorized : 'No autorizado',
  Forbidden : 'Acceso prohibido',
  NotFound : 'Recurso no encontrado',
  MethodNotAllowed : 'Método no permitido',
  UnprocessableEntity : 'Entidad no procesable',

  // Errores de servidor
  InternalServerError : 'Error interno del servidor',
  NotImplemented : 'Funcionalidad no implementada',
  BadGateway : 'Puerta de enlace incorrecta',
  ServiceUnavailable : 'Servicio no disponible',
} as const;


export const HttpStatusName = {
  // Información
  OK : 'OK',
  Created : 'Created',
  Accepted : 'Accepted',
  Updated : 'Updated',
  Deleted : 'Deleted',
  NoContent : 'No Content',

  // Errores de cliente
  BadRequest : 'Bad Request',
  Unauthorized : 'Unauthorized',
  Forbidden : 'Forbidden',
  NotFound : 'Not Found',
  MethodNotAllowed : 'Method Not Allowed',
  UnprocessableEntity : 'Unprocessable Entity',

  // Errores de servidor
  InternalServerError : 'Internal Server Error',
  NotImplemented : 'Not Implemented',
  BadGateway : 'Bad Gateway',
  ServiceUnavailable : 'Service Unavailable',
} as const


export type HttpStatusNames = (typeof HttpStatusName)[keyof typeof HttpStatusName];

export type HttpStatusCodes = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];

export type HttpStatusMessages = (typeof HttpStatusMessage)[keyof typeof HttpStatusMessage];
