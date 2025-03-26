import { Generated } from "kysely";
import * as tedious from 'tedious';
import { DatabaseConnectionData } from "../../../Configurations/Types/IConfigurationSettings";
import { ConnectionEnvironment } from "../../../Configurations/Types/IConnectionService";

/** Tipos de bases de datos contemplados por el sistema */
export const DatabaseType = {

	/** Base de datos | MicroSoft SQL */
	"ms_sql_database": "ms_sql_database",

	/** Base de datos | Mongo DB */
	"mongo_database": "mongo_database",

} as const;

export type DatabaseType = keyof typeof DatabaseType;


/**
  Cuando defines el método Update, necesitas "extraer" el tipo subyacente de Generated<T> y 
  trabajar únicamente con su valor (T). Esto lo puedes hacer con un tipo condicional 
  en TypeScript para manejar Generated<T>.

  Este tipo revisa si T es del tipo Generated<...>. Si lo es, devuelve el tipo interno (U). 
  Si no lo es, simplemente usa T como está.
*/

export type UnwrapGenerated<T> = T extends Generated<infer U> ? U : T;

/** Excluye el primary key a nivel de tipos*/
export type WithoutPrimaryKey<Table, PrimaryKey extends keyof Table> = Omit<Table, PrimaryKey>;


/** Objeto de conexión de para el SqlConnectionStrategy */
export type SqlStrategyConnectionData = {
  env: ConnectionEnvironment;
  connectionConfig: tedious.ConnectionConfiguration,
  connectionData: DatabaseConnectionData,
}