import { Generated, Insertable, Selectable, Updateable } from "kysely";



/** Tabla que permite mantener una 
 * vitacora de los cambios realizados 
 * al hogar en sus distintas áreas */
export interface HistorialCambiosHogarTable {

  /** Id secuencial del historial */
  id_historial: Generated<number>;

  /** Clave foranea con la tabla Usuarios */
  id_usuario: number;

  /** Clave foranea con la tabla Hogares */
  id_hogar: number;

  /** Nombre de la entidad a la cual se le realizó el cambio */
  entidad: string;

  /** Descripción del cambio realizado */
  descripcion: string;

  /** fecha del cambio realizado */
  fecha_cambio: Date;

}

/** Tipo para consultas de selección */
export type SelectHistorialCambiosHogar = Selectable<HistorialCambiosHogarTable>;

/** Tipo para realizar consultas de inserción */
export type CreateHistorialCambiosHogar = Insertable<HistorialCambiosHogarTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateHistorialCambiosHogar = Updateable<HistorialCambiosHogarTable>;