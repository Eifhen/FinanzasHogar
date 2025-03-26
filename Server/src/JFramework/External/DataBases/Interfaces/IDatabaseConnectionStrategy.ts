import { ConnectionEnvironment } from "../../../Configurations/Types/IConnectionService";
import { ClassInstance } from "../../../Utils/Types/CommonTypes";




export default interface IDatabaseConnectionStrategy<ConnectionType, InstanceType, ConfigurationType> {

  /** @description - Permite sobreescribir la configuración de conexión, originalmente se utilizan los datos de 
   * conexión proporcionados por el objeto de configuraciones, según el ambiente de conexión. 
   * Pero este método nos permite configurar nuestros datos de conexión de forma manual */
  SetConnectionConfiguration(data: ConfigurationType): void

  /** Método que permite setear el ambiente de conexión */
  SetConnectionEnvironment(env: ConnectionEnvironment): void;

  /** Método que ejecuta la connección con la base de datos */
  Connect(): Promise<ConnectionType>;

  /** Retorna una instancia de la base de datos */
  GetInstance(): ClassInstance<InstanceType>;

  /** Método que permite cerrar la conección con la base de datos */
  CloseConnection(): Promise<void>;

}