import { Generated, Insertable, Selectable, Updateable } from "kysely";

/** Tabla que representa las cuentas relacionadas a un hogar  */
export interface CuentasTable {
  
  /** Id secuencial  */
  id: Generated<number>;

  /** Clave foranea con la tabla de hogares */
  id_hogar: number;

  /** Nombre de la cuenta bancaria */
  nombre: string;

  /** Tipo de cuenta ej: 'bancaria', 'efectivo', 'tarjeta_credito', 'inversion', 'prestamo' */
  tipo: string;

  /** El saldo con el que se abrió la cuenta. */
  saldo_inicial: number;

  /** El saldo actualizado de la cuenta. */
  saldo_actual: number;

  /** Código de moneda (USD, EUR, etc.). */
  moneda: string;

  /** Fecha de creacion de la cuenta */
  fecha_creacion: Date;

  /** Estado de la cuenta (si está activa o ha sido cerrada). 
    1 = Activa; 0 = Cerrada */
  estado: number;

}

/** Tipo para consultas de selección */
export type SelectCuentasTable = Selectable<CuentasTable>;

/** Tipo para realizar consultas de inserción */
export type CreateCuentasTable = Insertable<Omit<CuentasTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateCuentasTable = Updateable<Omit<CuentasTable, "id">>;