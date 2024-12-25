import { Generated, Insertable, Selectable, Updateable } from "kysely";

/**
 * Los ahorros representarían el dinero que los usuarios deciden apartar 
 * de sus ingresos para un propósito particular. Estos ahorros pueden estar 
 * vinculados a una o más metas específicas o simplemente estar 
 * guardados como reserva general.
 */
export interface AhorrosTable {

  /** Id secuencial del ahorro */
  id: Generated<number>;

  /** Clave foranea con la tabla de cuentas */
  id_cuenta: number;

  /** Clave foranea con la tabla de hogares */
  id_hogar: number;

  /** Clave foranea con la tabla de metas */
  id_meta: number;

  /** Monto ahorrado */
  monto: number;

  /** Fecha del ahorro */
  fecha: Date;

  /** Descripcion del ahorro */
  descripcion: string;

}



/** Tipo para consultas de selección */
export type SelectAhorros = Selectable<AhorrosTable>;

/** Tipo para realizar consultas de inserción */
export type CreateAhorros = Insertable<AhorrosTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateAhorros = Updateable<AhorrosTable>;