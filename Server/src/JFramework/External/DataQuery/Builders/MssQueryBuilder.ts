import { Kysely, SelectQueryBuilder, ReferenceExpression, Selectable } from "kysely";
import { OrderByDirection } from "kysely/dist/cjs/parser/order-by-parser";
import ApplicationContext from "../../../Configurations/ApplicationContext";
import { DatabaseQueryBuildException, NullParameterException } from "../../../ErrorHandling/Exceptions";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { IQueryCompiler } from "../Compilers/Interfaces/IQueryCompiler";
import { AstParser } from "../Compilers/Parser/AstParser";
import { SqlQueryCompiler } from "../Compilers/SqlQueryCompiler";
import { AstExpression } from "../Types/AstExpression";
import { ColumnFields, SelectionFields, UnionParams } from "../Types/CompilerTypes";
import { QueryExpression } from "../Types/QueryExpression";
import { IDataQueryBuilder, IQueryBuilderDependencies } from "./Interfaces/IDataQueryBuilder";
import { DEFAULT_NUMBER } from "../../../Utils/const";
import IPaginationArgs from "../../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../Helpers/Interfaces/IPaginationResult";






export class MssqlQueryBuilder<
	DatabaseEntity,
	Table extends Extract<keyof DatabaseEntity, string>
> implements IDataQueryBuilder<DatabaseEntity, Table> {

	/** Instancia de la base de datos kysely */
	private readonly _db: Kysely<DatabaseEntity>;

	/** Nombre de la tabla que se está trabajando */
	private readonly _table: Table;

	/** Representa la llave primaria o campo indentificador de la tabla */
	private readonly _primaryKey: ColumnFields<DatabaseEntity, Table>;

	/** Objeto querybuilder de kysely */
	private _queryBuilder: SelectQueryBuilder<DatabaseEntity, any, {}>;

	/** Compilador */
	private readonly _compiler: IQueryCompiler<DatabaseEntity, Table, any>;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Indica si el metodo sort ha sido llamado */
	private _hasSort: boolean = false;

	constructor(deps: IQueryBuilderDependencies<DatabaseEntity, Table>) {
		this._db = deps.database;
		this._table = deps.table;
		this._primaryKey = deps.primaryKey;
		this._queryBuilder = this._db.selectFrom(deps.table);
		this._compiler = new SqlQueryCompiler();
		this._applicationContext = deps.applicationContext;

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "BUILDER",
			entityName: "MssqlQueryBuilder",
			applicationContext: deps.applicationContext
		});
	}

	/** Procesa la expresión y construye el AST */
	Where(expr: QueryExpression<ColumnFields<DatabaseEntity, Table>>): IDataQueryBuilder<DatabaseEntity, Table> {
		try {
			this._logger.Activity("Where");

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
	Include<OtherTable extends Extract<keyof DatabaseEntity, string>,>(otherTable: OtherTable, args: UnionParams<DatabaseEntity, Table, OtherTable>): IDataQueryBuilder<DatabaseEntity, Table> {
		try {
			this._logger.Activity("Include");

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
				return this.Where(args.filterCondition);
			}

			return this;
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
	Fields(data: SelectionFields<DatabaseEntity, Table>): IDataQueryBuilder<DatabaseEntity, Table> {
		try {
			this._logger.Activity("SelectFields");

			/** Seleccionamos todos los registros */
			if (data === "all") {
				this._queryBuilder = this._queryBuilder.selectAll();
				return this;
			}

			const fields = Array.isArray(data) ? data : [data];

			this._queryBuilder = this._queryBuilder.select(
				fields.map(field => `${this._table}.${field}`) as any
			);

			return this;
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
	SortBy(field: ColumnFields<DatabaseEntity, Table>, direction?: OrderByDirection): IDataQueryBuilder<DatabaseEntity, Table> {
		try {
			this._logger.Activity("SortBy");

			const fieldSort: ReferenceExpression<DatabaseEntity, Table> = `${this._table}.${field}`;

			this._queryBuilder = this._queryBuilder.orderBy(
				fieldSort,
				direction
			);

			this._hasSort = true;

			return this;
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
	Take(count: number): IDataQueryBuilder<DatabaseEntity, Table> {
		try {
			this._logger.Activity("Take");

			/** Si no se ha realizado un ordenamiento con anterioridad, 
			 * ordenamos los registros por clave primaria*/
			if (!this._hasSort) {
				this.SortBy(this._primaryKey);
			}

			this._queryBuilder = this._queryBuilder.top(count);
			return this;
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
	Skip(offset: number): IDataQueryBuilder<DatabaseEntity, Table> {
		try {
			this._logger.Activity("Skip");
			this._queryBuilder = this._queryBuilder.offset(offset);
			return this;
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
	async Count(): Promise<number> {
		try {
			this._logger.Activity("Count");

			const result: any = this._db
			.selectFrom(this._table)
			.select((eb) => eb.fn.countAll().as('total'))
			.executeTakeFirst();

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
	async Paginate(args: IPaginationArgs): Promise<IPaginationResult<any>> {
		try {
			this._logger.Activity("Paginate");

			const offsetIndex = 1;
			const offset = (args.currentPage - offsetIndex) * args.pageSize;

			const totalItems = await this.Count();
			const totalPages = Math.ceil(totalItems/args.pageSize);

			const sortField = `${this._table}.${this._primaryKey}`;

			const paginatedQuery = this._db.selectFrom(this._table)
			.selectAll()
			.orderBy(sortField as any, 'asc')
			.offset(offset)
			.fetch(args.pageSize);

			const result = await paginatedQuery.execute();

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

	/** Ejecuta la consulta y devuelve los datos */
	async Execute(): Promise<any[]> {
		try {
			this._logger.Activity("Execute");
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
	async ExecuteAndTakeFirst(): Promise<any> {
		try {
			this._logger.Activity("ExecuteAndTakeFirst");
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