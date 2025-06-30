import ApplicationContext from "../Configurations/ApplicationContext";
import { EN_US_SYSTEM } from "../Translations/Dictionaries/en_US_SYSTEM";
import { ARRAY_LENGTH_EMPTY, NO_REQUEST_ID } from "../Utils/const";
import { Environment } from "../Utils/Environment";
import { HttpStatusName, HttpStatusCode, HttpStatusMessage } from "../Utils/HttpCodes";
import IsNullOrEmpty from "../Utils/utils";
import { ErrorMessageData } from "./Exceptions";

interface ApplicationDetails {
	/** Ubicación del error */
	path?: string;

	/** Stack del error */
	innerException?: string;

	/** Nombre del método que explotó */
	methodName?: string;

}

interface ApplicationError {
	/** Id del request en curso */
	requestID: string;

	/** Nombre del error */
	errorName: string;

	/** Codigo del error */
	status: number;

	/** Mensaje de error */
	message: string;

	/** Detalle del error */
	details?: ApplicationDetails;
}


/** Esta clase representa una excepción de la aplicación  */
export default class ApplicationException extends Error {


	/** Nombre del error */
	public errorName: HttpStatusName;

	/** Nombre del método donde ocurrio el error */
	public methodName?: string;

	/** Código de la excepción */
	public status: HttpStatusCode;

	/** Mensaje de error de la excepción */
	public message: string;

	/** Ruta en la cual ocurrió el error */
	public path?: string;

	/** ID del request dónde ocurrió el error */
	public requestID?: string;

	/** Descripción completa del error */
	public stack?: string;


	constructor(
		methodName: string,
		errorName: HttpStatusName,
		message: string,
		status: HttpStatusCode,
		requestID?: string,
		path?: string,
		innerException?: Error
	) {
		super(message);

		this.errorName = IsNullOrEmpty(errorName) ? HttpStatusName.InternalServerError : errorName;
		this.status = IsNullOrEmpty(status) ? HttpStatusCode.InternalServerError : status;
		this.message = IsNullOrEmpty(message) ? HttpStatusMessage.InternalServerError : message;
		this.path = IsNullOrEmpty(path) ? "" : path;
		this.requestID = IsNullOrEmpty(requestID) ? NO_REQUEST_ID : requestID;
		this.methodName = methodName;

		if (innerException) {
			this.stack = innerException?.stack;
		}

		/** 
			When an instance of a constructor is created via new, the value of new.target is set 
			to be a reference to the constructor function initially used to allocate the instance. 
			If a function is called rather than constructed via new, 
			new.target is set to undefined.

			new.target comes in handy when Object.setPrototypeOf or __proto__ needs 
			to be set in a class constructor. One such use case is inheriting 
			from Error in NodeJS v4 and higher. 
		*/
		Object.setPrototypeOf(this, new.target.prototype);
	}

	/** Obtiene el mensaje de error traducido */
	public GetErrorMessage (
		messageData: string | ErrorMessageData | undefined,
		applicationContext: ApplicationContext|undefined, 
		defaultEntry: keyof typeof EN_US_SYSTEM
	): string {
		if (applicationContext) {
			if (messageData && !IsNullOrEmpty(messageData)) {
				if (typeof messageData === "string") {
					if (messageData in EN_US_SYSTEM){
						return applicationContext.language.Translate(messageData as keyof typeof EN_US_SYSTEM);
					}
					else {
						return messageData;
					}
				} else {
					return applicationContext.language.Translate(messageData.message, messageData.args);
				}
			} else {
				return applicationContext.language.Translate(defaultEntry);
			}
		} else {
			return messageData && typeof messageData === "string" ? messageData : "";
		}
	}

	/** Permite procesar un array de mensajes de error */
	public ProcessErrorMessages(
		messageData: ErrorMessageData[],
		applicationContext: ApplicationContext|undefined, 
		defaultEntry: keyof typeof EN_US_SYSTEM
	) : string {
		if(applicationContext){
			if(messageData && messageData.length > ARRAY_LENGTH_EMPTY){

				/** Hacemos loop sobre cada item recibido */
				const result = messageData.map((item)=> {
					/** Ingresamos al array el mensaje traducido de cada error */
					return applicationContext.language.Translate(item.message, item.args);
				});

				return result.join(" ");
			}

			return applicationContext.language.Translate(defaultEntry);
		}

		return defaultEntry;
	}

	/** Sobrescribe el método toJSON para definir 
	 * cuales propiedades deben ser serializables */
	toJSON() {
		const error: ApplicationError = {
			requestID: IsNullOrEmpty(this.requestID) ? NO_REQUEST_ID : this.requestID!,
			errorName: this.errorName,
			status: this.status,
			message: this.message,
			// details : {
			//   path: this.path ?? "",
			//   innerException: this.stack,
			//   methodName: this.methodName
			// }
		};

		// solo agregamos el stack en desarrollo
		if (process.env.NODE_ENV?.toUpperCase() === Environment.DEVELOPMENT) {
			error.details = {
				path: this.path ?? "",
				innerException: this.stack,
				methodName: this.methodName
			}
		}

		return error;
	}


}