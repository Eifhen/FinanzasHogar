import { LenguageKeys } from "../Types/ApplicationLenguages";




/** Objeto de idioma español */
export const ES_DO_SYSTEM: Record<LenguageKeys, string> = {

	/** Time Units */
	"days": "Días",
	"hours": "Horas",
	"minutes": "Minutos",
	"seconds": "Segundos",
	"milliseconds": "Milisegundos",
	"years": "Años",
	/** END Time Units */

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
	"too-many-requests": "Demasiadas solicitudes desde esta IP, inténtelo de nuevo después de {0} {1}.",
	/** END Status Messages */

	/** Limiters */
	"generalLimiter": "Has alcanzado el límite de solicitudes. Por favor, inténtalo de nuevo después de {0} {1}.",
	"authLimiter": "Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo después de {0} {1}.",
	"resourceHeavyLimiter": "Se ha excedido el límite de solicitudes para este recurso. Por favor, inténtalo de nuevo después de {0} {1}.",
	/** END Limiters */

	/** Errores custom */
	"record-exists": "Ya existe un registro con el {0} igual a {1}.",
	"record-not-found": "No se encontró un registro con el identificador {0}.",
	"null-parameter-exception": "El parámetro {0} no puede ser nulo.",
	"not-implemented-exception": "Recurso no implementado",
	"invalid-parameter-exception": "El valor ingresado al parámetro {0} es invalido",
	"database-dml-exception": "Ha ocurrido un error mientras se realizaba la operación DML.",
	"database-require-filtering": "Ha ocurrido un error mientras se realizaba la operacion {0}, es necesario aplicar un filtro antes de proseguir",
	"database-query-exception": "Ha ocurrido un error al construir la consulta '{0}'",
	"database-desconnection-exception": "Ha ocurrido un error al intentar desconectarse de la base de datos.",
	"database-connection-exception": "Ha ocurrido un error al conectarse a la base de datos.",
	"database-no-instance-exception": "Por el momento no hay una instancia de la base de datos disponible.",
	"database-no-dialect-exception": "Por el momento no hay un dialecto disponible.",
	"database-transaction-exception": "Ha ocurrido un error al realizar la transacción.",
	"database-strategy-exception": "Ha ocurrido un error al cargar la estrategia de conexión",
	"database-undefined-connections": "Ha ocurrido un error al intentar cargar las conexiones a la base de datos.",
	"database-commitment-exception": "Error de compromiso: ha ocurrido un error fatal, el tenant indicado no posee un proyect id valido, es posible que la base de datos esté comprometida.",
	"database-exception": "Ha ocurrido un error en la base de datos.",
	"rate-limiter-invalid": "El RateLimiter {0} no es una función.",
	"middleware-instance-type-exception": "El middleware ingresado debe ser una instancia de ApplicationMiddleware.",
	"image-size-exception": "El tamaño de la imagen no debe ser superior a {0}.",
	"invalid-csrf-token": "El token CSRF ingresado es inválido",
	"csrf-token-doesnt-exists": "El token CSRF no existe",
	"csrf-error": "Ha ocurrido un error mientras se validaba el token csrf",
	"invalid-verb": "El Verbo HTTP ingresado, es inválido para esta solicitud",
	"out-of-range": "La solicitud en curso está fuera de rango",
	"connection-env-error": "Ha ocurrido un error al definir el tipo de ambiente de conexión",
	"connection-config-error": "Ha ocurrido un error al definir la configuración de conexión",
	"no-tenant": "Error, no se ha enviado un tenant válido",
	"tenant-error": "Ha ocurrido un error al buscar el tenant indicado",
	"server-critical-exception": "A ocurrido un error crítico en el sistema. Por favor contacte al administrador.",
	/** END Errores Custom */

	/** Zod errors */
	"too_small_array": `La longitud del campo "{0}" debe ser mayor a {1}.`,
	"too_small_set": `La longitud del campo "{0}" debe ser mayor a {1}.`,
	"too_small_number": `El valor del campo "{0}" debe ser mayor a {1}.`,
	"too_small_bigint": `El valor del campo "{0}" debe ser mayor a {1}.`,
	"too_small_string": `El campo "{0}" debe contener al menos {1} caracteres.`,
	"too_small_date": `La fecha ingresada en el campo "{0}" debe ser mayor a {1}.`,

	"too_big_array": `La longitud del campo "{0}" no debe ser mayor a {1}.`,
	"too_big_set": `La longitud del campo "{0}" no debe ser mayor a {1}.`,
	"too_big_number": `El valor del campo "{0}" no debe ser mayor a {1}.`,
	"too_big_bigint": `El valor del campo "{0}" no debe ser mayor a {1}.`,
	"too_big_string": `El campo "{0}" no debe contener más de {1} caracteres.`,
	"too_big_date": `La fecha ingresada en el campo "{0}" no debe ser mayor a {1}.`,

	"invalid_date": `La fecha ingresada en el campo "{0}" es inválida.`,
	"invalid_string": `La cadena ingresada en el campo "{0}" es inválida.`,
	"invalid_url": `La url ingresada en el campo {0} es inválida.`,
	"invalid_literal": `El valor ingresado para el campo "{0}" es inválido. Se esperaba el valor {1}, pero se recibió el valor {2}.`,
	"invalid_type": `El tipo de dato ingresado en el campo "{0}" es inválido. Se esperaba el tipo {1} pero se recibió el tipo {2}.`,
	"invalid_union": `Ha ocurrido un error en el campo "{0}".`,
	"invalid_arguments": `Los argumentos pasados a la función "{0}" son invalidos.`,
	"invalid_return_type": `El valor de retorno de la función "{0}" es invalido.`,
	"invalid_enum_value": `El valor ingresado en el campo "{0}" es invalido. Se ingreso el valor {1} y se esperaba un valor de la lista: {2}.`,
	"invalid_intersection_types": `No se pudieron fusionar los resultados de la intersección en el campo "{0}".`,
	"invalid_union_discriminator": `Valor discriminador no válido en el campo "{0}". Se esperaba {1}.`,
	"invalid_custom": `El campo "{0}" es invalido.`,

	"not_finite": `El valor del campo "{0}", debe ser un número finito.`,
	"not_multiple_of": `El valor ingresado en el campo "{0}" no debe ser multiplo de {1}.`,
	"unrecognized_keys": `El campo "{0}" no debe poseer propiedades adicionales: [{1}].`,
	/** END Zod Errors */

} as const;