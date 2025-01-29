import { ApplicationSQLDatabase } from "../../Infraestructure/DataBase";
import { APPLICATION_IMAGES } from "../Configurations/AppImagesConfig";
import { EmailProviderConfig } from "../Configurations/EmailProviderConfig";
import { LogLevel, LogLevels } from "../Managers/Interfaces/ILoggerManager";
import { Environment, EnvironmentStatus } from "../Utils/Environment";
import { IApplicationData } from "./types/IApplicationData";
import { ApplicationLenguage, ApplicationLenguages } from "./types/types";



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

  /** Instancia de la base de datos */
  public database: ApplicationSQLDatabase;

  /** Contiene el lenguaje disponible en la aplicación */
  public lang: ApplicationLenguage = ApplicationLenguages.en;
  
  /** Datos de aplicación */
  public applicationData: IApplicationData;
  
  constructor(db: ApplicationSQLDatabase){

    this.database = db;
    this.applicationData = {
      lang: ApplicationLenguages.en,
      images: APPLICATION_IMAGES,
      emailProvider: new EmailProviderConfig().currentProvider,
    }

    const envLogLevel = process.env.LOG_LEVEL;
    if (envLogLevel && Object.keys(LogLevels).includes(envLogLevel)) {
      this.LogLevel = LogLevels[envLogLevel as keyof typeof LogLevels];
    } else {
      this.LogLevel = LogLevels.INFO; // Valor por defecto
    }
  }
}