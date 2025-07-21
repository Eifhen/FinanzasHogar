import { InternalDatabase } from "../../API/DataAccess/InternalDatabase";
import ApplicationContext from "../../Configurations/ApplicationContext";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { IDataQueryBuilderInitializer } from "./Builders/Interfaces/IDataQueryBuilder";
import { QueryBuilderInitializer } from "./Builders/QueryBuilderInitializer";
import { DatabaseContextConfiguration } from "./Utils/Types";


/** Representa las dependencias del DataAdapter */
export interface DatabaseContextDependencies {

	/** Contexto de aplicación */
	applicationContext: ApplicationContext;

	/** Representa las opciones de configuración del dataAdapter */
	options: DatabaseContextConfiguration;
}


export default class DatabaseContext<DB> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Opciones de configuración del dataAdapter */
	private readonly options: DatabaseContextConfiguration;

	/** Representa al queryBuilder */
	public readonly queryBuilder: IDataQueryBuilderInitializer<DB>;

	constructor(deps: DatabaseContextDependencies) {

		this.options = deps.options;

		this._applicationContext = deps.applicationContext;

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "STRATEGY DIRECTOR",
			entityName: "DataAdapter",
			applicationContext: deps.applicationContext
		});

		/** Seteamos el queryBuilder */
		this.queryBuilder = new QueryBuilderInitializer<DB>({
			applicationContext: deps.applicationContext,
			options: {
				databaseType: deps.options.databaseType,
				database: deps.options.database
			}
		});

	}

	/** Permite iniciar un query sobre el queryBuilder */
	public Query<TB extends Extract<keyof DB, string>>(table: TB) {
		return this.queryBuilder.Query(table);
	}

	// public async Connect() : Promise<void> {
	// 	try {

	// 	}
	// 	catch(err:any){

	// 	}
	// }

	// public async Disconnect() : Promise<void> {
	// 	try {

	// 	}
	// 	catch(err:any){
			
	// 	}
	// }

}


