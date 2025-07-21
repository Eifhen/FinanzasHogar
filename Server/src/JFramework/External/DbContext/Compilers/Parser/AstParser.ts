import {
	QueryExpression,
	QueryGroup,
	QueryCondition,
	QueryLogicalOperator,
	QueryNegation
} from "../Types/QueryExpression";

import {
	AstExpression,
	AstCondition,
	AstGroup,
	AstNot,
	AstOperator
} from "../Types/AstExpression";
import ApplicationContext from "../../../../Configurations/ApplicationContext";
import ILoggerManager from "../../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../../Managers/LoggerManager";
import { InternalServerException, InvalidParameterException, NullParameterException } from "../../../../ErrorHandling/Exceptions";
import ApplicationException from "../../../../ErrorHandling/ApplicationException";
import { AST_EXPRESSION_LENGTH, AST_BUFFER_MIN_LENGTH, DEFAULT_INDEX, DEFAULT_NUMBER } from "../../../../Utils/const";


interface AstParserDependencies {
	applicationContext: ApplicationContext;
}

/** Convierte la expresion DSL (QueryExpression)
 * en un objeto Abstract Syntax Tree (Árbol intermedio de consulta) */
export class AstParser {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: AstParserDependencies) {
		this._applicationContext = deps.applicationContext;

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "HANDLER",
			entityName: "AstParser",
			applicationContext: deps.applicationContext
		});
	}

	/**
	 * Punto de entrada del parser.
	 * @returns {AstExpression} Árbol sintáctico abstracto (AST) */
	public parse<T extends string>(expr: QueryExpression<T>): AstExpression {
		try {
			this._logger.Activity("parse");
			return this.parseExpression<T>(expr);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "parse", err);
			throw new InternalServerException("parse", "internal-error", this._applicationContext, __filename, err);
		}
	}

	/**
	 * Detecta y redirige el tipo de expresión DSL que se está procesando.
	 * @param expr Expresión del DSL
	 * @returns Nodo correspondiente del AST */
	private parseExpression<T extends string>(expr: QueryExpression<T>): AstExpression {
		try {
			this._logger.Activity("parseExpression");
			if (this.isCondition(expr)) {
				// console.log("La expresión es una condición =>", expr);
				return this.parseCondition(expr);
			}

			if (this.isNegation(expr)) {
				// console.log("La expresión es una negación =>", expr);
				return this.parseNegation(expr);
			}

			if (Array.isArray(expr)) {
				// console.log("La expresión es un grupo =>", expr);
				return this.parseGroup(expr as any as QueryGroup<T>);
			}

			throw new InvalidParameterException("parseExpression", "expr", this._applicationContext, __filename);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "parseExpression", err);
			if (err instanceof ApplicationException) {
				throw err;
			}
			throw new InternalServerException("parseExpression", "internal-error", this._applicationContext, __filename, err);
		}
	}

	/**
	 * Convierte una condición simple en un nodo de tipo `AstCondition`.
	 * @param condition Condición simple DSL
	 * @returns Nodo AST de tipo `condition` */
	private parseCondition<T extends string>(condition: QueryCondition<T>): AstCondition {
		try {
			this._logger.Activity("parseCondition");
			const [field, operator, value] = condition;
			return {
				type: "condition",
				field,
				operator: operator as any as AstOperator,
				value
			};
		}
		catch(err:any){
			this._logger.Error("ERROR", "parseCondition", err);
			throw new InternalServerException("parseCondition", "internal-error", this._applicationContext, __filename, err);
		}
	}

	/**
	 * Convierte una negación DSL en un nodo `AstNot`.
	 * @param expr Negación tipo ['not', expr]
	 * @returns Nodo AST de tipo `not` */
	private parseNegation<T extends string>(expr: QueryNegation<T>): AstNot {
		try {
			this._logger.Activity("parseNegation");
			const [, innerExpr] = expr;
			return {
				type: "not",
				expression: this.parseExpression(innerExpr)
			};
		}
		catch(err:any){
			this._logger.Error("ERROR", "parseNegation", err);
			throw new InternalServerException("parseNegation", "internal-error", this._applicationContext, __filename, err);
		}
	}

	/**
	 * Convierte un grupo de expresiones con operadores lógicos en un nodo AST.
	 * Puede manejar grupos anidados y negaciones.
	 * @param group Grupo DSL de condiciones y operadores lógicos
	 * @returns Nodo AST de tipo `group` */
	private parseGroup<T extends string>(group: QueryGroup<T>): AstGroup {
		try {
			this._logger.Activity("parseGroup");

			const expressions: AstExpression[] = [];
			let currentOp: QueryLogicalOperator | null = null;
			let buffer: (QueryExpression<T> | QueryNegation<T>)[] = [];
	
			const flushBuffer = () => {
				/** Significaria que no hay operandos */
				if (buffer.length === DEFAULT_INDEX) {
					// console.log("El buffer está en 0", buffer);
					return;
				}
	
				/** Si hay operandos entonces seguimos */
				if (buffer.length === AST_BUFFER_MIN_LENGTH) {
					// console.log("El buffer tiene un elemento =>", buffer);
					expressions.push(this.parseExpression(buffer[DEFAULT_INDEX]));
				} else {
					// console.log('El buffer es un subgrupo =>', buffer);
					// subgrupo
					expressions.push({
						type: "group",
						operator: currentOp || "and",
						expressions: buffer.map(this.parseExpression.bind(this))
					});
				}
	
				buffer = [];
				// console.log("El buffer ha sido limpiado", buffer);
			};
	
			/** Validamos los elementos del grupo */
			for (const item of group) {
				if (typeof item === "string" && (item === "and" || item === "or")) {
	
					/** El primer item no puede ser un operador logico, 
					 * tiene que ser una expresion */
					if (buffer.length === DEFAULT_NUMBER) {
						// Error de sintaxis: operador lógico sin operandos
						throw new NullParameterException("flushBuffer", "buffer", this._applicationContext, __filename);
					}
	
					// console.log("El item actual es un operador", item);
					flushBuffer();
					currentOp = item;
				} else {
					// console.log("El item actual es una expresion, se procedera a agregarla al buffer =>", item);
					buffer.push(item as any as QueryCondition<T> | QueryGroup<T> | QueryNegation<T>);
				}
			}
	
			// console.log("ultimo flush");
			flushBuffer();
	
			// console.log("Expresiones =>", expressions);
	
			return {
				type: "group",
				operator: currentOp || "and",
				expressions
			};
		}
		catch(err:any){
			this._logger.Error("ERROR", "parseGroup", err);
			throw new InternalServerException("parseGroup", "internal-error", this._applicationContext, __filename, err);
		}
	}

	/** Determina si una expresión es una condición simple */
	private isCondition<T extends string>(expr: any): expr is QueryCondition<T> {
		return Array.isArray(expr) && typeof expr[DEFAULT_INDEX] === "string" && expr.length === AST_EXPRESSION_LENGTH;
	}

	/** Determina si una expresión es una negación ['not', expr] */
	private isNegation<T extends string>(expr: any): expr is QueryNegation<T> {
		return Array.isArray(expr) && expr[DEFAULT_INDEX] === "not";
	}
}
