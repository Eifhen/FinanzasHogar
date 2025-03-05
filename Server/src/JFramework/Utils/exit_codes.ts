
export const EXIT_CODES = {
	/** Indica que el programa terminó sin errores */
	SUCCESS: 0,

	/** Indica que ocurrió una excepción fatal no atrapada y por ello el programa terminó */
	UNCAUGHT_FATAL_EXCEPTION: 1,

	/** Indica que hubo un error interno de análisis de JavaScript */
	INTERNAL_JS_PARSE_ERROR: 3,

	/** Indica que hubo un fallo interno en una evaluación de JavaScript */
	INTERNAL_JS_EVAL_FAILURE: 4,

	/** Indica que ocurrió un error fatal inesperado */
	FATAL_ERROR: 5,

	/** Indica que el manejador de función interna NO es una función */
	NON_FUNCTION_INTERNAL: 6,

	/** Fallo en tiempo de ejecución del manejador de excepción interna */
	INTERNAL_RUNTIME_FAILURE: 7,

	/** Se llamó a un argumento inválido o no esperado */
	INVALID_ARGUMENT: 9,

	/** Fallo en tiempo de ejecución de JavaScript interna (V8 runtime) */
	INTERNAL_JS_RUNTIME_FAILURE: 10,

	/** El argumento de depuración no es válido */
	INVALID_DEBUG_ARGUMENT: 12,

	/** Proceso terminado por SIGTERM (128 + 15) */
	SIGTERM_EXIT: 143
} as const;


export type EXIT_CODES = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];