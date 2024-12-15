import { Generated, Insertable, Selectable, Updateable } from "kysely";



/** Tabla de hogares */
export interface HogaresTable {
  /** Id secuencial del hogar */
  id_hogar: Generated<number>;
  /** Id del usuario que creó el hogar */
  id_usuario: number;
  /** Nombre del hogar */
  nombre: string;
  /** Descripcion del hogar */
  description: string;
  /** Fecha de creación del hogar */
  fecha_creacion: Date;
}

/** Tipo para realizar consultas de seleccion */
export type SelectHogares = Selectable<HogaresTable>;

/** Tipo para realizar consultas de inserción */
export type CreateHogares = Insertable<HogaresTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateHogares = Updateable<HogaresTable>;