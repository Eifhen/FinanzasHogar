import { QueryExpression } from "../../Types/QueryExpression";
import { IDataQueryBuilder } from "../../Builders/Interfaces/IDataQueryBuilder";



/** Interfaz general para el acceso unificado a datos, compatible con SQL y NoSQL */
export interface IDataAdapter<DB, TB extends keyof DB> {

  /**
  * Inicia una operación de búsqueda en la tabla indicada.
  * 
  * @param table Nombre de la tabla o colección
  * @param expression Filtro estructurado en formato DSL
  */
  Find<TRecord extends object>(
    table: string,
    expression: QueryExpression<TB & string>
  ): IDataQueryBuilder<DB, TB, TRecord>;

  /**
   * Inserta un nuevo registro en la tabla especificada.
   * 
   * @param table Nombre de la tabla o colección
   * @param record Objeto a insertar
   */
  Insert<TRecord extends object>(
    table: string,
    record: TRecord
  ): Promise<void>;

  /**
   * Actualiza registros que cumplan una condición.
   * 
   * @param table Nombre de la tabla o colección
   * @param expression Filtro de búsqueda DSL
   * @param changes Objeto con campos a modificar
   */
  Update<TRecord extends object>(
    table: string,
    expression: QueryExpression<TB & string>,
    changes: Partial<TRecord>
  ): Promise<number>; // Cantidad de registros modificados

  /**
   * Elimina registros que cumplan una condición.
   * 
   * @param table Nombre de la tabla o colección
   * @param expression Filtro de búsqueda DSL
   */
  Delete(
    table: string,
    expression: QueryExpression<TB & string>
  ): Promise<number>; // Cantidad de registros eliminados
}