/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ExpressionBuilder } from "kysely";
import { AstCondition, AstExpression } from "../Utils/AstExpression";
import { IQueryCompiler } from "./Interfaces/IQueryCompiler";
import { CompilerResult } from "./Types/Types";


/** Compilador de querys para PostgreSQL, 
 * traduce una expresión AST a una consulta `WHERE` 
 * valida para kysely esto nos permite traducir expresiones como:
 * 
 * @example
 * ```ts
 * const filter = [
 *   ["edad", ">", 25],
 *   "and",
 *   ["sexo", "=", "F"],
 *   "or",
 *   ["not", ["activo", "=", true]]
 * ];
 * 
 * await adapter.find(filter);
 * ```
 * 
 * En codigo de kysely:
 * 
 * @example
 * ```ts 
 * const person = await db.selectFrom("person")
 * .select("name")
 * .where("edad", ">", 25)
 * .where("sexo", "=", "F")
 * .execute();	
 * ```
 *  
 * */
export class SqlQueryCompiler<DB, TB extends Extract<keyof DB, string>> implements IQueryCompiler<DB, TB, CompilerResult<DB, TB>> 
{

	/** Expresion abstract syntax tree */
	public astExpression: AstExpression | null = null;

	constructor() {
		//
	}

	/** Setea la expresión AST */
	public SetExpression(expr: AstExpression): void {
		this.astExpression = expr;
	}

	/** Compila una condición simple del AST */
	private compileCondition(condition: AstCondition, eb: ExpressionBuilder<DB, TB>): any {
		const { field, operator, value } = condition;

		switch (operator) {
			case '=': return eb(field as any, '=', value);
			case '!=': return eb(field as any, '!=', value);
			case '>': return eb(field as any, '>', value);
			case '<': return eb(field as any, '<', value);
			case '>=': return eb(field as any, '>=', value);
			case '<=': return eb(field as any, '<=', value);

			case 'contains':
				return eb(field as any, 'like', `%${value}%`);
			case 'startsWith':
				return eb(field as any, 'like', `${value}%`);
			case 'endsWith':
				return eb(field as any, 'like', `%${value}`);
			case 'in':
				return eb(field as any, 'in', value);

			default:
				throw new Error(`Operador no soportado: ${operator as any}`);
		}
	}

	/** Compila cualquier nodo del AST */
	private compileExpression(expr: AstExpression, eb: ExpressionBuilder<DB, TB>): any {
		switch (expr.type) {
			case 'condition': {
				return this.compileCondition(expr, eb);
			}
			
			case 'not': {
				return eb.not(this.compileExpression(expr.expression, eb));
			}

			case 'group': {
				const compiled = expr.expressions.map(e => this.compileExpression(e, eb));
				return expr.operator === 'and'
					? compiled.reduce((acc, curr) => acc.and(curr))
					: compiled.reduce((acc, curr) => acc.or(curr));
			}
		}
	}

	/** Compila el AST en una función que puede ser pasada a .where() */
	public Compile(): CompilerResult<DB, TB> {
		if(!this.astExpression){
			throw new Error("error");
		}

		return (eb) => this.compileExpression(this.astExpression!, eb);
	}
}
