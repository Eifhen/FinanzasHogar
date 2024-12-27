





export default interface IDBConnectionStrategy<ConnectionType, InstanceType> {
  /** Método que ejecuta la connección con la base de datos */
  Connect: () => ConnectionType;

  /** Retorna una instancia de la base de datos */
  GetInstance: () => InstanceType;

  /** Método que permite cerrar la conección con la base de datos */
  CloseConnection: () => Promise<void>;

}