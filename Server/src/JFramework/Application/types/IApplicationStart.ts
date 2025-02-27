
import ServerConfig from "../../Configurations/ServerConfig";
import { ApplicationResolver } from "../../Configurations/types/ServerTypes";
import ServiceManager from "../../Managers/ServiceManager";



export default interface IApplicationStart {

  /** Permite manipular la configuración del servidor */
  Configuration(serverConfig: ServerConfig): Promise<void>;

  /** Permite manipular los servicios del sistema */

  ConfigurationServices(services:ServiceManager): Promise<void>;

  /** Este método se ejecuta cuando ocurre un error critico/fatal en el sistema */
  OnApplicationCriticalException(data:any, services:ServiceManager): void;

}