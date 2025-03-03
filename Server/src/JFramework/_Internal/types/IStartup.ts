import ServerConfig from "../../Configurations/ServerConfig";
import ServiceManager from "../ServiceManager";




export default interface IStartup {

  /** Agrega la configuración del servidor
  * Se encarga de inicializar el ApplicationContext */
  AddConfiguration(services:ServiceManager, config?:ServerConfig) : Promise<void>;

  /** Agrega la configuración de seguridad del servidor */
  AddSecurityConfiguration(services:ServiceManager) : Promise<void>;

  /** Agrega los middlewares globales del negocio */
  AddBusinessMiddlewares(services:ServiceManager) : Promise<void>;

  /** Se agregan los repositorios del negocio */
  AddBusinessRepositories(services:ServiceManager) : Promise<void>;

  /** Se agregan los servicos del negocio */
  AddBusinessServices(services:ServiceManager) : Promise<void>;

}