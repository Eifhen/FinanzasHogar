import { HttpStatusCodes } from '../../Utils/HttpCodes';


/**
 *  Esta clase representa una excepción de la aplicación 
*/
export default class ApplicationException extends Error {

  /** Código de la excepción */
  public status?: HttpStatusCodes;

  /** Mensaje de error de la excepción */
  public message: string;

  /** Ruta en la cual ocurrió el error */
  public path?: string;

  /** ID del request dónde ocurrió el error */
  public request_id?: string;

  /** Descripción completa del error */
  public fullDescription?: string;

  constructor(message:string, request_id?:string, status?: HttpStatusCodes, path?:string, innerException?:Error){
    super(message);

    this.status = status;
    this.message = message;
    this.path = path;
    this.request_id = request_id;
    this.fullDescription = innerException ? innerException.stack :  "";
  }
}