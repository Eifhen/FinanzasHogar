import { createClient, RedisClientType } from "redis";
import ApplicationContext from "../Application/ApplicationContext";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import ICacheConnectionManager from "./Interfaces/ICacheConnectionManager";
import { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { EnvironmentStatus } from '../Utils/Environment';





interface CacheManagerDependencies {
	applicationContext: ApplicationContext;
}

export default class CacheConnectionManager implements ICacheConnectionManager {

	/** Logger */
	private readonly _logger = new LoggerManager({
		entityCategory: LoggEntityCategorys.MANAGER,
		entityName: "CacheManager"
	})

	/** Contexto de aplicacion */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: CacheManagerDependencies) {
		this._applicationContext = deps.applicationContext;
	}


	/** Permite crear el cliente de Redis para manejar el cache */
	public Connect(): RedisClientType<any, any, any> {
		try {
			this._logger.Activity("CreateClient");

			const environment = this._applicationContext.settings.environment;
			let redisClient;

			/** Conectamos al cliente de redis */
			if (environment === EnvironmentStatus.DEVELOPMENT) {
				redisClient = createClient();
			}
			else {
				redisClient = createClient({
					url: this._applicationContext.settings.cacheConfig.url,
					username: this._applicationContext.settings.cacheConfig.userName,
					password: this._applicationContext.settings.cacheConfig.password,
					database: this._applicationContext.settings.cacheConfig.databaseNumber,
					name: this._applicationContext.settings.cacheConfig.clientName
				});
			}

			redisClient.on("error", (err) => {
				this._logger.Error("ERROR", "CreateClientEvent", new InternalServerException(
					"CreateClientEvent",
					err.message,
					this._applicationContext,
					__filename,
					err
				)
				);
			});

			redisClient.on("connect", (data) => {
				this._logger.Message("INFO", "RedisClient Connected =>", data);
			})

			redisClient.connect().catch(err=> {
				this._logger.Error("ERROR", "Connect", err);
			});

			return redisClient;
		}
		catch (err: any) {
			this._logger.Error("ERROR", "CreateClient", err);
			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"CreateClient",
				err.message,
				this._applicationContext,
				__filename,
				err
			)
		}
	}

}


