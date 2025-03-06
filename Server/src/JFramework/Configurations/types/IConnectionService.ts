

/** Define una interfaz básica para cualquier servicio que 
 * realiza acciones de conección y desconección */
export interface IConnectionService {
  /** Permite la coneccion */
  Connect(): Promise<void>;

  /** Permite desconectar  */
  Disconnect(): Promise<void>;
}