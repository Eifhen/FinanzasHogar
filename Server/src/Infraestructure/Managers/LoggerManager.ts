import ApplicationContext from "../Configurations/ApplicationContext";
import { NO_REQUEST_ID } from "../Shered/CommonTypes/const";
import ApplicationException from "../Shered/ErrorHandling/ApplicationException";
import { HttpStatusCode } from "../Utils/HttpCodes";
import ILoggerManager, { LoggEntityCategorys, LoggEntityCategory, LoggErrorType, LoggerType, LoggerTypes, LogLevels } from "./Interfaces/ILoggerManager";
import Line from "./LinePrinterManager";


interface LoggManagerDependencies {
  context?: ApplicationContext;
  entityCategory: LoggEntityCategory;
  entityName: string;
}

/**
  Esta clase sirve para el manejo de los loggs de la aplicación
*/
export default class LoggerManager implements ILoggerManager {

  /** Nombre de la entidad que hace uso del logger */
  private _entityName?: string;

  /** Categoría de la entidad de la cual se hara el logg */
  private _entityCategory?: LoggEntityCategory;

  /** Contexto de la aplicación */
  private _context?: ApplicationContext;

  constructor(dependencies?: LoggManagerDependencies) {
    this._context = dependencies?.context;
    this._entityName = dependencies?.entityName ?? "";
    this._entityCategory = dependencies?.entityCategory;
  }

  /** 
    Si el nivel de log del contexto es mayor al nivel de log que ingresa retorna false
    si es menor o igual retorna true
    ejemplo: 
    - incomingLevel = 30 (INFO)
    - applicationlevel = 50 (ERROR)
    En este caso `applicationLevel` es mayor que `incomingLevel` por lo tanto el 
    log de grado `incomingLevel` no se imprimirá

    ejemplo2:
    - incomingLevel = 60 (FATAL)
    - appplicationLevel = 30 (INFO)

    En este caso el `incomingLevel` es mayor que el `applicationLevel`
    por lo tanto el error si se imprimirá. Indicando que solo se pueden imprimir errores
    cuyo nivel sea mayor o igual al nivel del `applicationLevel`
  */
  private ValidateAllowedLogs = (incomingLogType: LoggerType) => {

    const level = Number(process.env.LOG_LEVEL ?? LogLevels.INFO);
    const incomingLogLevel = LogLevels[incomingLogType];

    if (level) {
      return level > incomingLogLevel ? false : true;
    }

    return false;
  }

  /**
   * @description - Método privado que realiza la operación de logg
   * @param type - Tipo de log que se desea realizar
   * @param msg - Mensaje y objeto que se desea loggear
   * @param obj - Objeto adicional que se desee agregar
   */
  public Message = async (type: LoggerType, msg: string, obj?: any) => {
    try {
      /** 
      * Solo imprime los logs cuyo nivel sea mayor al nivel definido por el contexto
      * Esto nos permite imprimir solo los logs que queramos según el nivel de log de nuestra aplicación
      */
      if (this.ValidateAllowedLogs(type)) {
        Line.Print(type, `${msg}`, obj);
      }
    }
    catch (err:any) {
      Line.Print("FATAL", "Ha ocurrido un error al ejecutar el método [Message] del LoggerManager", err);
      throw new ApplicationException(
        err.message, 
        this._context?.request_id ?? NO_REQUEST_ID, 
        HttpStatusCode.InternalServerError, 
        __filename, 
        err
      );
    }
  }

  /**
   * @description - Método para loggear una determinada actividad del sistema
   * @param request_id - Id de la solicitud 
   * @param this._entityCategory - Categoría que se intenta loguear
   * @param method - Método ejecutado
   */
  public Activity = async (method?: string, obj?: any) => {
    try {
      if (!this._entityCategory) {
        return;
      }

      let msg = "";

      if (this._entityCategory === LoggEntityCategorys.MIDDLEWARE) {
        msg = `El ${this._entityCategory} [${this._entityName}] se ha ejecutado`;
      }

      if (this._entityCategory === LoggEntityCategorys.CONTROLLER) {
        msg = `El ${this._entityCategory} [${this._entityName}] ha ejecutado el método [${method}]`
      }

      if (this._entityCategory === LoggEntityCategorys.SERVICE) {
        msg = `El ${this._entityCategory} [${this._entityName}] ha ejecutado el método [${method}]`
      }

      if (this._entityCategory === LoggEntityCategorys.REPOSITORY) {
        msg = `El ${this._entityCategory} [${this._entityName}] ha ejecutado el método [${method}]`
      }

      if (this._entityCategory === LoggEntityCategorys.HANDLER) {
        msg = `El ${this._entityCategory} [${this._entityName}] se ha ejecutado`;
      }

      if (this._entityCategory === LoggEntityCategorys.MANAGER) {
        msg = `El ${this._entityCategory} [${this._entityName}] se ha ejecutado`;
      }

      if (this._context && this._context.request_id != "") {
        msg = `RequestId: ${this._context.request_id} | ` + msg;
      }

      // agregar request ID desde el context
      this.Message(LoggerTypes.INFO, msg, obj);
      return;
    }
    catch (err:any) {
      this.Message("FATAL", "Ha ocurrido un error al ejecutar el método [Activity] del LoggerManager", err);
      throw new ApplicationException(
        err.message, 
        this._context?.request_id ?? NO_REQUEST_ID, 
        HttpStatusCode.InternalServerError, 
        __filename, 
        err
      );
    }
  }

/**
   * @description - Similar a Activity, pero este nos permite definir el tipo de logg
   * @param type -Tipo de log
   * @param method - nombre del método que lo ejecuta
   * @param obj - objeto a imprimir si lo hay
   * @returns 
   */
  public Register = async (type: LoggerType, method: string, obj?:any) => {
    try {
      const msg = `El ${this._entityCategory} [${this._entityName}] ha ejecutado el método [${method}]`;
      this.Message(type, msg, obj);
      return;
    }
    catch(err:any){
      this.Message("FATAL", "Ha ocurrido un error al ejecutar el método [Register] del LoggerManager", err);
      throw new ApplicationException(
        err.message, 
        this._context?.request_id ?? NO_REQUEST_ID, 
        HttpStatusCode.InternalServerError, 
        __filename, 
        err
      );
    }
  }

  /**
   * @description - Método para loguear una excepcióon dentro de la aplicación
   * @param request_id - Id de la solicitud (opcional)
   * @param type - Tipo de error ( Fatal o Error)
   */
  public Error = async (type: LoggErrorType = LoggerTypes.ERROR, method?:string, obj?:any) => {
    try {

      // Si el último argumento es un string, se trata de un método
      let msg = method ?
        `Ha ocurrido un error en el ${this._entityCategory} [${this._entityName}] en el método [${method}]` :
        `Ha ocurrido un error en el ${this._entityCategory} [${this._entityName}]`;

      // Agregar request id desde el context si lo hay
      if (this._context && this._context.request_id != "") {
        msg = `RequestId: ${this._context.request_id} | ` + msg;
      }

      this.Message(type, msg, obj);
      return;

    }
    catch (err:any) {
      this.Message("FATAL", "Ha ocurrido un error al ejecutar el método [Error] del LoggerManager", err);
      throw new ApplicationException(
        err.message, 
        this._context?.request_id ?? NO_REQUEST_ID, 
        HttpStatusCode.InternalServerError, 
        __filename, 
        err
      );
    }
  }
}