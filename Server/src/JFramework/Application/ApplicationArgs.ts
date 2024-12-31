import ApplicationRequest from "./ApplicationRequest";
import IApplicationArgs from "./types/IApplicationArgs";


/** Objeto para manejo de operaciones */
export default class ApplicationArgs<T> implements IApplicationArgs<T> {

  /** Id del request en curso */
  public requestID: string;

  /** Query Args del request en curso*/
  public query?: any;

  /** Parámetros del request en curso */
  public params?: any;

  /** Data recibida en el body del request*/
  public data: T;

  constructor(request: ApplicationRequest){
    this.requestID = request.requestID;
    this.query = request.query;
    this.params = request.params;
    this.data = request.body;
  }
}