



/** Indica que el programa terminó sin errores */
export const EXIT_CODE_SUCCESS = 0;

/** Indica que ocurrio una excepción fatal no atrapada y 
 * que por esto el programa terminó */
export const EXIT_CODE_UNCAUGHT_FATAL_EXCEPTION = 1;

/** Indica que hubo un error interno de análisis de JavaScript  */
export const EXIT_CODE_INTERNAL_JS_PARSE_ERROR = 3;

/** Indica que hubo un fallo interno en una evaluación de JavaScript */
export const EXIT_CODE_INTERNAL_JS_EVAL_FAILURE = 4;

/** Indica que ocurrió un error fatal inesperado */
export const EXIT_CODE_FATAL_ERROR = 5;

/** Indica que el manejador de función interna NO es una función  */
export const EXIT_CODE_NON_FUNCTION_INTERNAL = 6;

/** (Fallo en tiempo de ejecución del manejador de excepción interna): 
 * Se lanzó una excepción cuando se intentó ejecutar un manejador de excepción interna. */
export const EXIT_CODE_INTERNAL_RUNTIME_FAILURE = 7;

/** Se llamó a un argumento inválido o no esperado. */
export const EXIT_CODE_INVALID_ARGUMENT = 9;

/** (Fallo en tiempo de ejecución de JavaScript interna): 
 * Se produjo un error en tiempo de ejecución en el motor de JavaScript V8. */
export const EXIT_CODE_INTERNAL_JS_RUNTIME_FAILURE = 10;

/** (Argumento de depuración inválido): El argumento de depuración no es válido. */
export const EXIT_CODE_INVALID_DEBUG_ARGUMENT = 12;