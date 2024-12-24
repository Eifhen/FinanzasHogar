
import ServerConfig from "../../Configurations/ServerConfig";
import ServiceManager from "../../../JFramework/Managers/ServiceManager";



export default interface IStartupBuilder {

  /** Permite manipular la configuración del servidor */
  Configuration(serverConfig: ServerConfig): void;

  /** Permite manipular los servicios del sistema */
  ConfigurationServices(services:ServiceManager): void;

  /** Este método se ejecuta cuando ocurre un error critico/fatal en el sistema */
  OnApplicationCriticalException(data:any): void;

}