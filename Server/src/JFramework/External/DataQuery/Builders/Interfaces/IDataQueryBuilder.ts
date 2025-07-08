import { QueryExpression, QueryUnionCondition } from "../../Types/QueryExpression";



/**
 * Builder encadenable para realizar consultas sobre cualquier tipo de base de datos
 * de forma totalmente agnóstica.
 *
 * @template TFields Campos válidos del modelo (string union)
 * @template TResult Tipo del resultado esperado por fila
 */
export interface IDataQueryBuilder<DB, TB extends keyof DB, TResult extends object = any> {

  /** Agrega un filtro de busqueda a la consulta en curso */
	Where(expr: QueryExpression<TB & string>): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Incluye datos relacionados desde otra entidad.
   * 
   * En SQL se traduce a JOIN, en MongoDB a populate o $lookup.
   *
   * @param entity Nombre de la entidad relacionada (tabla/colección)
   * @param unionCondition Condición opcional de relación (en SQL es obligatoria, en MongoDB puede omitirse)
   */
  Include<OtherTable extends keyof DB & string>(
    entity: OtherTable,
    unionCondition?: QueryUnionCondition<keyof DB[TB] & string, DB[OtherTable] & string>
  ): IDataQueryBuilder<DB, TB, TResult>;

 

  /**
   * Selecciona campos específicos del resultado.
   * 
   * Si no se llama, se asume seleccionar todo (*)
   *
   * @param fields Lista de campos a incluir
   */
  SelectFields(fields: (keyof TResult | string)[]): IDataQueryBuilder<DB, TB, Partial<TResult>>;

  /**
   * Ordena los resultados por un campo.
   *
   * @param field Campo por el cual ordenar
   * @param direction Dirección del ordenamiento (ascendente por defecto)
   */
  SortBy(field: keyof TResult | string, direction?: 'asc' | 'desc'): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Limita la cantidad de registros devueltos (equivalente a LIMIT).
   */
  Take(count: number): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Ignora una cantidad de registros al inicio (paginación).
   */
  Skip(count: number): IDataQueryBuilder<DB, TB, TResult>;

  /**
   * Ejecuta la consulta y devuelve los resultados.
   */
  Execute(): Promise<TResult[]>;
}
