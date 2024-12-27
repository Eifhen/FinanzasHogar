import IOperationArgs from "./types/IOperationArgs";
import {Request} from "express";


/** Objeto para manejo de operaciones */
export default class OperationArgs<T> implements IOperationArgs<T> {

  /** Id del request en curso */
  public requestID: string;

  /** Query Args del request en curso*/
  public query?: any;

  /** Parámetros del request en curso */
  public params?: any;

  /** Data recibida en el body del request*/
  public data: T;

  constructor(request: Request){
    this.requestID = request.requestID;
    this.query = request.query;
    this.params = request.params;
    this.data = request.body;
  }
}