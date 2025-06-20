import { Generated, Selectable, Insertable, Updateable, JSONColumnType } from "kysely";

export interface TenantDetailTable {
  
  /** Id secuencial del tenant */
  id: Generated<number>;

  /** Clave unica del tenant */
  tenant_key: string;

  /** Nombre de la base de datos del tenant*/
  databaseName: string;

  /** Cadena de conexión del tenant */
  connectionString: string;

  /** Tiempo de conección */
  connectionTimeout: number,

  /** Tamaño minimo del connectionPool */
  connectionPoolMinSize: number,

  /** Tamaño máximo del connectionPool */
  connectionPoolMaxSize: number

  /** almacena parámetros de estilo en formato JSON */
  style_parameters: JSONColumnType<any, string, string>;

  /** Logo del tenant */
  logo: string

}

/** Tipo para consultas de selección */
export type SelectTenantDetails = Selectable<TenantDetailTable>;

/** Tipo para realizar consultas de inserción */
export type CreateTenantDetails = Insertable<Omit<TenantDetailTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateTenantDetails = Updateable<Omit<TenantDetailTable, "id">>;