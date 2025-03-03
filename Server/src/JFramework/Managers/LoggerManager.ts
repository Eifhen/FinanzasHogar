
import ApplicationContext from "../Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategory, LoggErrorType, LoggerType, LoggerTypes, LogLevels } from "./Interfaces/ILoggerManager";
import Line from "./LinePrinterManager";
import { InternalServerException } from "../ErrorHandling/Exceptions";


interface LoggManagerDependencies {
	applicationContext?: ApplicationContext;
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
	private _applicationContext?: ApplicationContext;

	constructor(dependencies?: LoggManagerDependencies) {
		this._applicationContext = dependencies?.applicationContext;
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
	private ValidateAllowedLogs(incomingLogType: LoggerType): boolean {

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
	public Message(type: LoggerType, msg: string, obj?: any) {
		try {
			/** 
			* Solo imprime los logs cuyo nivel sea mayor al nivel definido por el contexto
			* Esto nos permite imprimir solo los logs que queramos según el nivel de log de nuestra aplicación
			*/
			if (this.ValidateAllowedLogs(type)) {
				Line.Print(type, `${msg}`, obj);
			}
		}
		catch (err: any) {
			Line.Print("FATAL", "Ha ocurrido un error al ejecutar el método [Message] del LoggerManager", err);

			throw new InternalServerException(
				"Message",
				err.message,
				this._applicationContext,
				__filename,
				err
			)

		}
	}

	/**
	 * @description - Método para loggear una determinada actividad del sistema
	 * @param request_id - Id de la solicitud 
	 * @param this._entityCategory - Categoría que se intenta loguear
	 * @param method - Método ejecutado
	 */
	public Activity(method?: string, obj?: any) {
		try {
			if (!this._entityCategory) {
				return;
			}

			let msg = "";

			msg = method ?
				`El ${this._entityCategory} [${this._entityName}] ha ejecutado el método [${method}]` :
				`El ${this._entityCategory} [${this._entityName}] se ha ejecutado`;


			if (this._applicationContext && this._applicationContext.requestID !== "") {
				msg = `RequestId: ${this._applicationContext.requestID} | ${msg}`;
			}

			// agregar request ID desde el context
			this.Message(LoggerTypes.INFO, msg, obj);
			return;
		}
		catch (err: any) {
			this.Message("FATAL", "Ha ocurrido un error al ejecutar el método [Activity] del LoggerManager", err);
			throw new InternalServerException(
				"Activity",
				err.message,
				this._applicationContext,
				__filename,
				err
			)
		}
	}

	/**
		 * @description - Similar a Activity, pero este nos permite definir el tipo de logg
		 * @param type -Tipo de log
		 * @param method - nombre del método que lo ejecuta
		 * @param obj - objeto a imprimir si lo hay
		 * @returns 
		 */
	public Register(type: LoggerType, method: string, obj?: any) {
		try {
			let msg = `El ${this._entityCategory} [${this._entityName}] ha ejecutado el método [${method}]`;

			if (this._applicationContext?.requestID) {
				msg = `RequestId: ${this._applicationContext.requestID} | ${msg}`;
			}

			this.Message(type, msg, obj);
			return;
		}
		catch (err: any) {
			this.Message("FATAL", "Ha ocurrido un error al ejecutar el método [Register] del LoggerManager", err);
			throw new InternalServerException(
				"Register",
				err.message,
				this._applicationContext,
				__filename,
				err
			)
		}
	}

	/**
	 * @description - Método para loguear una excepcióon dentro de la aplicación
	 * @param request_id - Id de la solicitud (opcional)
	 * @param type - Tipo de error ( Fatal o Error)
	 */
	public Error(type: LoggErrorType, method?: string, obj?: any) {
		try {

			// Si el último argumento es un string, se trata de un método
			let msg = method ?
				`Ha ocurrido un error en el ${this._entityCategory} [${this._entityName}] en el método [${method}]` :
				`Ha ocurrido un error en el ${this._entityCategory} [${this._entityName}]`;

			// Agregar request id desde el context si lo hay
			if (this._applicationContext && this._applicationContext.requestID != "") {
				msg = `RequestId: ${this._applicationContext.requestID} | ${msg}`;
			}

			this.Message(type, msg, obj);
			return;

		}
		catch (err: any) {
			this.Message("FATAL", "Ha ocurrido un error al ejecutar el método [Error] del LoggerManager", err);
			throw new InternalServerException(
				"Error",
				err.message,
				this._applicationContext,
				__filename,
				err
			)
		}
	}
}