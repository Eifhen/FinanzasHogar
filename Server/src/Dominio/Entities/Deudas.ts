import { Selectable, Insertable, Updateable, Generated } from "kysely";






/**
 Las deudas pueden manejarse de forma similar a los ahorros o gastos, pero 
 necesitan detalles adicionales, como el acreedor, el saldo pendiente, 
 las cuotas, y los intereses. Además, las deudas pueden estar asociadas a 
 cuentas bancarias o tarjetas de crédito dentro del hogar.
 */
export interface DeudasTable {

  /** Id secuencial */
  id: Generated<number>;

  /** Clave foranea con la table de cuentas */
  id_cuenta: number;

  /** Clave foranea con la tabla de hogares */
  id_hogar: number;

  /** Nombre del acreedor: banco/persona */
  acreedor: string;

  /** El monto total inicial de la deuda. */
  monto_inicial: number;

  /** El saldo pendiente de la deuda. */
  monto_pendiente: number;

  /** Porcentaje de interés de la deuda. */
  interes: number;

  /** Fecha en la que se contrajo la deuda. */
  fecha_inicio: Date;

  /** Fecha límite para pagar la deuda, si aplica. */
  fecha_vencimiento?: Date;

  /** Número total de cuotas para pagar la deuda (en caso de que sea financiada). */
  cuotas_totales?: number;

  /** Cuántas cuotas faltan para pagar la deuda. */
  cuotas_restantes?: number;

  /** Descripción de la deuda */
  descripcion: string;

}


/** Tipo para consultas de selección */
export type SelectDeudas = Selectable<DeudasTable>;

/** Tipo para realizar consultas de inserción */
export type CreateDeudas = Insertable<Omit<DeudasTable, "id">>;

/** Tipo para realizar consultas de actualización */
export type UpdateDeudas = Updateable<Omit<DeudasTable, "id">>;