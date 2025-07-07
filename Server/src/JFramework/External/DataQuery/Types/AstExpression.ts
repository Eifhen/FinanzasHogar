/* eslint-disable no-use-before-define */

import { QueryLogicalOperator, QueryOperator } from "./QueryExpression";

/**
 * Operadores de comparación y de texto compatibles con el DSL.
 */
export type AstOperator = QueryOperator;

/**
 * Nodo del AST que representa una condición básica.
 *
 * Ejemplo: { type: 'condition', field: 'edad', operator: '>', value: 25 }
 */
export interface AstCondition {
  /** Tipo del nodo: condición básica */
  type: 'condition';

  /** Campo al que se aplica la condición */
  field: string;

  /** Operador usado en la condición */
  operator: AstOperator;

  /** Valor contra el cual se evalúa el campo */
  value: any;
}

/**
 * Nodo del AST que representa una negación (NOT).
 *
 * Puede negar una condición o un grupo completo.
 *
 * Ejemplo: { type: 'not', expression: { ... } }
 */
export interface AstNot {
  /** Tipo del nodo: negación */
  type: 'not';

  /** Expresión que se está negando */
  expression: AstExpression;
}

/**
 * Nodo del AST que representa un grupo de condiciones
 * combinadas con un operador lógico ('and' o 'or').
 *
 * Ejemplo: {
 *   type: 'group',
 *   operator: 'and',
 *   expressions: [ ... ]
 * }
 */
export interface AstGroup {
  /** Tipo del nodo: grupo */
  type: 'group';

  /** Operador lógico usado para combinar expresiones */
  operator: QueryLogicalOperator;

  /** Lista de expresiones (condiciones, grupos o negaciones) */
  expressions: AstExpression[];
}

/**
 * Unión de todos los tipos de nodos que puede haber en el AST.
 * 
 * Una expresión puede ser:
 * - Una condición
 * - Una negación
 * - Un grupo lógico
 * 
 * Ejemplo de salida:
 * 
 * @example
 	```ts
		## Entrada DSL

		const dsl: QueryExpression = [
			["edad", ">", 25],
			"and",
			["sexo", "=", "M"],
			"and",
			["not", [
				["nombre", "contains", "Gabriel"],
				"or",
				["apellido", "=", "Jimenez"]
			]]
		];

		## Salida Parser
		{
			type: 'group',
			operator: 'and',
			expressions: [
				{ type: 'condition', field: 'edad', operator: '>', value: 25 },
				{ type: 'condition', field: 'sexo', operator: '=', value: 'M' },
				{
					type: 'not',
					expression: {
						type: 'group',
						operator: 'or',
						expressions: [
							{ type: 'condition', field: 'nombre', operator: 'contains', value: 'Gabriel' },
							{ type: 'condition', field: 'apellido', operator: '=', value: 'Jimenez' }
						]
					}
				}
			]
		}
	```
 */
export type AstExpression = AstCondition | AstNot | AstGroup;
