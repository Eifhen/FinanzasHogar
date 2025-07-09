import ApplicationContext from "../../../Configurations/ApplicationContext";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { ColumnFields } from "../Types/CompilerTypes";




interface DataAdapterDependencies<DatabaseEntity, Table extends Extract<keyof DatabaseEntity, string>> {
	/** instancia de kysely de la base de datos en cuestion*/
	database: any;

	/** Nombre de la tabla en cuestion */
	table: Table;

	/** Indicamos el nombre de la clave primaria, 
	 * este campo se utiliza como ordenamiento por default */
	primaryKey: ColumnFields<DatabaseEntity, Table>;

	/** Contexto de aplicación */
	applicationContext: ApplicationContext;
}


export default class DataAdapter<DatabaseEntity, Table extends Extract<keyof DatabaseEntity, string>> {

	/** Instancia de la base de datos kysely o Mongodb */
	private readonly _db: any;

	/** Nombre de la tabla que se está trabajando */
	private readonly _table: Table;

	/** Representa la llave primaria o campo indentificador de la tabla */
	private readonly _primaryKey: ColumnFields<DatabaseEntity, Table>;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: DataAdapterDependencies<DatabaseEntity, Table>) {
		
		this._db = deps.database;
		this._table = deps.table;
		this._primaryKey = deps.primaryKey;
		this._applicationContext = deps.applicationContext;

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "STRATEGY DIRECTOR",
			entityName: "DataAdapter",
			applicationContext: deps.applicationContext
		});
	}

}