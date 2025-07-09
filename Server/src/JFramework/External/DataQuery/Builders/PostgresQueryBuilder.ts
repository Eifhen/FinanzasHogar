
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Insertable, Kysely, KyselyConfig, ReferenceExpression, SelectQueryBuilder, Updateable } from "kysely";
import { IDataQueryBuilder } from "./Interfaces/IDataQueryBuilder";
import { AstExpression } from "../Utils/AstExpression";
import { QueryExpression } from "../Utils/QueryExpression";
import { AstParser } from "../Compilers/Parser/AstParser";
import { SqlQueryCompiler } from "../Compilers/SqlQueryCompiler";
import { IQueryCompiler } from "../Compilers/Interfaces/IQueryCompiler";
import { OrderByDirection } from "kysely/dist/cjs/parser/order-by-parser";
import ApplicationContext from "../../../Configurations/ApplicationContext";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { DatabaseOperationException, DatabaseQueryBuildException, NullParameterException } from "../../../ErrorHandling/Exceptions";
import { DEFAULT_NUMBER } from "../../../Utils/const";
import IPaginationResult from "../../../Helpers/Interfaces/IPaginationResult";
import IPaginationArgs from "../../../Helpers/Interfaces/IPaginationArgs";
import { QueryBuilderConfigurationOptions, QueryBuilderDependencies, QueryBuilderFlags, SelectionFields, UnionParams } from "./Types/Types";
import { ColumnFields } from "../Compilers/Types/Types";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import { ExecutionStage, IncludeStage, InitialStage, WhereStage, WhereStageQuery } from "./Interfaces/IDataQueryBuilderStages";
import { AutoClassBindAll } from "../../../Helpers/Decorators/AutoBind";



/** Query Builder para PostgreSQl

@example
```ts 
 const builder = new PostgresQueryBuilder<InternalDatabase, "gj_proyects">({
	applicationContext: {} as ApplicationContext,
	options: {
		databaseType: "postgre_sql_database",
		primaryKey: "id",
		database: new Kysely({} as KyselyConfig),
		table: "gj_proyects"
	}
});
		
	const result = await builder.Where(["name", "=", "Gabo"])
	.Select(["description", "name"])
	.Skip(10)
	.Take(10)
	.SortBy("name", "desc")
	.Include(
		"gj_tenant_connection_view", 
		["name", "=", "connection"], 
		["status", "<", "hola"]
	)
	.Execute();
``` */

@AutoClassBindAll
export class PostgresQueryBuilder<	
	DB, 
	TB extends Extract<keyof DB, string>, 
	TResult extends object = any
