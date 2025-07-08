/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Kysely, SelectQueryBuilder, SelectQueryBuilderWithInnerJoin } from "kysely";
import { IDataQueryBuilder } from "./Interfaces/IDataQueryBuilder";
import { AstExpression } from "../Types/AstExpression";
import { QueryExpression, QueryUnionCondition } from "../Types/QueryExpression";
import { AstParser } from "../Compilers/Parser/AstParser";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";


interface IBuilderDependencies<DB, TB> {
	/** Nombre de la tabla en cuestion */
	table: TB

	/** instancia de kysely de la base de datos en cuestion*/
	database: Kysely<DB>
}

export class PostgresQueryBuilder<DB, TB extends keyof DB & string> implements IDataQueryBuilder<DB, TB> {
	
	/** Instancia de la base de datos kysely */
	private db: Kysely<DB>;

	/** Nombre de la tabla que se está trabajando */
	private tableName: TB;

	/** Consulta where en formato AST */
	private whereAst?: AstExpression;

	/** Objeto querybuilder de kysely */
	private queryBuilder: SelectQueryBuilder<DB, ExtractTableAlias<DB, TB>, {}>;


	constructor(deps: IBuilderDependencies<DB, TB>) {
		this.db = deps.database;
		this.tableName = deps.table;
		this.queryBuilder = this.db.selectFrom(deps.table);
	}

	/** Procesa la expresión y construye el AST */
	Where(expr: QueryExpression<keyof DB[TB] & string>): IDataQueryBuilder<DB, TB> {
		const ast = new AstParser(expr).parse();
		this.whereAst = ast;
		return this;
	}

	/** Permite traer relaciones anidadas */
	Include<OtherTable extends keyof DB & string>(
		otherTable: OtherTable,
		onCondition?: QueryUnionCondition<keyof DB[TB] & string, DB[OtherTable] & string>
	): IDataQueryBuilder<DB, TB> {

		if(!onCondition) throw new Error("error");

		const leftFieldIndex = 0;
		const operatorIndex = 1;
		const rightFieldIndex = 2;

		this.queryBuilder = this.queryBuilder.innerJoin(
			otherTable, 
			(join)=> join.on(
				`${this.tableName}.${onCondition[leftFieldIndex]}` as any,
				`${onCondition[operatorIndex]}`,
				`${otherTable}.${onCondition[rightFieldIndex]}` as any
			)
		);

		return this;
	}

	/** Campos específicos a seleccionar */
	SelectFields(fields: (keyof DB[TB] & string)[]): this {
		this.queryBuilder = this.queryBuilder.select(fields.map(f => `${this.tableName}.${f}`) as any);
		return this;
	}

	/** Ordenar por campo */
	SortBy(field: keyof DB[TB] & string, direction: 'asc' | 'desc'): this {
		this.queryBuilder = this.queryBuilder.orderBy(`${this.tableName}.${field}`, direction);
		return this;
	}

	/** Limita el número de resultados */
	Take(count: number): this {
		this.queryBuilder = this.queryBuilder.limit(count);
		return this;
	}

	/** Saltar X resultados (paginación) */
	Skip(offset: number): this {
		this.queryBuilder = this.queryBuilder.offset(offset);
		return this;
	}

	/** Ejecuta la consulta y devuelve los datos */
	async Execute(): Promise<any[]> {
		if (this.whereAst) {
			const compiler = new SqlQueryCompiler(this.whereAst);
			const whereFn = compiler.Compile();
			this.queryBuilder = this.queryBuilder.where(whereFn as any);
		}

		return await this.queryBuilder.execute();
	}
}