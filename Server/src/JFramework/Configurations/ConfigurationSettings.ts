import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";
import { LogLevels } from "../Managers/Interfaces/ILoggerManager";
import { DEFAULT_API_VERSION, DEFAULT_PORT } from "../Utils/const";
import { Environment } from "../Utils/Environment";
import IConfigurationSettings, {
	ApiData,
	ApplicationImages,
	DatabaseConnectionData,
	EmailProviderConfig,
	CloudProviderConfig,
	EmailProvider,
	ApplicationStyleConfig,
	CloudProvider,
	ApplicationHeaders,
	ApplicationLinks,
	CacheClientConfig,
	SecurityConfig,
	ApplicationCookies,
	DatabaseEnvironmentConnectionData,
	ControllersPath,
} from "./Types/IConfigurationSettings";


/** Objeto de configuración */
@AutoClassBinder
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

	/** Datos de conexión a la base de datos, por ejemplo username, password, connectionString */
	databaseConnectionData: DatabaseEnvironmentConnectionData;

	/** Proveedores de email */
	emailProviderConfig: EmailProviderConfig;

	/** Proveedores de almacenamiento de archivos */
	cloudProvider: CloudProviderConfig

	/** Configuracion de cache */
	cacheConfig: CacheClientConfig;

	/** Configuración de seguridad */
	securityConfig: SecurityConfig;

	constructor() {
		this.appName = process.env.APP_NAME ?? "";
		this.appPrettyName = process.env.APP_NAME_PRETTY ?? "";
		this.port = Number(process.env.PORT ?? DEFAULT_PORT);
		this.environment = process.env.NODE_ENV?.toUpperCase() as Environment ?? Environment.DEVELOPMENT;
		this.apiData = this.GetApiData();
		this.emailProviderConfig = this.GetEmailProviders();
		this.cloudProvider = this.GetCloudProviders();
		this.databaseConnectionData = this.GetDatabaseConnectionDataByEnvironment();
		this.cacheConfig = this.GetCacheConfig();
		this.securityConfig = this.GetSecurityConfig();
	}

	/** Retorna el nivel de log de la aplicación */
	private GetLogLevel(): number {
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
	private GetDefaultImages(): ApplicationImages {
		const images: ApplicationImages = JSON.parse(process.env.APPLICATION_IMAGES ?? "");
		return images;
	}

	/** Obtiene la configuración de estilos de la aplicación */
	private GetApplicationStyleConfig(): ApplicationStyleConfig {
		const styles = JSON.parse(process.env.APPLICATION_STYLES ?? "");
		return {
			primaryColor: styles.PRIMARY_COLOR
		} as ApplicationStyleConfig;
	}

	/** Retorna un objeto con los datos del api */
	private GetApiData(): ApiData {
		return {
			/** Clave de aplicación */
			apiKey: process.env.API_KEY ?? "",

			/** Token que identifica a la aplicación en la tabla de proyectos */
			proyect_token: process.env.PROYECT_TOKEN ?? "",

			/** Secreto del token de autenticación JWT */
			authTokenSecret: process.env.AUTH_TOKEN_SECRET ?? "",

			/** Version de la aplicación (API VERSION) */
			apiVersion: String(process.env.API_VERSION ?? DEFAULT_API_VERSION),

			/** Ruta base de la aplicación */
			baseRoute: process.env.API_BASE_ROUTE ?? "",

			/** Path a la carpeta de controllers */
			controllersPath: this.GetControllersPath(),

			/** Headers que se utilizan en la app */
			headers: this.GetHeaders(),

			/** Obtiene los nombres de las cookies del sistema */
			cookieData: this.GetCookieData(),

			/** Nivel de log */
			logLevel: this.GetLogLevel(),

			/** Imagenes del servidor */
			defaultImages: this.GetDefaultImages(),

			/** Configuración de estilos de la aplicación */
			styleConfig: this.GetApplicationStyleConfig(),

			/** Objeto que contiene las rutas para realizar distintas operaciones en el sistema */
			appLinks: this.GetApplicationLinks(),

		} as ApiData;
	}

	/** Obtiene los distintos paths para los controladores */
	private GetControllersPath(): ControllersPath {
		const data = JSON.parse(process.env.CONTROLLERS ?? "");

		return {
			internalControllersPath: data.INTERNAL_CONTROLLERS_PATH,
			businessControllersPath: data.BUSINESS_CONTROLLERS_PATH
		}
	}

	/** Obtiene los enlaces relevantes de la aplicación */
	private GetApplicationLinks(): ApplicationLinks {
		const data = JSON.parse(process.env.APPLICATION_LINKS ?? "");
		return {

			/** Ruta base  */
			baseRoute: data.BASE_ROUTE,

			/** Ruta para activación de cuentas */
			accountActivation: data.ACCOUNT_ACTIVATION
		} as ApplicationLinks
	}

	/** Obtiene los headers que se utilizan en la aplicación */
	private GetHeaders(): ApplicationHeaders {
		const data = JSON.parse(process.env.APPLICATION_HEADERS ?? "");

		return {
			/** Nombre del header en la request, que contiene el apiKey */
			apiKeyHeader: data.API_KEY_HEADER,

			/** Nombre del header en la request, que contiene el idioma */
			langHeader: data.LANG,

			/** Nombre del header en la request, que contiene el token CSRF */
			csrfTokenHeader: data.CSRF_TOKEN_HEADER,

			/** Nombre del header que maneja el token csrf 
				* publico para uso del patrón "double submit cookie" */
			csrfTokenClientHeader: data.CSRF_TOKEN_CLIENT_HEADER,

			/** Almacena el nombre del header que contiene el token JWT */
			jwtTokenHeader: data.JWT_TOKEN_HEADER,

			/** Nombre del header donde se espera el tenant token */
			tenantTokenHeader: data.TENANT_TOKEN_HEADER,

		} as ApplicationHeaders;
	}

	/** Obtiene los nombres de las cookies del sistema */
	private GetCookieData(): ApplicationCookies {
		const data = JSON.parse(process.env.APPLICATION_COOKIES ?? "");

		return {
			/** Nombre de la cookie para tokens csrf */
			csrfTokenCookie: data.CSRF_TOKEN_COOKIE,

		} as ApplicationCookies;
	}

	/** Obtiene el listado de proveedores de Email */
	private GetEmailProviders(): EmailProviderConfig {

		const emailProvidersData = JSON.parse(process.env.EMAIL_PROVIDERS ?? "");
		const providers = emailProvidersData.providers as EmailProvider[];

		/** Obtiene el proveedor actual de la lista de proveedores */
		const getCurrentProvider = (): EmailProvider => {
			const find = providers.find(m => m.service === emailProvidersData.currentProvider);
			const empty: EmailProvider = {
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
		} as EmailProviderConfig
	}

	/** Obtiene los proveedores de manejo de archivo */
	private GetCloudProviders(): CloudProviderConfig {
		const fileProvidersData = JSON.parse(process.env.CLOUD_PROVIDERS ?? "");
		const currentProviderName = fileProvidersData.currentProvider;
		const providers = fileProvidersData.providers as CloudProvider[];

		const getCurrentProvider = (): CloudProvider => {
			const find = providers.find(m => m.name === currentProviderName);
			const empty: CloudProvider = {
				name: "",
				data: {
					cloud_name: "",
					api_key: "",
					api_secret: "",
					mainFolder: "",
					usersFolder: "",
					assetsFolder: "",
					maxVideoSize: "",
					maxFileSize: ""
				}
			}
			return find ? find : empty;
		}

		return {
			currentProvider: getCurrentProvider(),
			currentProviderName,
			providers
		} as CloudProviderConfig;
	}

	/** Obtener la configuración de cache */
	private GetCacheConfig(): CacheClientConfig {
		const config = JSON.parse(process.env.CACHE_CLIENT ?? "");
		return {
			url: config.url,
			userName: config.userName,
			password: config.password,
			clientName: config.clientName,
			databaseNumber: config.databaseNumber
		}
	}

	/** Obtiene la configuración de seguridad */
	private GetSecurityConfig(): SecurityConfig {

		const config = JSON.parse(process.env.SECURITY ?? "");
		return {
			allowedOrigins: config.allowedOrigins,
		}
	}

	/** Obtiene los datos de connección según el ambiente */
	private GetDatabaseConnectionData(dbConfig: any): DatabaseConnectionData {
		return {
			/** Tipo de base de datos */
			type: dbConfig.TYPE,

			/** Cadena de conección */
			connectionString: dbConfig.CONNECTION_STRING,

			/** Timeout de conección */
			connectionTimeout: dbConfig.CONNECTION_TIMEOUT,

			/** Tamaño minimo del connection pool */
			connectionPoolMinSize: dbConfig.CONNECTION_POOL_MIN_SIZE,

			/** Tamaño maximo del connection pool */
			connectionPoolMaxSize: dbConfig.CONNECTION_POOL_MAX_SIZE,
		}
	}

	/** Obtiene los datos de connección a la base de datos según 
	 * el ambiente de conección 
	 * - internal = base de datos del framework
	 * - business = base de datos del negocio*/
	private GetDatabaseConnectionDataByEnvironment(): DatabaseEnvironmentConnectionData {
		const dbConfig = JSON.parse(process.env.DATABASE ?? "");

		/** Clave secreta para desencriptar la cadena de conección de los tenants  */
		const tenantConnectionSecret = dbConfig.TENANT_CONNECTION_SECRET;

		/** Indica si la app es multi-tenants o no */
		const isMultitenants = dbConfig.MULTI_TENANTS;

		/** Representa los datos de conección para la base de datos de uso interno */
		const internal = dbConfig.CONNECTIONS.INTERNAL_CONNECTION;

		/** Representa los datos de conección para la base de datos del negocio */
		const business = dbConfig.CONNECTIONS.BUSINESS_CONNECTION;
		
		/** Indica las rutas que son excluidas por el middleware de manejo de tenants */
		const tenantExcludedRoutes = dbConfig.TENANT_EXCLUDED_ROUTES ?? [];

		return {
			isMultitenants,
			tenantConnectionSecret,
			tenantExcludedRoutes,
			connections: {
				internal: this.GetDatabaseConnectionData(internal),
				business: this.GetDatabaseConnectionData(business)
			}
		} as DatabaseEnvironmentConnectionData;
	}


}