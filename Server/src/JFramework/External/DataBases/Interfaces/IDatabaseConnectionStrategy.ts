import ApplicationContext from "../../../Configurations/ApplicationContext";
import { ClassInstance } from "../../../Utils/Types/CommonTypes";
import { ConnectionStrategyData } from "../Types/DatabaseType";




/** Dependencias básicas de una estrategia de conección */
export interface IDatabaseConnectionStrategyBaseDependencies {
  applicationContext: ApplicationContext;
  connectionOptions: ConnectionStrategyData;
}

export default interface IDatabaseConnectionStrategy<ConnectionType, InstanceType> {


  /** Método que ejecuta la connección con la base de datos */
  Connect(): Promise<ConnectionType>;

  /** Retorna una instancia de la base de datos */
  GetInstance(): ClassInstance<InstanceType>;

  /** Método que permite cerrar la conección con la base de datos */
  CloseConnection(): Promise<void>;

}