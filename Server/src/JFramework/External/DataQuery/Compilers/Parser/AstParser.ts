/* eslint-disable @typescript-eslint/no-magic-numbers */

import {
	QueryExpression,
	QueryGroup,
	QueryCondition,
	QueryLogicalOperator,
	QueryNegation
} from "../../Types/QueryExpression";

import {
	AstExpression,
	AstCondition,
	AstGroup,
	AstNot,
	AstOperator
} from "../../Types/AstExpression";


/** Convierte la expresion DSL (QueryExpression)
 * en un objeto Abstract Syntax Tree (Árbol intermedio de consulta) */
export class AstParser<T extends string> {

	/** Expresion DSL recibida */
	private expr: QueryExpression<T>;

	constructor(expr: QueryExpression<T>) {
		this.expr = expr;
	}

	/**
	 * Punto de entrada del parser.
	 * @returns {AstExpression} Árbol sintáctico abstracto (AST) */
	public parse(): AstExpression {
		return this.parseExpression(this.expr);
	}

	/**
	 * Detecta y redirige el tipo de expresión DSL que se está procesando.
	 * @param expr Expresión del DSL
	 * @returns Nodo correspondiente del AST */
	private parseExpression(expr: QueryExpression<T>): AstExpression {
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

		throw new Error("Expresión DSL inválida");
	}

	/**
	 * Convierte una condición simple en un nodo de tipo `AstCondition`.
	 * @param condition Condición simple DSL
	 * @returns Nodo AST de tipo `condition` */
	private parseCondition(condition: QueryCondition<T>): AstCondition {
		const [field, operator, value] = condition;
		return {
			type: "condition",
			field,
			operator: operator as any as AstOperator,
			value
		};
	}

	/**
	 * Convierte una negación DSL en un nodo `AstNot`.
	 * @param expr Negación tipo ['not', expr]
	 * @returns Nodo AST de tipo `not` */
	private parseNegation(expr: QueryNegation<T>): AstNot {
		const [, innerExpr] = expr;
		return {
			type: "not",
			expression: this.parseExpression(innerExpr)
		};
	}

	/**
	 * Convierte un grupo de expresiones con operadores lógicos en un nodo AST.
	 * Puede manejar grupos anidados y negaciones.
	 * @param group Grupo DSL de condiciones y operadores lógicos
	 * @returns Nodo AST de tipo `group` */
	private parseGroup(group: QueryGroup<T>): AstGroup {
		const expressions: AstExpression[] = [];
		let currentOp: QueryLogicalOperator | null = null;
		let buffer: (QueryExpression<T> | QueryNegation<T>)[] = [];

		const flushBuffer = () => {
			/** Significaria que no hay operandos */
			if (buffer.length === 0) {
				// console.log("El buffer está en 0", buffer);
				return;
			}

			/** Si hay operandos entonces seguimos */
			if (buffer.length === 1) {
				// console.log("El buffer tiene un elemento =>", buffer);
				expressions.push(this.parseExpression(buffer[0]));
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
				if (buffer.length === 0) {
					throw new Error("Error de sintaxis: operador lógico sin operandos");
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

	/** Determina si una expresión es una condición simple */
	private isCondition(expr: any): expr is QueryCondition<T> {
		return Array.isArray(expr) && typeof expr[0] === "string" && expr.length === 3;
	}

	/** Determina si una expresión es una negación ['not', expr] */
	private isNegation(expr: any): expr is QueryNegation<T> {
		return Array.isArray(expr) && expr[0] === "not";
	}
}
