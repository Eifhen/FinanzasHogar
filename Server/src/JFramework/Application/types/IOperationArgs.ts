



/** Modelo de operaciones */
export default interface IOperationArgs<T> {
  /** Id de la request en curso */
  requestID: string;

  /** Query Args */
  query?: any;

  /** Parámetros de ruta */
  params?: any;

  /** Data recibida en el body */
  data: T;
}