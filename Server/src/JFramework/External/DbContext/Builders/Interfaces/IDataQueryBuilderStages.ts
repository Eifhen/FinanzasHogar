import { Insertable, Updateable } from "kysely";
import { QueryExpression } from "../../Compilers/Types/QueryExpression";
import { IncludeParams, SelectionFields } from "../Types/Types";
import { OrderByDirection } from "kysely/dist/cjs/parser/order-by-parser";
import { ColumnFields } from "../../Compilers/Types/Types";
import IPaginationArgs from "../../../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../../Helpers/Interfaces/IPaginationResult";



/** Indica el tipo de flujo de la consulta.
 * - 'query': operaciones de lectura como SELECT, COUNT, PAGINATE.
 * - 'operation': operaciones de modificación como UPDATE o DELETE. */
export type StageMode = 'query' | 'operation';


/** Representa la etapa final de ejecución de una consulta.
 * Proporciona métodos para ejecutar y obtener resultados. */
export interface ExecutionStage<TResult> {
  /** Ejecuta la consulta y devuelve un arreglo de resultados. */
  Execute(): Promise<TResult>;

  /** Ejecuta la consulta y devuelve el primer resultado o 
	 * lanza una excepción si no hay resultados.*/
  ExecuteAndTakeFirst(): Promise<TResult>;
}

/** Etapa `Where` usada cuando el modo es 'query'.
 * Permite aplicar filtros, ordenar, seleccionar campos y paginar resultados. */
export interface WhereStageQuery<
  DB,
  TB extends keyof DB,
  TResult extends object = any
> extends ExecutionStage<TResult> {

  /**  Agrega una cláusula WHERE a la consulta. */
  Where(expr: QueryExpression<ColumnFields<DB, TB>>): WhereStageQuery<DB, TB, TResult>;

  /** Ordena los resultados por el campo indicado. */
  SortBy(field: ColumnFields<DB, TB>, direction?: OrderByDirection): WhereStageQuery<DB, TB, TResult>;

  /** Limita el número de resultados devueltos. */
  Take(count: number): WhereStageQuery<DB, TB, TResult>;

  /** Omite una cantidad de resultados desde el inicio. */
  Skip(offset: number): WhereStageQuery<DB, TB, TResult>;

  /**  Selecciona campos específicos de la tabla. */
  Select(fields: SelectionFields<DB, TB>): WhereStageQuery<DB, TB, TResult>;

  /** Devuelve el número total de registros que cumplen la consulta actual. */
  Count(): Promise<number>;

  /** Devuelve una estructura de paginación con los resultados y metadatos. */
  Paginate(sortField: ColumnFields<DB, TB>, args: IPaginationArgs): Promise<IPaginationResult<TResult>>;
}


/** Etapa `Where` usada cuando el modo es 'operation'.
 * Solo permite filtrar antes de ejecutar UPDATE o DELETE. */
export interface WhereStageOperation<
  DB,
  TB extends keyof DB,
  TResult extends object = any
> extends ExecutionStage<TResult> {

  /** Agrega una cláusula WHERE a la operación de modificación. */
  Where(expr: QueryExpression<ColumnFields<DB, TB>>): WhereStageOperation<DB, TB, TResult>;
}


/** Representa una etapa `Where` que se adapta dinámicamente
 * según el tipo de operación (`query` o `operation`). */
export type WhereStage<
  DB,
  TB extends keyof DB,
  TResult extends object = any,
  Mode extends StageMode = 'query'
> = Mode extends 'query'
  ? WhereStageQuery<DB, TB, TResult>
  : WhereStageOperation<DB, TB, TResult>;

/** Etapa usada luego de una operación Include (JOIN).
 * Permite agregar filtros, ordenar, seleccionar campos o ejecutar. */
export interface IncludeStage<
  DB,
  TB extends keyof DB,
  TResult extends object = any
> extends ExecutionStage<TResult> {

  /** Ordena los resultados por el campo indicado. */
  SortBy(field: ColumnFields<DB, TB>, direction?: OrderByDirection): WhereStage<DB, TB, TResult, 'query'>;

  /** Limita el número de resultados devueltos. */
  Take(count: number): WhereStage<DB, TB, TResult, 'query'>;

  /** Omite una cantidad de resultados desde el inicio. */
  Skip(offset: number): WhereStage<DB, TB, TResult, 'query'>;

  /** Selecciona campos específicos de la tabla. */
  Select(fields: SelectionFields<DB, TB>): WhereStage<DB, TB, TResult, 'query'>;

  /** Realiza un JOIN o populate con otra tabla y permite continuar la construcción. */
  Include<OTB extends Extract<keyof DB, string>>(
    entity: OTB,
    args: IncludeParams<DB, TB, OTB>
  ): IncludeStage<DB, TB, TResult>;
}

/** Etapa inicial de construcción de consulta.
 * Permite comenzar con Select, Where, Include, Insert, Update o Delete. */
export interface InitialStage<
  DB,
  TB extends Extract<keyof DB, string>,
  TResult extends object = any
> {

  /** Comienza una consulta de selección de campos. */
  Select(fields: SelectionFields<DB, TB>): WhereStage<DB, TB, TResult, 'query'>;

  /** Aplica una cláusula WHERE al inicio de la consulta. */
  Where(expr: QueryExpression<ColumnFields<DB, TB>>): WhereStage<DB, TB, TResult, 'query'>;

  /** Realiza un JOIN con otra tabla y permite continuar la construcción. */
  Include<OTB extends Extract<keyof DB, string>>(
    entity: OTB,
    args: IncludeParams<DB, TB, OTB>
  ): IncludeStage<DB, TB, TResult>;

  /** Inserta un nuevo registro en la tabla y permite ejecutar la operación. */
  Insert(record: Insertable<DB[TB]>): ExecutionStage<TResult>;

  /** Inicia una operación de actualización de registros. */
  Update(changes: Updateable<DB[TB]>): WhereStage<DB, TB, TResult, 'operation'>;

  /** Inicia una operación de eliminación de registros. */
  Delete(): WhereStage<DB, TB, TResult, 'operation'>;
}

/** Define la tabla sobre la cual se hará la consulta y 
 * da inicio a la cadena de etapas */
export interface QueryStage<DB> {

  /** Define la tabla sobre la cual se hará la consulta y 
   * da inicio a la cadena de etapas */
  Query<TB extends Extract<keyof DB, string>,  TResult extends object = any>
  (table: TB) : InitialStage<DB, TB, TResult>;
}


