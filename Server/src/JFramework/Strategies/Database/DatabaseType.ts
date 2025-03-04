




/** Tipos de bases de datos contemplados por el sistema */
export const DatabaseType = {

	/** Base de datos | MicroSoft SQL */
	"ms_sql_database": "ms_sql_database",

	/** Base de datos | Mongo DB */
	"mongo_database": "mongo_database",

} as const;

export type DatabaseType = keyof typeof DatabaseType;