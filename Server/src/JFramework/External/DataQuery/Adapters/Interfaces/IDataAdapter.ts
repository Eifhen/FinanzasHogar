import { QueryExpression } from "../../Types/QueryExpression";





export interface IDataAdapter<T extends string = string> {
	
  /** Permite realizar operaciones de búsqueda
	 * @returns - Retorna los elementos encontrados */
  Query<TRecord extends object>(
    table: string,
    expression: QueryExpression<T>
  ): Promise<TRecord[]>;

	/** Permite crear un registro 
	 * @returns - Retorna la entidad creada */
  Create<TRecord extends object>(table: string, record: TRecord): Promise<TRecord>;

	/** Permite modificar un registro
	 * @returns - Retorna la entidad actualizada */
  Update<TRecord extends object>(
    table: string,
    expression: QueryExpression<T>,
    data: Partial<TRecord>
  ): Promise<TRecord>;  

  /** Elimina los registros que correspondan 
	 * con la expresión */
  Delete(
    table: string,
    expression: QueryExpression<T>
  ): Promise<number>;

  // Opcional: soporte para transacciones
  withTransaction?<R>(callback: (adapter: IDataAdapter<T>) => Promise<R>): Promise<R>;
}