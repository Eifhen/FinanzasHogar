import ApplicationContext from "../../../Configurations/ApplicationContext";
import { InternalServerException } from "../../../ErrorHandling/Exceptions";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { ConnectionEntity, DatabaseConnectionManagerOptions, DatabaseType } from "../Types/DatabaseType";
import MssqlConnectionStrategy from "./MssqlConnectionStrategy";
import PostgreSqlConnectionStrategy from "./PostgreSqlConnectionStrategy";



interface IDatabaseStrategyDirectorDependencies {
	applicationContext: ApplicationContext;
}

/** Clase que nos permite cambiar estrategias de conexión a la base de datos */
export default class DatabaseStrategyDirector {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: IDatabaseStrategyDirectorDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "STRATEGY DIRECTOR",
			entityName: "DatabaseConnectionStrategySwitcher"
		});

		this._applicationContext = deps.applicationContext;
	}

	/** Nos permite obtener una estrategia de conexión */
	public GetConnectionStrategy<DataBaseEntity>(connectionOptions: DatabaseConnectionManagerOptions): ConnectionEntity {
		try {
			this._logger.Activity("GetConnectionStrategy");

			/** Seteamos una entidad de conexión sin estrategía */
			const entity: ConnectionEntity = {
				strategy: null,
				options: connectionOptions
			}

			/** Obtenemos la configuración desde el applicationContext */
			const configuration = this._applicationContext.settings;
			
			/** Obtenemos los datos de conexión ya sea del options o de los datos de configuración definidos */
			const connectionData = entity.options.connectionData ?? configuration.databaseConnectionData.connections[entity.options.connectionEnvironment];

			/** Ejecutamos una estrategía de conección según el tipo de 
			 * base de datos especificado en la configuración */
			switch (entity.options.databaseType) {
				case DatabaseType.ms_sql_database:
					/** Resolvemos la estrategía */
					entity.strategy = new MssqlConnectionStrategy<DataBaseEntity>({
						applicationContext: this._applicationContext,
						connectionOptions: {
							connectionEnvironment: entity.options.connectionEnvironment,
							connectionData
						}
					});
					break;
				case DatabaseType.postgre_sql_database:
					/** Resolvemos la estrategia */
					entity.strategy = new PostgreSqlConnectionStrategy<DataBaseEntity>({
						applicationContext: this._applicationContext,
						connectionOptions: {
							connectionEnvironment: entity.options.connectionEnvironment,
							connectionData,
						}
					});
					break;
				case DatabaseType.mongo_database:
					throw new Error("Estrategía de conexión No implementada");
				default:
					throw new Error(`La estrategía ${entity.options.databaseType as string} no está implementada`);
			}

			return entity;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetConnectionStrategy", err);
			throw new InternalServerException(
				"GetConnectionStrategy", 
				"Ha ocurrido un error al obtener la estrategia", 
				this._applicationContext, 
				__filename, 
				err
			);
		}
	}

}



