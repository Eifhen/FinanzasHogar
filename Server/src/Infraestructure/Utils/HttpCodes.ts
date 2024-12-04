
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


export type HttpStatusCodes = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];

export type HttpStatusMessages = (typeof HttpStatusMessage)[keyof typeof HttpStatusMessage];
