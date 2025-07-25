import { Kysely } from "kysely";
import { ColumnFields } from "../../Compilers/Types/Types";
import { QueryUnionCondition, QueryExpression } from "../../Compilers/Types/QueryExpression"
import ApplicationContext from "../../../../Configurations/ApplicationContext";
import { DatabaseType } from "../../../DataBases/Types/DatabaseType";
import ILoggerManager from "../../../../Managers/Interfaces/ILoggerManager";
import { IQueryCompiler } from "../../Compilers/Interfaces/IQueryCompiler";
import { AstParser } from "../../Compilers/Parser/AstParser";

/**
 * Representa la configuración del comportamiento del método Include del DataQueryBuilder
 * @param DB - Database type
 * @param TB - Main table type
 * @param OTB - Union table type
 */
export type IncludeParams<DB, TB extends keyof DB, OTB extends keyof DB> = {

	/** - Indica la condición de unión.
	 * - Condición opcional de relación (en SQL es obligatoria, en MongoDB puede omitirse) */
	unionCondition?: QueryUnionCondition<
		ColumnFields<DB, TB>, 
		ColumnFields<DB, OTB>
	>,

	/** - Indica si se desea realizar un filtro Where al realizar la unión.
	 *  - Condición opcional que permite aplicar un filtro al hacer el Join o Populate */
	filterCondition?: QueryExpression<ColumnFields<DB, TB> | ColumnFields<DB, OTB>>,

	/** Indica el tipo de Join que se va a realizar, por default es inner */
	unionType: "inner" | "left" | "right"
}


/** Representa los campos a seleccionar de una tabla
 * @variation all - Indica que se desea seleccionar todos los campos
 */
export type SelectionFields<DB, TB extends keyof DB> = "all" | ColumnFields<DB, TB> | ColumnFields<DB, TB>[];


/** Flags que se utilizan en el queryBuilder */
export type QueryBuilderFlags = {
	/** Indica que si se ha usado una instrucción Where */
	hasWhere: boolean,

	/** Indica que si se ha usado una instrucción Sort */
	hasSort: boolean,

	/** Indica que si se ha usado una instrucción Include */
	hasInclude: boolean,

	/** Indica que si se ha usado una instrucción Select */
	hasSelect: boolean,

	/** Indica que si se ha usado una instrucción Take */
	hasTake: boolean,

	/** Indica que si se ha usado una instrucción Skip */
	hasSkip: boolean,

	/** Indica que si se ha usado una instrucción Count */
	hasCount: boolean;

	/** Indica que si se ha usado una instrucción Pagination */
	hasPagination: boolean;
}

/** Opciones de configuración del queryBuilder */
export type QueryBuilderConfigurationOptions<DB> = {

	/** Tipo debase de datos */
	databaseType: DatabaseType;

	/** instancia de kysely de la base de datos en cuestion*/
  database: Kysely<DB>;
}

/** Dependencias de cada querybuilder */
export type QueryBuilderInitializerDependencies<DB> = {

  /** Contexto de aplicación */
  applicationContext: ApplicationContext;

  /** Opciones de configuración del queryBuilder */
  options: QueryBuilderConfigurationOptions<DB>
}

export type QueryBuilderDependencies = {
  compiler: IQueryCompiler<any, any, any>,
  parser: AstParser,
  logger: ILoggerManager,
  applicationContext: ApplicationContext,
  options: QueryBuilderConfigurationOptions<any>
}