import { ClassInstance } from "../../../Utils/Types/CommonTypes";




export default interface IDatabaseConnectionStrategy<ConnectionType, InstanceType> {
  /** Método que ejecuta la connección con la base de datos */
  Connect() : Promise<ConnectionType>;

  /** Retorna una instancia de la base de datos */
  GetInstance() : ClassInstance<InstanceType>;

  /** Método que permite cerrar la conección con la base de datos */
  CloseConnection() : Promise<void>;

}