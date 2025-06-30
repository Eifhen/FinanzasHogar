import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { DatabaseType } from "../../../External/DataBases/Types/DatabaseType";


/** Tabla que contiene la configuración de 
 * conexión del tenant */
export interface TenantConnectionsTable {

  /** Clave primaria */
  id: Generated<bigint>;

  /** Clave UUID del tenant */
  tenant_key: string;

  /** Tipo de base de datos: sql o mongodb */
  database_type: DatabaseType;

  /** ConnectionString de la base de datos del tenant cifrada */
  connection: string;

  /** ConnectionTimeOut de la bsase de datos del tenant */
  timeout: number;

  /** Tamaño minimo del pool de conexiones */
  pool_min: number;

  /** Tamaño maximo del pool */
  pool_max: number;
}

/** Tipo para consultas de selección */
export type SelectTenantConnection = Selectable<TenantConnectionsTable>;

/** Tipo para realizar consultas de inserción */
export type CreateTenantConnection = Insertable<TenantConnectionsTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateTenantConnection = Updateable<TenantConnectionsTable>;