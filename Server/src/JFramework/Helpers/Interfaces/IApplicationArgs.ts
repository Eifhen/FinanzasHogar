import { Query } from "express-serve-static-core";




/** Modelo de operaciones */
export default interface IApplicationArgs<TBody, TQuery extends Query = Query > {
  /** Id de la request en curso */
  requestID: string;

  /** Query Args */
  query?: TQuery;

  /** Parámetros de ruta */
  params?: any;

  /** Data recibida en el body */
  data: TBody;
}