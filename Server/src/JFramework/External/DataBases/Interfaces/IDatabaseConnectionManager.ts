import { IConnectionService } from "../../../Configurations/Types/IConnectionService";






export default interface IDatabaseConnectionManager<ConfigurationType> extends IConnectionService {

  /** @description - Permite sobreescribir la configuración de conexión, originalmente se utilizan los datos de 
   * conexión proporcionados por el objeto de configuraciones, según el ambiente de conexión. 
   * Pero este método nos permite configurar nuestros datos de conexión de forma manual */
  SetConnectionConfiguration(data: ConfigurationType): IDatabaseConnectionManager<ConfigurationType>;

  /** Permite setear la estrategia de conexión según la configuración. 
   * Retorna la instancia del manager */
  SetConnectionStrategy() : IDatabaseConnectionManager<ConfigurationType>;

	/** Realiza la conección a la base de datos */
  Connect() : Promise<void>;

  /** Cierra la conección a la base de datos */
  Disconnect() : Promise<void>;

}