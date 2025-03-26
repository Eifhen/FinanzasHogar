import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { EstadosTenant } from "../../../Utils/estados";


export interface ProyectTable {
  
  /** Id secuencial del tenant */
  id: Generated<number>;

  /** Clave del proyecto al que pertenece este tenant */
  proyect_key: string;

  /** Nombre del tenant */
  name: string;

  /** Descripción del tenant */
  description: string;

  /** Estado actual del tenant activo = 1; inactivo = 2 */
  status: EstadosTenant;

  /** Fecha de creación del tenant */
  creation_date: Date;

}

/** Tipo para consultas de selección */
export type SelectProyects = Selectable<ProyectTable>;

/** Tipo para realizar consultas de inserción */
export type CreateProyects = Insertable<Omit<ProyectTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateProyects = Updateable<Omit<ProyectTable, "id">>;