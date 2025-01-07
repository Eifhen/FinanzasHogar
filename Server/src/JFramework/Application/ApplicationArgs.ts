import { Query } from "express-serve-static-core";
import ApplicationRequest from "./ApplicationRequest";
import IApplicationArgs from "./types/IApplicationArgs";


/** Objeto para manejo de operaciones */
export default class ApplicationArgs<TBody, TQuery extends Query = Query> implements IApplicationArgs<TBody, TQuery> {

  /** Id del request en curso */
  public requestID: string;

  /** Query Args del request en curso*/
  public query?: TQuery;

  /** Parámetros del request en curso */
  public params?: any;

  /** Data recibida en el body del request*/
  public data: TBody;

  constructor(request: ApplicationRequest<TBody, TQuery>){
    this.requestID = request.requestID;
    this.query = request.query;
    this.params = request.params;
    this.data = request.body;
  }
}