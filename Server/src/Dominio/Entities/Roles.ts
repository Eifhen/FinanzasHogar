import { Generated, Insertable, Selectable, Updateable } from "kysely";


/** Tabla de roles de hogar */
export interface RolesTable {

  /** Id secuencial del rol */
  id_rol: Generated<number>;

  /** Nombre del rol creado */
  nombre_rol: string;

  /** Descripción del rol */
  descripcion_rol: string;

  /** Alias del rol */
  alias: string;
}

/** Tipo para realizar consultas de seleccion */
export type SelectRoles = Selectable<RolesTable>;

/** Tipo para realizar consultas de inserción */
export type CreateRoles = Insertable<RolesTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateRoles = Updateable<RolesTable>;