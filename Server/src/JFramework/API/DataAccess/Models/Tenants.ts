import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { EstadosTenant } from "../../../Utils/estados";
import { DatabaseType } from "../../../External/DataBases/Types/DatabaseType";


export interface TenantTable {
  
  /** Id secuencial del tenant */
  id: Generated<number>;

  /** Clave del proyecto al que pertenece este tenant */
  proyect_key: string;

  /** Clave unica del tenant */
  tenant_key: string;

  /** Tipo de base de datos: sql o mongodb */
  databaseType: DatabaseType;

  /** Nombre del tenant */
  name: string;

  /** Descripción del tenant */
  description: string;

  /** Estado actual del tenant activo = 1; inactivo = 2 */
  status: EstadosTenant;

  /** Nombre del dominio del tenant */
  domain: string;

  /** Fecha de creación del tenant */
  creation_date: Date;

}

/** Tipo para consultas de selección */
export type SelectTenants = Selectable<TenantTable>;

/** Tipo para realizar consultas de inserción */
export type CreateTenants = Insertable<Omit<TenantTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateTenants = Updateable<Omit<TenantTable, "id">>;