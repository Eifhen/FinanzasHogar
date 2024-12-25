import { Generated, Insertable, Selectable, Updateable } from "kysely";





/** Esta tabla intermedia conectará cada presupuesto con 
 * las categorías que cubre y el monto asignado para cada categoría. */
export interface PresupuestoCategoriaTable {

  /** Id secuencial */
  id: Generated<number>;

  /** Clave fornea con la tabla presupuestos */
  id_presupuesto: number;

  /** Clave foranea con la tabla categoria */
  id_categoria: number;

  /** Representa el monto maximo de una categoria en un presupuesto */
  monto_maximo: number;

}

/** Tipo para consultas de selección */
export type SelectPresupuestoCategoria = Selectable<PresupuestoCategoriaTable>;

/** Tipo para realizar consultas de inserción */
export type CreatePresupuestoCategoria = Insertable<PresupuestoCategoriaTable>;

/** Tipo para realizar consultas de actualización */
export type UpdatePresupuestoCategoria = Updateable<PresupuestoCategoriaTable>;