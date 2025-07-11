import { Generated } from "kysely";
import { DatabaseConnectionData } from "../../../Configurations/Types/IConfigurationSettings";
import { ConnectionEnvironment } from "../../../Configurations/Types/IConnectionService";
import IDatabaseConnectionStrategy from "../Interfaces/IDatabaseConnectionStrategy";

/** Tipos de bases de datos contemplados por el sistema */
export const DatabaseType = {

	/** Base de datos | MicroSoft SQL */
	ms_sql_database: "ms_sql_database",

	/** Base de datos | PostgreSQL */
	postgre_sql_database: "postgre_sql_database",

	/** Base de datos | Mongo DB */
	mongo_database: "mongo_database",


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


/** Objeto de conexión para el SqlConnectionStrategy */
export type ConnectionStrategyData = {
  /** Ambiente de conexión */
  connectionEnvironment: ConnectionEnvironment;

  /** Datos de conexión */
  connectionData: DatabaseConnectionData,
}

/** Objecto de opciones para manejadores de conexión de base de datos*/
export type DatabaseConnectionManagerOptions = {
  /** Define el ambiente de conexión */
  connectionEnvironment: ConnectionEnvironment;

  /** Tipo de base de datos (mongodb o sql), si el tipo NO es especificado se toamará desde el objeto de configuración */
  databaseType: DatabaseType;

  /** Nombre del databaseType en el contenedor de dependencias */
  databaseTypeContainerName: string;

  /** Define el nombre que tendrá la instancia de la base de datos dentro del contenedor de dependencias */
  databaseContainerInstanceName: string;

  /** Nombre de la instancia de base de datos en el registro de instancias del databaseInstanceManager */
  databaseRegistryName: string;

  /** Indica alguna condición que se deba cumplir para poder realizar la condición */
  connectionCondition?: boolean | (() => boolean);

  /** Datos de conexión */
  connectionData?: DatabaseConnectionData,
}

/** Objecto de opciones para manejadores de conexión de base de datos multi-tenant*/
export type MultiTenantConnectionManagerOptions = {
  
  /** Opciones de configuración según la estrategia de conexión */
  strategyOptions: ConnectionStrategyData;

  /** Tipo de base de datos */
  databaseType: DatabaseType;

  /** Define el nombre que tendrá la instancia de la base de datos 
   * ddentro del contenedor de dependencias */
  databaseContainerInstanceName: string;

  /** Nombre que tendra la instancia de la base de datos en el registro 
   * de instancias del databaseInstanceManager */
  databaseRegistryName: string;
}



export type ConnectionEntity = {
  strategy: IDatabaseConnectionStrategy<any, any>|null;
  options: DatabaseConnectionManagerOptions;
}