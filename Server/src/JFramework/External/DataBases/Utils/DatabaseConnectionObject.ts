
import * as tedious from 'tedious';
import { ConnectionStrategyData } from '../Types/DatabaseType';
import { DEFAULT_CONNECTION_POOL_SIZE, DEFAULT_DATABASE_TIMEOUT } from '../../../Utils/const';
import { parse } from '@tediousjs/connection-string';
import { ConnectionString } from '@tediousjs/connection-string/lib/connection-string';
import { mssqlConnectionSchema } from '../Schemas/MssqlConnectionSchema';
import { PoolConfig as PostgresPoolConfig } from 'pg';
import { postgresqlConnectionSchema } from '../Schemas/PostgreConnectionSchema';



interface IDatabaseConnectionObjectDependencies {
	connectionOptions: ConnectionStrategyData;
}

export default class DatabaseConnectionObject {

	/** Objeto de opciones de conección segun la estrategia de conección */
	private readonly _connectionOptions: ConnectionStrategyData;

	private readonly _parsedConnectionString: Readonly<ConnectionString>;

	private readonly _connectionTimeOut: number;

	constructor(deps: IDatabaseConnectionObjectDependencies) {

		/** Inicializamos el objeto */
		this._connectionOptions = deps.connectionOptions;

		/** Parseamos la connectionString */
		this._parsedConnectionString = parse(this._connectionOptions.connectionData.connectionString);

		/** Representa el tiempo de espera de la conección */
		this._connectionTimeOut = this._connectionOptions.connectionData.connectionTimeout ?? DEFAULT_DATABASE_TIMEOUT;
	}

	/** Retorna un objeto de configuración para la conección con Tedious/mssql */
	public GetMssqlConnectionObject(): tedious.ConnectionConfiguration {

		/** Se parsea el connectionString a un objeto con la estructura del mssqlConnectionSchema */
		const connectionSchema = this._parsedConnectionString.toSchema(mssqlConnectionSchema);

		/** Mapear el schema al tipo de Tedious y retornar*/
		return {
			server: connectionSchema['data source'] || '',
			options: {
				database: connectionSchema['initial catalog'] || '',
				trustServerCertificate: connectionSchema['trustservercertificate'] ?? true,
				abortTransactionOnError: true,
				connectTimeout: connectionSchema['connection timeout'] ?? this._connectionTimeOut,
				encrypt: connectionSchema['encrypt'] ?? false,
				instanceName: connectionSchema['instance name'],
				port: connectionSchema['port'],
			},
			authentication: {
				type: 'default',
				options: {
					userName: connectionSchema['user id'] || '',
					password: connectionSchema['password'] || '',
					domain: connectionSchema['domain'] || undefined,
				}
			}
		};
	}

	/** Retorna un objeto de configuración para la conexión de postgresql, 
	 * esto se hace para estandarizar el proceso ya que postgres no utiliza el 
	 * formato ADO/SQLSERVER en sus cadenas de conexión, sino que utiliza el formato URI
	 * @example - 'postgresql://postgres:tu_contraseña@localhost:5432/gj_framework'
	 * entonces para tener un formato estandarizado mejor utilizo un connectionString tipo ADO
	 * y lo parseo para entonces pasarle un un objeto PostgresPoolConfig a 
	 * la estrategía de conexión de postgres */
	public GetPostGresConnectionObject(): PostgresPoolConfig {

		const schema = this._parsedConnectionString.toSchema(postgresqlConnectionSchema);
		const minPoolSize = this._connectionOptions.connectionData.connectionPoolMinSize ?? DEFAULT_CONNECTION_POOL_SIZE;
		const maxPoolSize = this._connectionOptions.connectionData.connectionPoolMaxSize ?? DEFAULT_CONNECTION_POOL_SIZE

		return {
			host: schema['host'],
			port: schema['port'],
			user: schema['user id'],
			password: schema['password'],
			database: schema['database'],
			connectionTimeoutMillis: schema['connection timeout'] ?? this._connectionTimeOut,
			max: schema['max pool size'] ?? maxPoolSize,
			min: schema['min pool size'] ?? minPoolSize,
			ssl: schema['ssl'] ?? false
		};
	}

}