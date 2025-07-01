import { QueryExpression } from "../../Types/QueryExpression";





/** Query parser toma una expresión del DSL (con el tipo QueryExpression<T>) y 
 * la convierte en una estructura intermedia que podamos luego transformar fácilmente en:
 	- SQL (Kysely/PostgreSQL/MSSQL)
	- MongoDB (filtros tipo { $and: [], $or: [] })
u otras implementaciones futuras */
export abstract class QueryParser<TFields extends string, TResult = unknown> {

	/** Expresión que se desea convertir */
	protected expression: QueryExpression<TFields>;

	constructor(expr: QueryExpression<TFields>){
		this.expression = expr;
	}

	/** Método principal que debe implementar el parser para convertir
   * la expresión DSL a la salida deseada. */
  abstract parse(): TResult;
}