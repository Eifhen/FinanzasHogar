



export default interface IDatabaseConnectionManager {

	/** Realiza la conección a la base de datos */
  Connect() : Promise<void>;

  /** Cierra la conección a la base de datos */
  Disconnect() : Promise<void>;

}