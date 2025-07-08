import { ExpressionBuilder, ReferenceExpression } from "kysely";
import { QueryExpression, QueryUnionCondition } from "./QueryExpression";




/** Representa el resultado de vuelto por el método Compile del QueryCompiler 
 * para los Compilers que trabajan con Kysely */
export type CompilerResult<DB, TB extends keyof DB> = (eb: ExpressionBuilder<DB, TB>) => any;


/** Representa el listado de columnas de una tabla de una base de datos */
export type ColumnFields<DB, TB extends keyof DB> = Extract<keyof DB[TB], string>;


/** Representa la primera columna de la tabla */
export type FirstColumn<DB, T extends keyof DB> = keyof DB[T] extends infer K
  ? K extends string
    ? K
    : never
  : never;


/** Representa un campo de una tabla 
 * Ej: 'users.id', 'posts.title'
*/
export type TableRefeference<DB, TB extends keyof DB> = ReferenceExpression<DB, TB>

/**
 * Representa la configuración del comportamiento del método Include del DataQueryBuilder
 * @param DB - Database type
 * @param TB - Main table type
 * @param OTB - Union table type
 */
export type UnionParams<DB, TB extends keyof DB, OTB extends keyof DB> = {

	/** Indica la condición de unión 
	 * Condición opcional de relación (en SQL es obligatoria, en MongoDB puede omitirse) */
	unionCondition?: QueryUnionCondition<
		ColumnFields<DB, TB>, 
		ColumnFields<DB, OTB>
	>,

	/** Indica si se desea realizar un filtro Where inmediatamente despues de realizar la union
	 *  Condición opcional que permite aplicar un filtro inmediatamente después de hacer el Join o Populate */
	filterCondition?: QueryExpression<ColumnFields<DB, TB> | ColumnFields<DB, OTB>>,

	/** Indica el tipo de Join que se va a realizar, por default es inner */
	unionType: "inner" | "left" | "right"
}


/** Representa los campos a seleccionar de una tabla
 * @variation all - Indica que se desea seleccionar todos los campos
 */
export type SelectionFields<DB, TB extends keyof DB> = "all" | ColumnFields<DB, TB> | ColumnFields<DB, TB>[];