import { Generated, Insertable, Selectable, Updateable } from "kysely";


/** Esta tabla representa las metas de ahorro  de un hogar*/
export interface MetasTable {

  /** Id secuencial */
  id: Generated<number>;

  /** Clave foranea con la tabla de hogares*/
  id_hogar: number;

  /** Nombre de la meta */
  nombre: string;

  /** Monto objetivo que se desea lograr */
  monto_objetivo: number;

  /** Monto ahorrado por el usuario hasta la fecha */
  monto_ahorrado: number;

  /** Descripcion de la meta */
  descripcion: string;

  /** Fecha limite para cumplir la meta (Toda meta necesita una fecha) */
  fecha_limite: Date;

  /** Id Url de imagen relacionada a la meta */
  image_public_id: string;
}


/** Tipo para consultas de selección */
export type SelectMetas = Selectable<MetasTable>;

/** Tipo para realizar consultas de inserción */
export type CreateMetas = Insertable<Omit<MetasTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateMetas = Updateable<Omit<MetasTable, "id">>;