> implements IDataQueryBuilder<DB, TB, TResult>
{

	/** Opciones de configuración del queryBuilder */
	private readonly _options: QueryBuilderConfigurationOptions<DB, TB>;

	/** Objeto querybuilder de kysely */
	private _queryBuilder: SelectQueryBuilder<DB, any, {}>;

	/** Compilador */
	private readonly _compiler: IQueryCompiler<DB, TB, any>;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Indica si el metodo sort ha sido llamado */
	public builderFlags: QueryBuilderFlags = {
		hasWhere: false,
		hasInclude: false,
		hasSort: false,
		hasSelect: false,
		hasTake: false,
		hasSkip: false,
		hasCount: false,
		hasPagination: false,
	}

	/** Expone los metodos */
	public query: InitialStage<DB, TB, TResult>;

	constructor(deps: QueryBuilderDependencies<DB, TB>) {
	
		this._options = deps.options;
		this._applicationContext = deps.applicationContext;
		this._queryBuilder = this._options.database.selectFrom(this._options.table);
		this._compiler = new SqlQueryCompiler();
		this.query = this.SetInitialStage();

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "BUILDER",
			entityName: "PostgresQueryBuilder",
			applicationContext: deps.applicationContext
		});
		
	}

	/** Resetea todas las banderas */
	private ResetFlags(): void {
		this._logger.Activity("ResetFlags");
		this.builderFlags = {
			hasWhere: false,
			hasInclude: false,
			hasSort: false,
			hasSelect: false,
			hasTake: false,
			hasSkip: false,
			hasCount: false,
			hasPagination: false
		}
	}

	/** Procesa la expresión y construye el AST */
	private Where(expr: QueryExpression<ColumnFields<DB, TB>>): any {
		try {
			this._logger.Activity("Where");
			this.builderFlags.hasWhere = true;

			const ast: AstExpression = new AstParser(expr).parse();
			this._compiler.SetExpression(ast);
			const whereFn = this._compiler.Compile();
			this._queryBuilder = this._queryBuilder.where(whereFn);

			return this;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Where", err);
			throw new DatabaseQueryBuildException(
				"Where",
				"Where",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Permite traer relaciones anidadas */
	private Include<OTB extends Extract<keyof DB, string>>(otherTable: OTB, args: UnionParams<DB, TB, OTB>): IncludeStage<DB, TB, any> {
		try {
			this._logger.Activity("Include");
			this.builderFlags.hasInclude = true;

			/** Validamos que la condición de unión exista, 
			 * esto es necesario en SQL */
			if (!args.unionCondition) {
				throw new NullParameterException(
					"Include",
					"unionCondition",
					this._applicationContext,
					__filename
				);
			}

			const leftFieldIndex = 0;
			const operatorIndex = 1;
			const rightFieldIndex = 2;

			/** Aplicamos el JOIN */
			if (args.unionType === "inner") {
				this._queryBuilder = this._queryBuilder.innerJoin(
					otherTable,
					(join) => join.on(
						`${this._options.table}.${args.unionCondition![leftFieldIndex]}` as any,
						`${args.unionCondition![operatorIndex]}`,
						`${otherTable}.${args.unionCondition![rightFieldIndex]}` as any
					)
				) as any;
			}

			if (args.unionType === "left") {
				this._queryBuilder = this._queryBuilder.leftJoin(
					otherTable,
					(join) => join.on(
						`${this._options.table}.${args.unionCondition![leftFieldIndex]}` as any,
						`${args.unionCondition![operatorIndex]}`,
						`${otherTable}.${args.unionCondition![rightFieldIndex]}` as any
					)
				) as any;
			}

			if (args.unionType === "right") {
				this._queryBuilder = this._queryBuilder.rightJoin(
					otherTable,
					(join) => join.on(
						`${this._options.table}.${args.unionCondition![leftFieldIndex]}` as any,
						`${args.unionCondition![operatorIndex]}`,
						`${otherTable}.${args.unionCondition![rightFieldIndex]}` as any
					)
				) as any;
			}

			/** Aplicamos la condición de filtrado */
			if (args.filterCondition) {
				this.Where(args.filterCondition);
			}

			return this as unknown as IncludeStage<DB, TB, any>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Include", err);
			throw new DatabaseQueryBuildException(
				"Include",
				"Include",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Campos específicos a seleccionar */
	private Select(data: SelectionFields<DB, TB>): WhereStageQuery<DB, TB, TResult> {
		try {
			this._logger.Activity("SelectFields");
			this.builderFlags.hasSelect = true;

			/** Seleccionamos todos los registros */
			if (data === "all") {
				this._queryBuilder = this._queryBuilder.selectAll();
				return this as unknown as WhereStageQuery<DB, TB, TResult>;
			}

			const fields = Array.isArray(data) ? data : [data];

			this._queryBuilder = this._queryBuilder.select(
				fields.map(field => `${this._options.table}.${field}`) as any
			);

			return this as unknown as WhereStageQuery<DB, TB, TResult>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "SelectFields", err);
			throw new DatabaseQueryBuildException(
				"SelectFields",
				"SelectFields",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Ordenar por campo */
	private SortBy(field: ColumnFields<DB, TB>, dir?: OrderByDirection): WhereStageQuery<DB, TB, TResult> {
		try {
			this._logger.Activity("SortBy");
			this.builderFlags.hasSort = true;

			const fieldSort: ReferenceExpression<DB, TB> = `${this._options.table}.${field}`;

			this._queryBuilder = this._queryBuilder.orderBy(
				fieldSort,
				dir
			);

			return this as unknown as WhereStageQuery<DB, TB, TResult>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "SortBy", err);
			throw new DatabaseQueryBuildException(
				"SortBy",
				"SortBy",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Limita el número de resultados */
	private Take(count: number): WhereStageQuery<DB, TB, TResult> {
		try {
			this._logger.Activity("Take");
			this.builderFlags.hasTake = true;
			
			this._queryBuilder = this._queryBuilder.limit(count);
			return this as unknown as WhereStageQuery<DB, TB, TResult>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Take", err);
			throw new DatabaseQueryBuildException(
				"Take",
				"Take",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Saltar X resultados (paginación) */
	private Skip(offset: number): WhereStageQuery<DB, TB, TResult> {
		try {
			this._logger.Activity("Skip");
			this.builderFlags.hasSkip = true;

			this._queryBuilder = this._queryBuilder.offset(offset);
			return this as unknown as WhereStageQuery<DB, TB, TResult>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Skip", err);
			throw new DatabaseQueryBuildException(
				"Skip",
				"Skip",
				this._applicationContext,
				__filename,
				err
			);
		}

	}

	/** Devuelve el número total de registros que cumplen con la consulta actual (sin aplicar Take ni Skip) */
	private async Count(): Promise<number> {
		try {
			this._logger.Activity("Count");
			this.builderFlags.hasCount = true;

			/** Aplicamos el count */
			this._queryBuilder
			.select((eb) => eb.fn.countAll().as('total'));
			
			/** Ejecutamos la consulta */
			const result = await this.ExecuteAndTakeFirst();

			return Number(result?.total || DEFAULT_NUMBER);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Count", err);
			throw new DatabaseQueryBuildException(
				"Count",
				"Count",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Pagina la data según los argumentos de paginación proporcionados */
	private async Paginate(args: IPaginationArgs): Promise<IPaginationResult<any>> {
		try {
			this._logger.Activity("Paginate");
			this.builderFlags.hasPagination = true;

			const offsetIndex = 1;

			/** Representa el registro apartir del cual se comienza a contar */
			const offset = (args.currentPage - offsetIndex) * args.pageSize;

			const totalItems = await this.Count();
			const totalPages = Math.ceil(totalItems / args.pageSize);

			const sortField = `${this._options.table}.${this._options.primaryKey}`;

			/** Si no se ha hecho selección seleccionamos todos los registros */
			if(!this.builderFlags.hasSelect){
				this._queryBuilder.selectAll();
			}

			/** Aplicamos la paginación */
			this._queryBuilder
			.orderBy(sortField as any)
			.offset(offset)
			.limit(args.pageSize);

			/** Ejecutamos la consulta */
			const result = await this.Execute();

			return {
				result,
				options: {
					/** Tamaño de las páginas */
					pageSize: args.pageSize,

					/** la página actual me va a decir cuantas páginas tengo que hacer skip */
					currentPage: args.currentPage,

					/** Número total de páginas es igual al total de registros / total de páginas  */
					totalPages,

					/** Sirve para saber el número total de elementos */
					totalItems
				}
			} as IPaginationResult<any>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Paginate", err);
			throw new DatabaseQueryBuildException(
				"Paginate",
				"Paginate",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Método que nos permite insertar un registro en la base de datos */
	private Insert(record: Insertable<DB[TB]>) : ExecutionStage<TResult>{
		try {
			this._logger.Activity("Insert");

			this._options.database
			.insertInto(this._options.table)
			.values(record)
			.returningAll();
			
			return this as unknown as ExecutionStage<TResult>;
		}
		catch(err:any){
			this._logger.Error("ERROR", "Insert", err);
			throw new DatabaseOperationException(
				"Insert",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

 	/** Método que nos permite actualizar un registro en la base de datos */
	private Update(changes: Updateable<DB[TB]>) : WhereStage<DB, TB, TResult, 'operation'>{
		try {
			this._logger.Activity("Update");

			this._queryBuilder = (this._queryBuilder as any as Kysely<DB>)
			.updateTable(this._options.table)
			.set(changes as UpdateObjectExpression<DB, ExtractTableAlias<DB, TB>>)
			.returningAll() as any;
			
			return this as unknown as WhereStage<DB, TB, TResult, 'operation'>;
		}
		catch(err:any){
			this._logger.Error("ERROR", "Update", err);
			throw new DatabaseOperationException(
				"Update",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Método que nos permite eliminar un registro, 
   * debe ser usado en conjunto con WHERE para eliminar registros especificos */
	private Delete() : WhereStage<DB, TB, TResult, 'operation'>{
		try {
			this._logger.Activity("Delete");

			// Por implementar

			return this as unknown as WhereStage<DB, TB, TResult, 'operation'>;
		}
		catch(err:any){
			this._logger.Error("ERROR", "Delete", err);
			throw new DatabaseOperationException(
				"Delete",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Ejecuta la consulta y devuelve los datos */
	private async Execute(): Promise<any> {
		try {
			this._logger.Activity("Execute");

			/** Reseteamos las banderas */
			this.ResetFlags();

			/** Ejecutamos el query */
			return await this._queryBuilder.execute();
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Execute", err);
			throw new DatabaseQueryBuildException(
				"Execute",
				"Execute",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Ejecuta la consulta y devuelve el primer registro */
	private async ExecuteAndTakeFirst(): Promise<any> {
		try {
			this._logger.Activity("ExecuteAndTakeFirst");
			
			/** Reseteamos las banderas */
			this.ResetFlags();

			/** Ejecutamos el query */
			return await this._queryBuilder.executeTakeFirstOrThrow();
		}
		catch (err: any) {
			this._logger.Error("FATAL", "ExecuteAndTakeFirst", err);
			throw new DatabaseQueryBuildException(
				"ExecuteAndTakeFirst",
				"ExecuteAndTakeFirst",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Setea la etapa inicial del builder */
	private SetInitialStage() : InitialStage<DB, TB, TResult>{
		this._logger.Activity("SetInitialStage");
		return {
			Select: this.Select,
			Where: this.Where,
			Include: this.Include,
			Insert: this.Insert,
			Update: this.Update,
			Delete: this.Delete
		} as InitialStage<DB, TB, TResult>;
	}
}

// import { InternalDatabase } from "../../../API/DataAccess/InternalDatabase";

// const builder = new PostgresQueryBuilder<InternalDatabase, "gj_proyects">({
// 	applicationContext: {} as ApplicationContext,
// 	options: {
// 		databaseType: "postgre_sql_database",
// 		primaryKey: "id",
// 		database: new Kysely({} as KyselyConfig),
// 		table: "gj_proyects"
// 	}
// });
  


