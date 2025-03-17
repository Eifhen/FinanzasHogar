import { Selectable, Insertable, Updateable, Generated } from "kysely";



/** Cada vez que el usuario realiza un pago para disminuir una deuda, 
 * ese pago debe registrarse y reflejarse en el saldo pendiente. */
export interface PagosDeudaTable {

  /** Id secuencial */
  id: Generated<number>;

  /** id de la deuda */
  id_deuda: number;

  /** Id de la cuenta desde la cual se hace el pago */
  id_cuenta: number;

  /** Monto a pagar */
  monto: number;

  /** fecha en la que se realizó el pago */
  fecha_pago: Date;

}



/** Tipo para consultas de selección */
export type SelectPagosDeuda = Selectable<PagosDeudaTable>;

/** Tipo para realizar consultas de inserción */
export type CreatePagosDeuda = Insertable<Omit<PagosDeudaTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdatePagosDeuda = Updateable<Omit<PagosDeudaTable, "id">>;