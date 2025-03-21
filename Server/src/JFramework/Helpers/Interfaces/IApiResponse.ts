


/** Interfaz de la respuesta de la aplicación */
export default interface IApiResponse<T> {

  /** Id del request */
  requestID: string;
  /** Data a devolver */
  data?: T;

  /** Mensaje de respuesta */
  message: string;

  /** Ruta de redirección si la hay */
  redirectionRoute?: string;
}