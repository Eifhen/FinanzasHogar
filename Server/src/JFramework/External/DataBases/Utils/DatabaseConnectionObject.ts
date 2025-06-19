
import * as tedious from 'tedious';
import { ConnectionStrategyData } from '../Types/DatabaseType';
import { DEFAULT_DATABASE_TIMEOUT } from '../../../Utils/const';
import { parse, SchemaDefinition } from '@tediousjs/connection-string';
import { InferSchema, mssqlConnectionSchema } from './ConnectionSchemas';
import { ConnectionString } from '@tediousjs/connection-string/lib/connection-string';



interface IDatabaseConnectionObjectDependencies {
	connectionOptions: ConnectionStrategyData;
}

export default class DatabaseConnectionObject {

	/** Objeto de opciones de conección segun la estrategia de conección */
	private readonly _connectionOptions: ConnectionStrategyData;

	/** Cadena de conección */
	private readonly _parsedConnectionString: Readonly<ConnectionString>;

	/** Cadena de conección parseada a objeto */
	private readonly _connectionSchema: InferSchema<SchemaDefinition>;

	/** Representa el tiempo de espera de la conección */
	private readonly _connectionTimeOut: number;

	constructor(deps: IDatabaseConnectionObjectDependencies) {

		/** Inicializamos el objeto */
		this._connectionOptions = deps.connectionOptions;

		/** Parseamos la connectionString */
		this._parsedConnectionString = parse(this._connectionOptions.connectionData.connectionString);

		/** Se parsea el connectionString a un objeto con la estructura del mssqlConnectionSchema */
		this._connectionSchema  = this._parsedConnectionString.toSchema(mssqlConnectionSchema);

		/** Representa el tiempo de espera de la conección */
		this._connectionTimeOut = this._connectionOptions.connectionData.connectionTimeout ?? DEFAULT_DATABASE_TIMEOUT;

	}

	/** Retorna un objeto de configuración para la conección con Tedious */
	public GetMssqlConnectionObject(): tedious.ConnectionConfiguration {

		/** Mapear el schema al tipo de Tedious y retornar*/
		return {
			server: this._connectionSchema['data source'] || '',
			options: {
				database: this._connectionSchema['initial catalog'] || '',
				trustServerCertificate: this._connectionSchema['trustservercertificate'] ?? true,
				abortTransactionOnError: true,
				connectTimeout: this._connectionSchema['connection timeout'] ?? this._connectionTimeOut,
				encrypt: this._connectionSchema['encrypt'] ?? false,
				instanceName: this._connectionSchema['instance name'],
				port: this._connectionSchema['port'],
			},
			authentication: {
				type: 'default',
				options: {
					userName: this._connectionSchema['user id'] || '',
					password: this._connectionSchema['password'] || '',
					domain: this._connectionSchema['domain'] || undefined,
				}
			}
		};
	}


}