import { Generated, Insertable, Selectable, Updateable } from "kysely";


/** Tabla que representa la relación entre un usuario y el hogar */
export interface UsuariosHogarTable {

  /** Id secuencial de la tabla */
  id: Generated<number>;

  /** Clave foranea con la tabla usuario */
  id_usuario: number;

  /** Clave foranea con la tabla hogar */
  id_hogar: number;

  /** Clave foranea con la tabla de roles */
  id_rol: number;

  /** Fecha en la que el usuario se unió al hogar */
  fecha_union: Date;
}

/** Tipo para realizar consultas de seleccion */
export type SelectUsuarioHogar = Selectable<UsuariosHogarTable>;

/** Tipo para realizar consultas de inserción */
export type CreateUsuarioHogar = Insertable<Omit<UsuariosHogarTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateUsuarioHogar = Updateable<Omit<UsuariosHogarTable, "id">>;