import { QueryBuilderFlags } from "../Types/Types";
import { InitialStage, QueryStage } from "./IDataQueryBuilderStages";


/**
 * Builder encadenable para realizar consultas sobre cualquier tipo de base de datos
 * de forma totalmente agnóstica.
 *
 * @template DB Representa la base de datos que se está consultando
 * @template TB Representa la tabla que se está consultado
 * @template TResult Tipo del resultado esperado por fila
 */
export interface IDataQueryBuilder<
  DB, 
  TB extends keyof DB, 
  TResult extends object = any
> extends InitialStage<DB, TB, TResult> {

  /** Banderas del builder */
  builderFlags: QueryBuilderFlags

  /** Limpia la query en curso de todos los filtros */
  ClearQuery(): void;
  
	/** Setea la tabla que se va a consultar */
  SetTable(table: TB) : void
}


/** Inicializador del queryBuilder */
export interface IDataQueryBuilderInitializer<DB> extends QueryStage<DB> {
}

