/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ExpressionBuilder } from "kysely";
import { AstCondition, AstExpression } from "../Utils/AstExpression";
import { IQueryCompiler, IQueryCompilerDependencies } from "./Interfaces/IQueryCompiler";
import { CompilerResult } from "./Types/Types";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { InternalServerException, InvalidParameterException, NullParameterException } from "../../../ErrorHandling/Exceptions";
import ApplicationContext from "../../../Configurations/ApplicationContext";
import ApplicationException from "../../../ErrorHandling/ApplicationException";


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

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Expresion abstract syntax tree */
	public astExpression: AstExpression | null = null;

	constructor(deps: IQueryCompilerDependencies) {
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "HANDLER",
			entityName: "SqlQueryCompiler",
			applicationContext: deps.applicationContext
		});

		this._applicationContext = deps.applicationContext;
	}

	/** Setea la expresión AST */
	public SetExpression(expr: AstExpression): void {
		this.astExpression = expr;
	}

	/** Compila una condición simple del AST */
	private CompileCondition(condition: AstCondition, eb: ExpressionBuilder<DB, TB>): any {
		try {
			this._logger.Activity("CompileCondition")
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
					throw new InvalidParameterException("CompileCondition", "operator", this._applicationContext, __filename);
			}
		}
		catch(err:any){
			this._logger.Error("FATAL", "CompileCondition", err);
			
			if(err instanceof ApplicationException){
				throw err;
			}
			
			throw new InternalServerException("CompileCondition", "internal-error", this._applicationContext, err);
		}
	}

	/** Compila cualquier nodo del AST */
	private CompileExpression(expr: AstExpression, eb: ExpressionBuilder<DB, TB>): any {
		try {
			this._logger.Activity("CompileExpression");
			switch (expr.type) {
				case 'condition': {
					return this.CompileCondition(expr, eb);
				}
				
				case 'not': {
					return eb.not(this.CompileExpression(expr.expression, eb));
				}
	
				case 'group': {
					const compiled = expr.expressions.map(e => this.CompileExpression(e, eb));
					return expr.operator === 'and'
						? compiled.reduce((acc, curr) => acc.and(curr))
						: compiled.reduce((acc, curr) => acc.or(curr));
				}

				default:
					throw new InvalidParameterException("CompileExpression", "expr.type", this._applicationContext, __filename);
			}
		}
		catch(err:any){
			this._logger.Error("FATAL", "CompileExpression", err);

			if(err instanceof ApplicationException){
				throw err;
			}

			throw new InternalServerException("CompileExpression", "internal-error", this._applicationContext, __filename, err);
		}
	}

	/** Compila el AST en una función que puede ser pasada a .where() */
	public Compile(): CompilerResult<DB, TB> {
		try {
			this._logger.Activity("Compile");

			if(!this.astExpression){
				throw new NullParameterException("Compile", "astExpression", this._applicationContext, __filename);
			}
	
			return (eb) => this.CompileExpression(this.astExpression!, eb);
		}
		catch(err:any){
			this._logger.Error("FATAL", "CompileCondition", err);
			
			if(err instanceof ApplicationException){
				throw err;
			}

			throw new InternalServerException("CompileCondition", "internal-error", this._applicationContext, __filename, err);
		}
	}
}
