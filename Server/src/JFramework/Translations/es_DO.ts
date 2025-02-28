



/** Objeto de idioma español */
export const ES = {

	"activar": "Activar",
	"activar-cuenta": "Activar Cuenta",
	"apikey-invalido" : "El API Key {0} ingresado es invalido",
	"apikey-no-definido": "API key faltante. Por favor, proporcione una API key válida para acceder a este recurso.",
	"bienvenido-a": "Bienvenido a",
	"cuenta-creada-exitosamente": "Tu cuenta ha sido creada exitosamente. Pulsa el link para activar tu cuenta.",
	"hola": "Hola",
	"days": "Días",
	"hours": "Horas",
	"minutes": "Minutos",
	"seconds": "Segundos",
	"milliseconds": "Milisegundos",

	/** Status Messages */
	"ok-result": "Petición Exitosa",
	"created": "Recurso creado exitosamente",
	"accepted": "Petición acceptada",
	"updated": "Recurso actualizado exitosamente",
	"deleted": "Recurso eliminado exitosamente",
	"no-content": "Sin contenido",
	"bad-request": "Solicitud incorrecta",
	"unauthorized": "Acceso no autorizado",
	"forbidden": "Acceso prohibido",
	"not-found": "Recurso no encontrado",
	"method-not-allowed": "Método no permitido",
	"unprocessable-entity": "Entidad no procesable",
	"internal-error": "Error interno en el servidor",
	"not-implemented": "Funcionalidad no implementada",
	"bad-gateway": "Puerta de enlace incorrecta",
	"service-unavailable": "Servicio no disponible",
	"too-many-requests": "Demasiadas solicitudes desde esta IP, inténtelo de nuevo después de {0} {1}",
	
	/** Errores custom */
	"record-exists": "Ya existe un registro con el {0} igual a {1}",
	"record-not-found": "No se encontró un registro con el identificador {0}",
	"null-parameter-exception": "El parámetro {0} no puede ser nulo",
	"database-connection-exception" : "Ha ocurrido un error al conectarse a la base de datos", 
	"database-no-instance-exception" : "Por el momento no hay una instancia de la base de datos disponible",
	"database-no-dialect-exception": "Por el momento no hay un dialecto disponible",
	"database-transaction-exception": "Ha ocurrido un error al realizar la transaccion",
	"database-exception": "Ha ocurrido un error en la base de datos",
	"rate-limiter-invalid": "El RateLimiter {0} no es una función",
	"middleware-instance-type-exception": "El middleware ingresado debe ser una instancia de ApplicationMiddleware",
	"image-size-exception": "El tamaño de la imagen no debe ser superior a {0}",

	// Limiters
	"generalLimiter": "Has alcanzado el límite de solicitudes. Por favor, inténtalo de nuevo después de {0} {1}",
	"authLimiter" : "Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo después de {0} {1}",
	"resourceHeavyLimiter" : "Se ha excedido el límite de solicitudes para este recurso. Por favor, inténtalo de nuevo después de {0} {1}",

} as const;