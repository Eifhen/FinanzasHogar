import { OrderByDirection } from "kysely/dist/cjs/parser/order-by-parser";
import { ColumnFields, SelectionFields, UnionParams } from "../../Types/CompilerTypes";
import { QueryExpression } from "../../Types/QueryExpression";
import { Kysely } from "kysely";
import ApplicationContext from "../../../../Configurations/ApplicationContext";
import IPaginationArgs from "../../../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../../Helpers/Interfaces/IPaginationResult";



/** Dependencias de cada querybuilder */
export interface IQueryBuilderDependencies<DatabaseEntity, TableName extends keyof DatabaseEntity> {
	/** instancia de kysely de la base de datos en cuestion*/
	database: Kysely<DatabaseEntity>;

	/** Nombre de la tabla en cuestion */
	table: TableName;

  /** Indicamos el nombre de la clave primaria, 
   * este campo se utiliza como ordenamiento por default */
  primaryKey: ColumnFields<DatabaseEntity, TableName>;

	/** Contexto de aplicación */
	applicationContext: ApplicationContext;
}


/**
 * Builder encadenable para realizar consultas sobre cualquier tipo de base de datos
 * de forma totalmente agnóstica.
 *
 * @template DB Representa la base de datos que se está consultando
 * @template TB Representa la tabla que se está consultado
 * @template TResult Tipo del resultado esperado por fila
 */
export interface IDataQueryBuilder<DB, TB extends keyof DB, TResult extends object = any> {

  /** Banderas del builder */
  builderFlags: {
    hasWhere: boolean,
    hasSort: boolean,
    hasInclude: boolean,
    hasSelect: boolean,
    hasTake: boolean,
    hasSkip: boolean,
    hasCount: boolean;
    hasPagination: boolean;
  } 

  /** Agrega un filtro de busqueda a la consulta en curso */
	Where(expr: QueryExpression<ColumnFields<DB, TB>>): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Incluye datos relacionados desde otra entidad.
   * 
   * En SQL se traduce a JOIN, en MongoDB a populate o $lookup.
   *
   * @param entity Nombre de la entidad relacionada (tabla/colección)
   * @param args Parámetros de unión
   */
  Include<OtherTable extends Extract<keyof DB, string>>(
    entity: OtherTable,
    args: UnionParams<DB, TB, OtherTable>
  ): IDataQueryBuilder<DB, TB, TResult>;

 
  /**
   * Selecciona campos específicos del resultado.
   * 
   * Si no se llama, se asume seleccionar todo (*)
   *
   * @param fields Lista de campos a incluir
   */
  Fields(fields: SelectionFields<DB, TB>): IDataQueryBuilder<DB, TB, Partial<TResult>>;

  /**
   * Ordena los resultados por un campo.
   *
   * @param field Campo por el cual ordenar
   * @param direction Dirección del ordenamiento (ascendente por defecto)
   */
  SortBy(field: ColumnFields<DB, TB>, direction?: OrderByDirection): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Limita la cantidad de registros devueltos (equivalente a LIMIT).
   */
  Take(count: number): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Ignora una cantidad de registros al inicio (paginación).
   */
  Skip(count: number): IDataQueryBuilder<DB, TB, TResult>;

  /** Devuelve el número total de registros que cumplen con la consulta actual (sin aplicar Take ni Skip) */
  Count() : Promise<number>;

  /** Pagina la data según los argumentos de paginación proporcionados */
  Paginate(args: IPaginationArgs) : Promise<IPaginationResult<TResult[]>>;

  /**
   * Ejecuta la consulta y devuelve los resultados.
   */
  Execute(): Promise<TResult[]>;

  /** Ejecuta la consulta y devuelve el primer registro */
  ExecuteAndTakeFirst(): Promise<TResult>;
}
