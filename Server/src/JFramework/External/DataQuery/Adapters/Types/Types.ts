import ApplicationContext from "../../../../Configurations/ApplicationContext";
import { DatabaseType } from "../../../DataBases/Types/DatabaseType";
import { ColumnFields } from "../../Compilers/Types/Types";



/** Representa las opciones de configuración del DataAdapter */
export type DataAdapterConfigurationOptions<DatabaseEntity, Table extends Extract<keyof DatabaseEntity, string>> = {
	
	/** Tipo de base de datos */
	databaseType: DatabaseType;

	/** instancia de kysely de la base de datos en cuestion*/
	database: any;

	/** Nombre de la tabla en cuestion */
	table: Table;

	/** Indicamos el nombre de la clave primaria, 
	 * este campo se utiliza como ordenamiento por default */
	primaryKey: ColumnFields<DatabaseEntity, Table>;
}


/** Representa las dependencias del DataAdapter */
export interface DataAdapterDependencies<DB, TB extends Extract<keyof DB, string>> {

	/** Contexto de aplicación */
	applicationContext: ApplicationContext;

	/** Representa las opciones de configuración del dataAdapter */
	options: DataAdapterConfigurationOptions<DB, TB>;
}

