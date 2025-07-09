import ApplicationContext from "../../../Configurations/ApplicationContext";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { InternalServerException, NotImplementedException } from "../../../ErrorHandling/Exceptions";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { IDataQueryBuilder } from "../Builders/Interfaces/IDataQueryBuilder";
import { MssqlQueryBuilder } from "../Builders/MssqlQueryBuilder";
import { PostgresQueryBuilder } from "../Builders/PostgresQueryBuilder";
import { QueryBuilderDependencies } from "../Builders/Types/Types";
import { DataAdapterConfigurationOptions, DataAdapterDependencies } from "./Types/Types";



/** DataAdapter
 * @description Clase que nos permite controlar el acceso y manipulación de los datos.
 * 
 * ```ts
 * const adapter = new DataAdapter<InternalDatabase, "gj_tenants">({
		applicationContext: {} as ApplicationContext,
		options: {} as DataAdapterConfigurationOptions<InternalDatabase, "gj_tenants">
	});

	await adapter.query.Include("gj_tenant_connections", {
		unionType: "inner",
		unionCondition: ["tenant_key", "=", "tenant_key"],
		filterCondition: [
			["name", "=", "Gabriel"], "and",
			["domain", "=", "https://"]
		]
	}).Execute();
 * ```
 */
export default class DataAdapter<DB, TB extends Extract<keyof DB, string>> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Opciones de configuración del dataAdapter */
	private readonly options: DataAdapterConfigurationOptions<DB, TB>;

	/** Representa al queryBuilder */
	public readonly query: IDataQueryBuilder<DB, TB>;

	constructor(deps: DataAdapterDependencies<DB, TB>) {

		this._applicationContext = deps.applicationContext;
		this.options = deps.options;

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "STRATEGY DIRECTOR",
			entityName: "DataAdapter",
			applicationContext: deps.applicationContext
		});

		/** Seteamos el queryBuilder */
		this.query = this.SetQueryBuilder();

	}

	/** Función que nos permite setear el queryBuilder */
	private SetQueryBuilder(): IDataQueryBuilder<DB, TB> {
		try {
			this._logger.Activity("SetQueryBuilder");

			/** Agregamos las dependencias del queryBuilder */
			const dependencies: QueryBuilderDependencies<DB, TB> = {
				applicationContext: this._applicationContext,
				options: {
					/** Tipo de base de datos */
					databaseType: this.options.databaseType,

					/** instancia de la base de datos */
					database: this.options.database,

					/** Nombre de la tabla */
					table: this.options.table,

					/** Nombre del primaryKey */
					primaryKey: this.options.primaryKey
				}
			}

			/** Optenemos el builder dependiendo del tipo de base de datos */
			switch (this.options.databaseType) {
				case "ms_sql_database":
					return new MssqlQueryBuilder(dependencies);
				case "postgre_sql_database":
					return new PostgresQueryBuilder(dependencies);
				case "mongo_database":
					throw new NotImplementedException("SetQueryBuilder", this._applicationContext, __filename);
				default:
					throw new NotImplementedException("SetQueryBuilder", this._applicationContext, __filename);
			}

		}
		catch (err: any) {
			this._logger.Error("FATAL", "SetQueryBuilder", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"SetQueryBuilder",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);

		}
	}


}


