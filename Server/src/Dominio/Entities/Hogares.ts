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

  /** ID de la Url de imagen de hogar */
  image_public_id: string;
}

/** Tipo para realizar consultas de seleccion */
export type SelectHogares = Selectable<HogaresTable>;

/** Tipo para realizar consultas de inserción */
export type CreateHogares = Insertable<Omit<HogaresTable, "id_hogar">>;

/** Tipo para realizar consultas de actualización */
export type UpdateHogares = Updateable<Omit<HogaresTable, "id_hogar">>;