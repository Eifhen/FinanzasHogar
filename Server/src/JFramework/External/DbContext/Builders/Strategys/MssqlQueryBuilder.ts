import { SelectQueryBuilder, ReferenceExpression, Insertable, Updateable, Kysely } from "kysely";
import { OrderByDirection } from "kysely/dist/cjs/parser/order-by-parser";
import ApplicationContext from "../../../../Configurations/ApplicationContext";
import { DatabaseOperationException, DatabaseQueryBuildException, NullParameterException } from "../../../../ErrorHandling/Exceptions";
import ILoggerManager from "../../../../Managers/Interfaces/ILoggerManager";
import { IQueryCompiler } from "../../Compilers/Interfaces/IQueryCompiler";
import { AstParser } from "../../Compilers/Parser/AstParser";
import { AstExpression } from "../../Compilers/Types/AstExpression";
import { QueryExpression } from "../../Compilers/Types/QueryExpression";
import { IDataQueryBuilder } from "../Interfaces/IDataQueryBuilder";
import { DEFAULT_NUMBER } from "../../../../Utils/const";
import IPaginationArgs from "../../../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../../Helpers/Interfaces/IPaginationResult";
import { QueryBuilderConfigurationOptions, QueryBuilderFlags, SelectionFields, IncludeParams, QueryBuilderDependencies } from "../Types/Types";
import { ColumnFields } from "../../Compilers/Types/Types";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import { IncludeStage, WhereStageQuery, ExecutionStage, WhereStage } from "../Interfaces/IDataQueryBuilderStages";


/** Query Builder para Microsoft SQL Server
 * 
 * @example
 * ```ts 
 * const builder = new MssqlQueryBuilder<InternalDatabase, "gj_proyects">({
 *   database: new Kysely({} as KyselyConfig),
 *	 table: "gj_proyects"
 * });
 * 
 * const result = await builder.Where(["name", "=", "Gabo"])
 * .SelectFields(["description", "name"])
 * .Skip(10)
 * .Take(10)
 * .SortBy("name", "desc")
 * .Include(
 *   "gj_tenant_connection_view", 
 *	 ["name", "=", "connection"], 
 *	 ["status", "<", "hola"]
 * )
 * .Execute();
 * ```
 */
export class MssqlQueryBuilder<
	DB, 
	TB extends Extract<keyof DB, string>,
	TResult extends object = any
