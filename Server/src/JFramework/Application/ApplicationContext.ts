import { ApplicationSQLDatabase } from "../../Infraestructure/DataBase";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import { ApplicationLenguage, ApplicationLenguages } from "./types/types";



interface ApplicationContextDependencies {
 database: ApplicationSQLDatabase;
 configurationSettings: ConfigurationSettings;
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
  

  /** Instancia de la base de datos */
  public database: ApplicationSQLDatabase;

  /** Contiene el lenguaje disponible en la aplicación */
  public lang: ApplicationLenguage = ApplicationLenguages.en;

  /** Objeto de configuración de la aplicación */
  public settings: ConfigurationSettings;
  
  constructor(deps: ApplicationContextDependencies){
    this.database = deps.database;
    this.settings = deps.configurationSettings;
  }
}