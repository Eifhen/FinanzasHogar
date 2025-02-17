import { ApplicationSQLDatabase } from "../../Infraestructure/DataBase";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import TranslatorHandler from "../Translations/TranslatorHandler";
import { ApplicationLenguage, ApplicationLenguages } from "./types/types";


/*** Clase que maneja el contexto de ejecución la aplicación */
export default class ApplicationContext {

  /** Usuario Logueado */
  public user:any = {};

  /** Id de la request en curso */
  public requestID: string = "";

  /** Ip del request en curso */
  public ipAddress: string = "";
  
  /** Contiene el lenguaje disponible en la aplicación  (esto nos llega en la request)*/
  public lang: ApplicationLenguage = ApplicationLenguages.en;

  /** Objeto de configuración de la aplicación */
  public settings: ConfigurationSettings; 

  /** Tranductor */
  public translator: TranslatorHandler;
  
  constructor(){
    this.translator = new TranslatorHandler({ applicationContext: this })
    this.settings = new ConfigurationSettings();
  }
}