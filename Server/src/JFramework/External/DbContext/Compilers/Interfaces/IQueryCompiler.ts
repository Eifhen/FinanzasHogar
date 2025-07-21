/* eslint-disable @typescript-eslint/no-unused-vars */

import ApplicationContext from "../../../../Configurations/ApplicationContext";
import { AstExpression } from "../Types/AstExpression";



export interface IQueryCompilerDependencies {
	applicationContext:  ApplicationContext;
}

/**
 * Interfaz base para compilar un árbol de sintaxis (AST) a cualquier formato,
 * como funciones para motores SQL (Kysely), filtros MongoDB, etc.
 *
 * @template TFields Campos válidos para construir la consulta
 * @template TResult Tipo de resultado producido (ej. función Kysely, objeto Mongo, string SQL, etc.)
 */
export interface IQueryCompiler<DB, TB extends keyof DB, TResult> {
	
	/** Expresión ya convertida a AST */
	astExpression: AstExpression | null;

	/** Setea la propiedad astExpression */
	SetExpression(expr: AstExpression): void;

	/**
	 * Método abstracto que debe implementar cada compilador según su motor.
	 * Transforma el AST en la salida deseada (función, filtro, SQL, etc.)
	 */
	Compile(): TResult;
}
