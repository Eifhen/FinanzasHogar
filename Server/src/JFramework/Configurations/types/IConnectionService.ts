

/** Define una interfaz básica para cualquier servicio que 
 * realiza acciones de conección y desconección */
export interface IConnectionService {
  /** Permite la coneccion */
  Connect(): Promise<void>;

  /** Permite desconectar  */
  Disconnect(): Promise<void>;
}

/** Define el ambiente de conexión, si se trata de una conexión interna o de una conexión de negocio */
export const ConnectionEnvironment = {
	internal: "internal",
	business: "business"
} as const;

export type ConnectionEnvironment = keyof typeof ConnectionEnvironment;