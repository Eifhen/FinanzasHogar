import IApplicationResponse from "./types/IApplicationResponse";



/** Clase que contiene la respuesta que se enviará al cliente */
export class ApplicationResponse<T> implements IApplicationResponse<T> {
  
  /** Id de la request */
  public requestID: string;

  /** Data a devolver */
  public data?: T;

  /** Mensaje de respuesta */
  public message: string;

  /** Ruta de redirección si la hay */
  public redirectionRoute?: string;

  constructor(_requestID: string, _message: string, _data: T, _redirectionRoute?:string){
    this.requestID = _requestID;
    this.message = _message;
    this.data = _data;
    this.redirectionRoute = _redirectionRoute;
  }

}