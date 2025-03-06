import { RedisClientType, createClient } from "redis";
import IContainerManager from "../../_Internal/Interfaces/IContainerManager";
import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IConfigurationSettings from "../../Configurations/Types/IConfigurationSettings";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { EnvironmentStatus } from "../../Utils/Environment";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import ICacheConnectionManager from "./Interfaces/ICacheConnectionManager";


interface CacheManagerDependencies {
	configurationSettings: ConfigurationSettings;
	containerManager: IContainerManager;
}

/** Se conecta al servidor de caché y agrega un singleton 
 * con dicha conección al contenedor de dependencias*/
export default class CacheConnectionManager implements ICacheConnectionManager {

	/** Logger */
	private readonly _logger = new LoggerManager({
		entityCategory: LoggEntityCategorys.MANAGER,
		entityName: "CacheManager"
	})

	/** Contenedor de dependencias */
	private readonly _containerManager: IContainerManager;

	/** Configuraciones de la aplicación */
	private readonly _configurationSettings: IConfigurationSettings;

	/** Cliente caché */
	private _cacheClient: RedisClientType<any, any, any> | null = null;

	constructor(deps: CacheManagerDependencies) {
		this._containerManager = deps.containerManager;
		this._configurationSettings = deps.configurationSettings;
	}

	/** Permite crear el cliente de Redis para manejar el cache */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("CreateClient");

			const environment = this._configurationSettings.environment;
			let redisClient;

			/** Conectamos al cliente de redis */
			if (environment === EnvironmentStatus.DEVELOPMENT) {
				redisClient = createClient();
			}
			else {
				redisClient = createClient({
					url: this._configurationSettings.cacheConfig.url,
					username: this._configurationSettings.cacheConfig.userName,
					password: this._configurationSettings.cacheConfig.password,
					database: this._configurationSettings.cacheConfig.databaseNumber,
					name: this._configurationSettings.cacheConfig.clientName
				});
			}

			/** Manejamos cualquier evento de error */
			redisClient.on("error", (err) => {
				this._logger.Error("ERROR", "CreateClientEvent", new ApplicationException(
					"CreateClientEvent",
					HttpStatusName.InternalServerError,
					err.message,
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
					err
				));
			});

			/** logueamos cuando la conección se realiza exitosamente */
			redisClient.on("connect", (data) => {
				this._logger.Message("INFO", "RedisClient Connected", data);
			})

			/** Iniciamos la conección */
			redisClient.connect().catch(err => {
				this._logger.Error("ERROR", "RedisClient Connection", err);
			});

			/** Agregamos el cliente caché al contenedor de dependencias */
			this._containerManager.AddInstance<RedisClientType<any, any, any>>("cacheClient", redisClient);

		}
		catch (err: any) {
			this._logger.Error("ERROR", "CreateClient", err);
			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"CreateClient",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			)
		}
	}

	/** Permite desconectar el cliente cache */
	public async Disconnect(): Promise<void> {
		try {
			this._logger.Activity("Disconnect");

			if (this._cacheClient) {
				await this._cacheClient.disconnect();
			}
			else {
				this._logger.Message("ERROR", "No ha sido posible desconectar el servicio de cache, el cacheClient no está definido");
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Disconnect", err);
			throw new ApplicationException(
				"AddService",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

}


