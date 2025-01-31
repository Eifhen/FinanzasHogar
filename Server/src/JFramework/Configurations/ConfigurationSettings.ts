import { LogLevels } from "../Managers/Interfaces/ILoggerManager";
import { Environment, EnvironmentStatus } from "../Utils/Environment";
import IConfigurationSettings, { ApiData, ApplicationImages, DatabaseConnectionData, DatabaseConnectionConfig, IEmailProviderConfig, IFileProviderConfig, IEmailProvider, ApplicationStyleConfig } from "./types/IConfigurationSettings";




/** Objeto de configuración */
export default class ConfigurationSettings implements IConfigurationSettings {

  /** Nombre de la aplicación */
  appName: string;

  /** Nombre de la aplicación */
  appPrettyName: string;

  /** Puerto de la aplicación */
  port: number;

  /** Environment actual */
  environment: Environment;

  /** Data relevante al api */
  apiData: ApiData;


  /** Datos de connección a la base de datos */
  databaseConnectionData: DatabaseConnectionData;

  /** Objeto de conneccion a base de datos */
  databaseConnectionConfig: DatabaseConnectionConfig;

  /** Proveedores de email */
  emailProviderConfig: IEmailProviderConfig;

  /** Proveedores de almacenamiento de archivos */
  fileProviders: IFileProviderConfig

  constructor() {
    this.appName = process.env.APP_NAME ?? "";
    this.appPrettyName = process.env.APP_NAME_PRETTY ?? "";
    this.port = Number(process.env.PORT ?? 0);
    this.environment = process.env.NODE_ENV?.toUpperCase() as Environment ?? EnvironmentStatus.DEVELOPMENT;
    this.apiData = this.GetApiData();
    this.emailProviderConfig = this.GetEmailProviders();
    this.fileProviders = this.GetFileProviders();
    this.databaseConnectionData = this.GetDataBaseConnectionData();
    this.databaseConnectionConfig = this.GetDatabaseConnectionConfig();
  }

  /** Retorna el nivel de log de la aplicación */
  private GetLogLevel = (): number => {
    let logLevel: number = 0;
    const envLogLevel = process.env.LOG_LEVEL ?? "";
    if (envLogLevel && Object.keys(LogLevels).includes(envLogLevel)) {
      logLevel = LogLevels[envLogLevel as keyof typeof LogLevels];
    } else {
      logLevel = LogLevels.INFO; // Valor por defecto
    }
    return logLevel;
  }

  /** Obtiene las imagenes por defecto de la aplicación */
  private GetDefaultImages = (): ApplicationImages => {
    const images: ApplicationImages = JSON.parse(process.env.APPLICATION_IMAGES ?? "");
    return images;
  }

  /** Obtiene la configuración de estilos de la aplicación */
  private GetApplicationStyleConfig = () : ApplicationStyleConfig => {
    const styles = JSON.parse(process.env.APPLICATION_STYLES ?? "");
    return {
      primaryColor: styles.PRIMARY_COLOR
    } as ApplicationStyleConfig;
  }

  /** Retorna un objeto con los datos del api */
  private GetApiData = (): ApiData => {
    return {
      /** Clave de aplicación */
      apiKey: process.env.API_KEY ?? "",

      /** Nombre del header en la request, que contiene el apiKey */
      apiKeyHeader: process.env.API_KEY_HEADER ?? "",

      /** Token de aplicación */
      tokenKey: process.env.TOKEN_KEY ?? "",

      /** Version de la aplicación */
      version: Number(process.env.API_VERSION ?? 0),

      /** Ruta base de la aplicación */
      baseRoute: process.env.API_BASE_ROUTE ?? "",

      /** Path a la carpeta de controllers */
      controllersPath: process.env.CONTROLLERS ?? "",

      /** Nivel de log */
      logLevel: this.GetLogLevel(),

      /** Imagenes del servidor */
      defaultImages: this.GetDefaultImages(),

      /** Configuración de estilos de la aplicación */
      styleConfig: this.GetApplicationStyleConfig()

    } as ApiData;
  }

  /** Obtiene el listado de proveedores de Email */
  private GetEmailProviders = (): IEmailProviderConfig => {

    const emailProvidersData = JSON.parse(process.env.EMAIL_CONFIG ?? "");
    const providers = emailProvidersData.providers as IEmailProvider[];

    /** Obtiene el proveedor actual de la lista de proveedores */
    const getCurrentProvider = (): IEmailProvider => {
      const find = providers.find(m => m.service === emailProvidersData.currentProvider);
      const empty: IEmailProvider = {
        service: "",
        auth: {
          user: "",
          pass: ""
        }
      }
      return find ? find : empty;
    }

    return {
      currentProviderName: emailProvidersData.currentProvider,
      currentProvider: getCurrentProvider(),
      providers
    } as IEmailProviderConfig
  }

  /** Obtiene los proveedores de manejo de archivo */
  private GetFileProviders = (): IFileProviderConfig => {
    const providers = JSON.parse(process.env.IMAGE_PROVIDER ?? "") as IFileProviderConfig;
    return providers;
  }

  /** Obtiene los datos de connección a la base de datos */
  private GetDataBaseConnectionData = (): DatabaseConnectionData => {
    const dbConfig = JSON.parse(process.env.DATABASE ?? "");

    return {
      /** Nombre de usuario de la base de datos */
      userName: dbConfig.USERNAME,

      /** Contraseña de usuario */
      password: dbConfig.PASSWORD,

      /** Nombre del dominio de la base de datos */
      domain: dbConfig.DOMAIN,

      /** Nombre del servidor */
      server: dbConfig.SERVER,

      /** Nombre de la base de datos */
      databaseName: dbConfig.NAME,

      /** Puerto de la base de datos */
      port: dbConfig.PORT,

      /** Nombre de la instancia */
      instance: dbConfig.INSTANCE,

      /** Timeout de conección */
      connectionTimeout: dbConfig.CONNECTION_TIMEOUT,
    } as DatabaseConnectionData;
  }

  /** Devuelve un objeto, con los objeto de connección a las bases de datos disponibles */
  private GetDatabaseConnectionConfig = (): DatabaseConnectionConfig => {
    return {
      /** Objeto de connección a sql server */
      sqlConnectionConfig: {
        server: this.databaseConnectionData.server ?? "",
        options: {
          database: this.databaseConnectionData.databaseName ?? "",
          instanceName: this.databaseConnectionData.instance ?? "",
          // port: Number(process.env.DB_PORT ?? 0),
          trustServerCertificate: true,
          // Aborta cualquier transacción automaticamente si ocurre un error en sql.
          abortTransactionOnError: true,
          // The number of milliseconds before the attempt to connect is considered failed (default: 15000).
          connectTimeout: this.databaseConnectionData.connectionTimeout ?? 3000,
        },
        authentication: {
          type: 'default',
          options: {
            userName: this.databaseConnectionData.userName ?? "",
            password: this.databaseConnectionData.password ?? "",
            //domain: process.env.DB_DOMAIN ?? "",
          },
        }
      }
    } as DatabaseConnectionConfig;
  }

}