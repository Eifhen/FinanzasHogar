/* eslint-disable @typescript-eslint/no-unused-vars */

import { AstExpression } from "../../Types/AstExpression";


/**
 * Interfaz base para compilar un árbol de sintaxis (AST) a cualquier formato,
 * como funciones para motores SQL (Kysely), filtros MongoDB, etc.
 *
 * @template TFields Campos válidos para construir la consulta
 * @template TResult Tipo de resultado producido (ej. función Kysely, objeto Mongo, string SQL, etc.)
 */
export interface IQueryCompiler<TFields extends string, TResult> {
	/** Expresión ya convertida a AST */
	astExpression: AstExpression;

	/**
	 * Método abstracto que debe implementar cada compilador según su motor.
	 * Transforma el AST en la salida deseada (función, filtro, SQL, etc.)
	 */
	Compile(): TResult;
}
