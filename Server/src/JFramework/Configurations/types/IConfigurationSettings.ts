import { ConnectionConfiguration } from "tedious";
import { Environment } from "../../Utils/Environment";



/** Esta interrfaz mapea los datos del objeto ENV del ecosystem */
export default interface IConfigurationSettings {

  /** Nombre de la aplicación  
   * @example - HomeBudget */
  appName: string;

  /** Nombre de la aplicación en un formato más bonito 
   * @example- Home Budget */
  appPrettyName: string;

  /** Puerto en el cual se ejecuta la aplicación */
  port: number;

  /** Environment actual
   * @example - production | development */
  environment: Environment;

  /** Objeto que contiene algunos datos de aplicación */
  apiData: ApiData;

  /** objeto que contiene los datos de conección a la base de datos */
  databaseConnectionData: DatabaseConnectionData;

  /** Objeto de configuración de conección 
   * @description
   * - `sqlConnectionConfig` - Objeto de connección a sql server */
  databaseConnectionConfig: DatabaseConnectionConfig;

  /** Proveedores para almacenamiento de archivos */
  fileProvider: IFileProviderConfig

  /** Objeto de configuración de proveedores de email */
  emailProviderConfig: IEmailProviderConfig;
}

/** Datos de API */
export interface ApiData {
  /** Clave de aplicación */
  apiKey: string;

  /** Contiene los headers custom de la aplicación */
  headers: ApplicationHeaders;

  /** Token de aplicación */
  tokenKey: string;

  /** Version de la aplicación */
  version: number

  /** Ruta base de la aplicación */
  baseRoute:string;

  /** Path a la carpeta de controllers */
  controllersPath: string;

  /** Nivel de log */
  logLevel: number;

  /** Imagenes por defecto  */
  defaultImages: ApplicationImages;

  /** Configuración de estilos de aplicación */
  styleConfig: ApplicationStyleConfig;

  /** Objeto que contiene las rutas para realizar distintas operaciones en el sistema */
  appLinks: ApplicationLinks;
}

/** Contiene la configuración de estilos de la aplicación */
export interface ApplicationStyleConfig {
  /** Color primario de la aplicación */
  primaryColor: string;
}

/** Contiene los headers custom que se utilizan en los request de la aplicación */
export interface ApplicationHeaders {
  /** Nombre del header en la request, que contiene el apiKey */
  apiKeyHeader: string; 

  /** Nombre del header que maneja el idioma de la aplicación */
  langHeader: string;
}

/** Objeto que contiene las rutas para realizar distintas operaciones en el sistema */
export interface ApplicationLinks {

  /** Ruta base */
  baseRoute: string;

  /** Ruta para activación de cuentas */
  accountActivation: string;
}

/** Imagenes por defecto de la aplicación */
export interface ApplicationImages {
  APP_LOGO: string;
  PORTFOLIO_LOGO: string;
  BLACK_WAVE: string;
}

/** Objeto de configuración de conección a base de datos */
export interface DatabaseConnectionData {
  /** Nombre de usuario de la base de datos */
  userName: string;

  /** Contraseña de usuario */
  password: string;
  
  /** Nombre del dominio de la base de datos */
  domain: string;

  /** Nombre del servidor */
  server: string;

  /** Nombre de la base de datos */
  databaseName: string;

  /** Puerto de la base de datos */
  port: string;

  /** Nombre de la instancia */
  instance: string;

  /** Timeout de conección */
  connectionTimeout: number;
}

/** Objeto de connección a base de datos */
export interface DatabaseConnectionConfig {
  /** Objeto de connección a sql */
  sqlConnectionConfig: ConnectionConfiguration
}

/** Objeto de configuración de proveedores de archivos */
export interface IFileProviderConfig {

  /** Nombre del actual proveedor */
  currentProviderName: string;

  /** Proveedor actual */
  currentProvider: FileProvider;

  /** Proveedores */
  providers: FileProvider[];
}

/** Representa un FileProvider */
export type FileProvider = {
  /** Nombre del proveedor */
  name: string;

  /** Datos del proveedor */
  data: FileProviderData;
}

/** Objeto con datos relevantes para acceder al proveedr de cloudinary */
export type FileProviderData = {
  
  /** Nombre de usuario */
  cloud_name: string;

  /** ApiKey para acceder a cloudianry */
  api_key: string;

  /** ApiSecret para acceder a cloudinary */
  api_secret: string;

  /** Nombre del folder principal */
  mainFolder: string;

  /** Nombre de la carpeta de usuario */
  usersFolder: string;

  /** Nombre de la carpeta de recursos */
  assetsFolder: string;

  /** Tamaño máximo de video */
  maxVideoSize: string;

  /** Tamaño máximo de archivo */
  maxFileSize: string;
}

export interface IEmailProviderConfig {
  currentProvider: EmailProvider;
  currentProviderName: string;
  providers:EmailProvider[];
}

export type EmailProvider = {
  service: string;
  auth: {
    user: string,
    pass: string
  }
}
