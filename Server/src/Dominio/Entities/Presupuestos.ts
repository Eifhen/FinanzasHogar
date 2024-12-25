import { Generated, Insertable, Selectable, Updateable } from "kysely";





export interface PresupuestosTable {
  
  /** Id secuencial  */
  id_presupuesto: Generated<number>;

  /** Clave foranea de la tabla de hogares */
  id_hogar: number;

  /** Nombre del presupuesto */
  nombre: string;

  /** Descripcion del presupuesto */
  descripcion: string;

  /** monto maximo global del presupuesto */
  monto_maximo: number;

  /** Intervalo de tiempo del presupuesto: Semanal, Mensual, Anual */
  periodo: string;

  /** Fecha de inicio del presupuesto */
  fecha_inicio: Date;

  /** Fecha de fin (opcional si es un presupuesto a plazo fijo). */
  fecha_fin?: Date;

}


/** Tipo para consultas de selección */
export type SelectPresupuestos = Selectable<PresupuestosTable>;

/** Tipo para realizar consultas de inserción */
export type CreatePresupuestos = Insertable<PresupuestosTable>;

/** Tipo para realizar consultas de actualización */
export type UpdatePresupuestos = Updateable<PresupuestosTable>;