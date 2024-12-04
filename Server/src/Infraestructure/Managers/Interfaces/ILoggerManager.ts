

export const LogLevels = {
  /** Permite Logs de tipo INFO, WARN, ERROR, FALTA */
  INFO: 30, 
  /** Permite Logs de tipo WARN, ERROR, FATAL */
  WARN: 40,
  /** Permite Logs de tipo ERROR, FATAL */
  ERROR: 50,
  /** Solo permite Logs de tipo FATAL */
  FATAL: 60,
} as const;

export type LogLevel = (typeof LogLevels)[keyof typeof LogLevels];

export const LoggEntityCategorys = {
  MIDDLEWARE: "MIDDLEWARE",
  CONTROLLER: "CONTROLLER",
  SERVICE: "SERVICE",
  REPOSITORY: "REPOSITORY",
  HANDLER: "HANDLER",
  MANAGER: "MANAGER"
} as const;

export type LoggEntityCategory = keyof typeof LoggEntityCategorys;


export const LoggerTypes = {
  FATAL: "FATAL",
  ERROR: "ERROR",
  INFO: "INFO",
  WARN: "WARN"
} as const;

export type LoggerType = (typeof LoggerTypes)[keyof typeof LoggerTypes];

export type LoggErrorType = typeof LoggerTypes.ERROR | typeof LoggerTypes.FATAL;

export default interface ILoggerManager {

  /**
 * @description Método que imprime un log en consola
 * @param type - Tipo de logg a imprimir
 * @param msg  - Mensaje u Objeto a imprimir
 * @param obj  - Objeto a imprimir
 */
  Message: (type: LoggerType, msg: string, obj?: any) => Promise<void>;

  /**
 * @description - Método para loggear una determinada actividad del sistema
 * @param request_id - Id de la solicitud 
 * @param category - Categoría que se intenta loguear
 * @param entityName - Nombre de la entidad que se está loggeando
 * @param method - Método ejecutado
 */
  Activity: (method?: string, type?:LoggerType) => Promise<void>;

  /**
   * @description - Método para loguear una excepcióon dentro de la aplicación
   * @param request_id - Id de la solicitud (opcional)
   * @param type - Tipo de error ( Fatal o Error)
  */
  Error(type: LoggErrorType, method?: string): Promise<void>;
  Error(type: LoggErrorType, obj: Object): Promise<void>;

}
