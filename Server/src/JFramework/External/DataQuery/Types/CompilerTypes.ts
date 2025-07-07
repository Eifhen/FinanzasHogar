import { ExpressionBuilder } from "kysely";






/** Representa el resultado de vuelto por el método Compile del QueryCompiler 
 * para los Compilers que trabajan con Kysely */
export type CompilerResult<DB, TB extends keyof DB> = (eb: ExpressionBuilder<DB, TB>) => any;


/** Representa el listado de columnas de una tabla de una base de datos */
export type TableColumns<DB, TB extends keyof DB> = Extract<keyof DB[TB], string>;