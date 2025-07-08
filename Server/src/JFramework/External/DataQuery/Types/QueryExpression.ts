
/* eslint-disable no-use-before-define */
// /* eslint-disable @typescript-eslint/no-redundant-type-constituents */



/** 
 * Operadores lógicos para combinar condiciones.
 * 
 * 'and' — Ambas condiciones deben cumplirse.
 * 'or' — Al menos una de las condiciones debe cumplirse. 
 * */
export type QueryLogicalOperator = 'and' | 'or';

/** 
 * Operadores para comparar valores de texto.
 * 
 * - 'contains': el valor contiene una subcadena.
 * - 'startsWith': el valor empieza con una subcadena.
 * - 'endsWith': el valor termina con una subcadena.
 * - 'in': el valor se encuentra en una lista.
*/
export type QueryTextOperator = 'contains' | 'startsWith' | 'endsWith' | 'in';

/** 
 * Operadores para comparar valores numéricos o escalares.
 * 
 * - '=': igual
 * - '!=': diferente
 * - '<': menor que
 * - '>': mayor que
 * - '>=': mayor o igual que
 * - '<=': menor o igual que
 */
export type QueryComparisonOperator = '=' | '!=' | '<' | '>' | '>=' | '<=';

/**
 * Unión de todos los operadores de comparación y texto disponibles.
 */
export type QueryOperator = QueryComparisonOperator | QueryTextOperator;

/**
 * Representa una condición simple para un campo específico.
 * 
 * Ejemplo: `["edad", ">", 25]`
 * 
 * @template T Lista de nombres de campos válidos (usualmente keyof de un modelo)
 */
export type QueryCondition<T extends string> = [field: T, operator: QueryOperator, value: any];


/** Representa una condición de unión para realizar JOINS */
export type QueryUnionCondition<LeftFields extends string, RightFields extends string> = [
	leftField: LeftFields, 
	operator: QueryComparisonOperator, 
	rightFiled: RightFields 
];


/**
 * Representa la negación de una condición o grupo.
 * 
 * Ejemplo: `["not", ["edad", ">", 25]]`
 * 
 * @template T Lista de nombres de campos válidos
 */
export type QueryNegation<T extends string> = ['not', QueryCondition<T> | QueryGroup<T>];

/**
 * Representa un elemento individual dentro de un grupo de condiciones.
 * Puede ser una condición simple, una negación, o un subgrupo anidado.
 * 
 * @template T Lista de nombres de campos válidos
 */
export type QueryElement<T extends string> = QueryCondition<T> | QueryGroup<T> | QueryNegation<T>;

/**
 * Representa un grupo de condiciones y operadores lógicos ('and'/'or').
 * 
 * Un grupo puede contener condiciones, subgrupos o negaciones anidadas.
 * 
 * Ejemplo:
 * ```ts
 * [
 *   ["edad", ">", 25],
 *   "and",
 *   ["sexo", "=", "F"],
 *   "or",
 *   ["not", ["activo", "=", true]]
 * ]
 * ```
 * 
 * @template T Lista de nombres de campos válidos
 */
export type QueryGroup<T extends string> = (QueryElement<T> | QueryLogicalOperator)[];

/**
 * Representa cualquier expresión válida dentro del DSL.
 * Puede ser:
 * - Una condición simple
 * - Una negación
 * - Un grupo anidado con condiciones y operadores lógicos
 * 
 * @template T Lista de nombres de campos válidos
 */
export type QueryExpression<T extends string> = QueryCondition<T> | QueryGroup<T> | QueryNegation<T>;

