import { Generated, Selectable, Insertable, Updateable, JSONColumnType } from "kysely";

export interface TenantDetailTable {
  
  /** Id secuencial del tenant */
  id: Generated<number>;

  /** Clave unica del tenant */
  tenant_key: string;

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