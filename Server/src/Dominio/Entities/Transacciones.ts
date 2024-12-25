import { Generated, Insertable, Selectable, Updateable } from "kysely";



/** Esta tabla representa a las transacciones realizadas en una cuenta */
export interface TransaccionesTable {

  /** id secuencial */
  id: Generated<number>;

  /** Clave foranea con la tabla de cuentas */
  id_cuenta: number;

  /** Clave foranea con la tabla de hogares */
  id_hogar: number;

  /** Clave foranea con la tabla de categorias */
  id_categoria: number;

  /** Fecha de la transaccion */
  fecha: Date;

  /** Monto de la transaccion */
  monto: number;

  /** Descripcion de la transaccion */
  descripcion: string;

  /** Tipo de transaccion 'deposito', 'retiro', 'transferencia' */
  tipo: string;

}


/** Tipo para consultas de selección */
export type SelectTransaccion = Selectable<TransaccionesTable>;

/** Tipo para realizar consultas de inserción */
export type CreateTransaccion = Insertable<TransaccionesTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateTransaccion = Updateable<TransaccionesTable>;