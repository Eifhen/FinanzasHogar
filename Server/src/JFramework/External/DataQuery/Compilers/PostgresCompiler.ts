/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ExpressionBuilder } from "kysely";
import { AstCondition, AstExpression } from "../Types/AstExpression";
import { IQueryCompiler } from "./Interfaces/IQueryCompiler";
import { CompilerResult, TableColumns } from "../Types/CompilerTypes";


export class PostgresQueryCompiler<DB, TB extends keyof DB> implements IQueryCompiler<TableColumns<DB, TB>, CompilerResult<DB, TB>> {

	/** Expresion abstract syntax tree */
	public readonly astExpression: AstExpression;

	constructor(ast: AstExpression) {
		this.astExpression = ast;
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
		return (eb) => this.compileExpression(this.astExpression, eb);
	}
}