> implements IDataQueryBuilder<DB, TB, TResult> 
{

	/** Opciones de configuración del queryBuilder */
	private readonly _options: QueryBuilderConfigurationOptions<DB>;

	/** Objeto querybuilder de kysely */
	private _queryBuilder = {} as SelectQueryBuilder<DB, any, {}>;

	/** Tabla en cuestión */
	private _table = "" as TB;

	/** Compilador */
	private readonly _compiler: IQueryCompiler<DB, TB, any>;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** AstParser */
	private readonly _parser: AstParser;

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

	constructor(deps: QueryBuilderDependencies) {
		this._logger = deps.logger;
		this._applicationContext = deps.applicationContext;
		this._parser = deps.parser;
		this._options = deps.options;
		this._compiler = deps.compiler;
	}

	/** Resetea todas las banderas */
	public ClearQuery(): void {
		this._logger.Activity("ClearQuery");
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

		this._table = "" as TB;
	}

	/** Setea la tabla que se va a consultar */
	public SetTable(table: TB) : void {
		this._logger.Activity("SetTable");
		this._table = table;
		this._queryBuilder = this._options.database.selectFrom(table);
	}

	/** Procesa la expresión y construye el AST */
	public Where(expr: QueryExpression<ColumnFields<DB, TB>>): any {
		try {
			this._logger.Activity("Where");
			this.builderFlags.hasWhere = true;

			const ast: AstExpression = this._parser.parse(expr);
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
	public Include<OTB extends Extract<keyof DB, string>>(otherTable: OTB, args: IncludeParams<DB, TB, OTB>): IncludeStage<DB, TB, any> {
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
						`${this._table}.${args.unionCondition![leftFieldIndex]}` as any,
						`${args.unionCondition![operatorIndex]}`,
						`${otherTable}.${args.unionCondition![rightFieldIndex]}` as any
					)
				) as any;
			}

			if (args.unionType === "left") {
				this._queryBuilder = this._queryBuilder.leftJoin(
					otherTable,
					(join) => join.on(
						`${this._table}.${args.unionCondition![leftFieldIndex]}` as any,
						`${args.unionCondition![operatorIndex]}`,
						`${otherTable}.${args.unionCondition![rightFieldIndex]}` as any
					)
				) as any;
			}

			if (args.unionType === "right") {
				this._queryBuilder = this._queryBuilder.rightJoin(
					otherTable,
					(join) => join.on(
						`${this._table}.${args.unionCondition![leftFieldIndex]}` as any,
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
	public Select(data: SelectionFields<DB, TB>): WhereStageQuery<DB, TB, TResult> {
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
				fields.map(field => `${this._table}.${field}`) as any
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
	public SortBy(field: ColumnFields<DB, TB>, dir?: OrderByDirection): WhereStageQuery<DB, TB, TResult> {
		try {
			this._logger.Activity("SortBy");
			this.builderFlags.hasSort = true;

			const fieldSort: ReferenceExpression<DB, TB> = `${this._table}.${field}`;

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
	public Take(count: number): WhereStageQuery<DB, TB, TResult> {
		try {
			this._logger.Activity("Take");
			this.builderFlags.hasTake = true;

			this._queryBuilder = this._queryBuilder.top(count);
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
	public Skip(offset: number): WhereStageQuery<DB, TB, TResult> {
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
	public async Count(): Promise<number> {
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
	public async Paginate(sortField: ColumnFields<DB, TB>, args: IPaginationArgs): Promise<IPaginationResult<any>> {
		try {
			this._logger.Activity("Paginate");
			this.builderFlags.hasPagination = true;

			const offsetIndex = 1;

			/** Representa el registro apartir del cual se comienza a contar */
			const offset = (args.currentPage - offsetIndex) * args.pageSize;

			const totalItems = await this.Count();
			const totalPages = Math.ceil(totalItems / args.pageSize);

			const sortBy = `${this._table}.${sortField}`;

			/** Si no se ha hecho selección seleccionamos todos los registros */
			if (!this.builderFlags.hasSelect) {
				this._queryBuilder.selectAll();
			}

			/** Aplicamos la paginación */
			this._queryBuilder
			.orderBy(sortBy as any)
			.offset(offset)
			.fetch(args.pageSize);

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
	public Insert(record: Insertable<DB[TB]>): ExecutionStage<TResult> {
		try {
			this._logger.Activity("Insert");

			this._options.database
			.insertInto(this._table)
			.values(record)
			.outputAll("inserted");

			return this as unknown as ExecutionStage<TResult>;
		}
		catch (err: any) {
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
	public Update(changes: Updateable<DB[TB]>): WhereStage<DB, TB, TResult, 'operation'> {
		try {
			this._logger.Activity("Update");

			this._queryBuilder = (this._queryBuilder as any as Kysely<DB>)
			.updateTable(this._table)
			.set(changes as UpdateObjectExpression<DB, ExtractTableAlias<DB, TB>>)
			.outputAll("inserted") as any;

			return this as unknown as WhereStage<DB, TB, TResult, 'operation'>;
		}
		catch (err: any) {
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
	public Delete(): WhereStage<DB, TB, TResult, 'operation'> {
		try {
			this._logger.Activity("Delete");

			this._queryBuilder = (this._queryBuilder as any as Kysely<DB>)
			.deleteFrom(this._table)
			.outputAll("deleted") as any;

			return this as unknown as WhereStage<DB, TB, TResult, 'operation'>;
		}
		catch (err: any) {
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
	public async Execute(): Promise<any> {
		try {
			this._logger.Activity("Execute");

			/** Reseteamos las banderas */
			this.ClearQuery();

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
	public async ExecuteAndTakeFirst(): Promise<any> {
		try {
			this._logger.Activity("ExecuteAndTakeFirst");

			/** Reseteamos las banderas */
			this.ClearQuery();

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
}