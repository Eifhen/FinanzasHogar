import IServiceManager from "./IServiceManager";
import ConfigurationSettings from '../../Configurations/ConfigurationSettings';

export default interface IStartup {

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

}