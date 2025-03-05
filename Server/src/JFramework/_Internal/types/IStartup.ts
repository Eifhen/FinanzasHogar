import ServerConfig from "../ServerConfig";
import IServiceManager from "./IServiceManager";





export default interface IStartup {

  /** Agrega la configuración del servidor
  * Se encarga de inicializar el ApplicationContext */
  AddConfiguration(services:IServiceManager, config?:ServerConfig) : Promise<void>;

  /** Agrega la configuración de seguridad del servidor */
  AddSecurityConfiguration(services:IServiceManager) : Promise<void>;

  /** Agrega los middlewares globales del negocio */
  AddBusinessMiddlewares(services:IServiceManager) : Promise<void>;

  /** Se agregan los repositorios del negocio */
  AddBusinessRepositories(services:IServiceManager) : Promise<void>;

  /** Se agregan los servicos del negocio */
  AddBusinessServices(services:IServiceManager) : Promise<void>;

}