import IServiceManager from "./IServiceManager";
import ConfigurationSettings from '../../Configurations/ConfigurationSettings';
import IServerConfigurationManager from "./IServerConfigurationManager";

export default interface IStartup {

  /** Agrega la configuración del servidor
  * Se encarga de inicializar el ApplicationContext */
  AddConfiguration() : Promise<void>;

  /** Agrega la configuración de seguridad del servidor */
  AddSecurityConfiguration() : Promise<void>;

  /** Agrega los middlewares globales del negocio */
  AddBusinessMiddlewares() : Promise<void>;

  /** Se agregan los repositorios del negocio */
  AddBusinessRepositories() : Promise<void>;

  /** Se agregan los servicos del negocio */
  AddBusinessServices() : Promise<void>;

}


export interface IStartupDependencies {
  /** Manejador de servicios */
  serviceManager: IServiceManager;

  /** configuración del sistema */
  configurationSettings: ConfigurationSettings;

  /** Configuración del servidor */
  serverConfigurationManager: IServerConfigurationManager;
}