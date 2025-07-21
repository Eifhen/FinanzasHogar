import { DatabaseType } from "../../DataBases/Types/DatabaseType";


/** Representa las opciones de configuración del DataAdapter */
export type DatabaseContextConfiguration = {
	
	/** Tipo de base de datos */
	databaseType: DatabaseType;

	/** instancia de kysely de la base de datos en cuestion*/
	database: any;

}



