import { LogLevel, LogLevels } from "../Managers/Interfaces/ILoggerManager";
import { Environment, EnvironmentStatus } from "../Utils/Environment";



interface ApplicationContextDependencies {
  /** Usuario logueado */
  user:any;

  /** Id del request en curso */
  requestID: string;

  /** Ip del request en curso */
  ipAddress: string;
}

/**
 * Clase que maneja el contexto de ejecución la aplicación
 */
export default class ApplicationContext {


  /** Usuario Logueado */
  public user:any = {};

  /** Id de la request en curso */
  public requestID: string = "";

  /** Ip del request en curso */
  public ipAddress: string = "";

  /** Entorno de desarrollo actual. */
  public environment: Environment = process.env.NODE_ENV?.toUpperCase() as Environment ?? EnvironmentStatus.DEVELOPMENT;

  /** Indica el nivel de log definido en la aplicación, solo los logs mayor o igual a este nivel se podrán imprimir */
  public LogLevel: LogLevel;
  
  constructor(){
    const envLogLevel = process.env.LOG_LEVEL;
    if (envLogLevel && Object.keys(LogLevels).includes(envLogLevel)) {
      this.LogLevel = LogLevels[envLogLevel as keyof typeof LogLevels];
    } else {
      this.LogLevel = LogLevels.INFO; // Valor por defecto
    }
  }
}