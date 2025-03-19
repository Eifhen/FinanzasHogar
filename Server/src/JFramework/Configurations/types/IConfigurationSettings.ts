import { ConnectionConfiguration } from "tedious";
import { Environment } from "../../Utils/Environment";
import { DatabaseType } from "../../DataBases/Types/DatabaseType";
import { CloudStorageProviders } from "../../CloudStorage/Types/CloudStorageProviders";


/** Configuración de seguridad */
export type SecurityConfig = {
  /** Origenes permitidos por el cors */
  allowedOrigins: string | string[];

}

/** Datos de configuración de caché */
export type CacheClientConfig = {
  /** Ruta para conectarse al servidor de redis */
  url:string;

  /** Usuario de redis */
  userName: string,
  
  /** Contraseña de usuario */
  password: string,

  /** Nombre base de datos */
  databaseNumber: number,

  /** Nombre del cliente */
  clientName: string,
}

/** Objeto con los datos para el proveedor de emails */
export type EmailProvider = {
  service: string;
  auth: {
    user: string,
    pass: string
  }
}

/** Objeto de configuración de proveedores de email */
export type EmailProviderConfig = {
  currentProvider: EmailProvider;
  currentProviderName: string;
  providers:EmailProvider[];
}

/** Objeto con datos relevantes para acceder al proveedr de cloudinary */
export type CloudProviderData = {
  
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

/** Representa un FileProvider */
export type CloudProvider = {
  /** Nombre del proveedor */
  name: CloudStorageProviders | "";

  /** Datos del proveedor */
  data: CloudProviderData;
}

/** Objeto de configuración de proveedores de archivos */
export type CloudProviderConfig = {

  /** Nombre del actual proveedor */
  currentProviderName: string;

  /** Proveedor actual */
  currentProvider: CloudProvider;

  /** Proveedores */
  providers: CloudProvider[];
}

/** Objeto de connección a base de datos */
export type DatabaseConnectionConfig = {
  /** Objeto de connección a sql */
  sqlConnectionConfig: ConnectionConfiguration
}

/** Objeto de configuración de conección a base de datos */
export type DatabaseConnectionData = {

  /** Tipo de base de datos o a Aqué */
  type: DatabaseType;

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

  /** Cadena de conección */
  connectionString: string;

  /** Timeout de conección */
  connectionTimeout: number;

  /** Tamaño minimo del connection pool */
  connectionPoolMinSize: number;
  
  /** Tamaño maximo del connection pool */
  connectionPoolMaxSize: number;
}

/** Imagenes por defecto de la aplicación */
export type ApplicationImages = {
  APP_LOGO: string;
  PORTFOLIO_LOGO: string;
  BLACK_WAVE: string;
}

/** Objeto que contiene las rutas para realizar distintas operaciones en el sistema */
export type ApplicationLinks = {

  /** Ruta base */
  baseRoute: string;

  /** Ruta para activación de cuentas */
  accountActivation: string;
}

/** Contiene los headers custom que se utilizan en los request de la aplicación */
export type ApplicationHeaders = {
  /** Nombre del header en la request, que contiene el apiKey */
  apiKeyHeader: string; 

  /** Nombre del header que maneja el idioma de la aplicación */
  langHeader: string;

  /** Nombre del header que maneja los tokens csrf */
  csrfTokenHeader: string;

  /** Nombre del header que maneja el token csrf 
   * publico para uso del patrón "double submit cookie" */
  csrfTokenClientHeader: string;

  /** Nombre del header donde se espera el token JWT */
  jwtTokenHeader: string;
}

/** Contiene la configuración de estilos de la aplicación */
export type ApplicationStyleConfig = {
  /** Color primario de la aplicación */
  primaryColor: string;
}

/** Datos de API */
export type ApiData = {
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

  /** Objeto de configuración de proveedores de email */
  emailProviderConfig: EmailProviderConfig;

  /** Proveedores para almacenamiento de archivos */
  cloudProvider: CloudProviderConfig

  /** Configuracion de cache */
  cacheConfig: CacheClientConfig;

  /** Configuración de seguridad */
  securityConfig: SecurityConfig;

}