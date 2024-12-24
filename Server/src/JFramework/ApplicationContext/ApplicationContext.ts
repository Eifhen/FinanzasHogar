import { LogLevel, LogLevels } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import { Environment, EnvironmentStatus } from "../../JFramework/Utils/Environment";



interface ApplicationContextDependencies {
  /** Usuario logueado */
  user:any;

  /** Id del request en curso */
  request_id: string;
}

/**
 * Clase que maneja el contexto de ejecución la aplicación
 */
export default class ApplicationContext {


  /** Usuario Logueado */
  public user:any = {};

  /** Id de la request en curso */
  public request_id: string = "";

  /** Entorno de desarrollo actual. */
  public environment: Environment = process.env.NODE_ENV?.toUpperCase() as Environment ?? EnvironmentStatus.DEVELOPMENT;

  /** Indica el nivel de log definido en la aplicación, solo los logs mayor o igual a este nivel se podrán imprimir */
  public LogLevel: number = Number(process.env.LOG_LEVEL ?? LogLevels.INFO);
  
  // constructor(deps: ApplicationContextDependencies){
  //   this.user = deps.user;
  //   this.request_id = deps.request_id;
  // }

}