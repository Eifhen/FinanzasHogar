import ApplicationContext from "../Configurations/ApplicationContext";
import { HttpStatusMessage } from "../Utils/HttpCodes";


/** Clase que contiene la respuesta que se enviará al cliente */
export class ApplicationResponse<T> {
	
	/** Id de la request */
	public requestID: string;

	/** Data a devolver */
	public data?: T;

	/** Mensaje de respuesta */
	public message: string;

	/** Ruta de redirección si la hay */
	public redirectionRoute?: string;

	constructor(
		applicationContext:ApplicationContext, 
		_message: HttpStatusMessage, 
		_data?: T, 
		_redirectionRoute?:string
	){
		this.requestID = applicationContext.requestContext.requestId;
		this.message = applicationContext.language.Translate(_message);
		this.data = _data;
		this.redirectionRoute = _redirectionRoute;
	}

}


/** Define el tipo de una promesa que retorna un ApplicationResponse */
export type ApiResponse<T> = Promise<ApplicationResponse<T>>;