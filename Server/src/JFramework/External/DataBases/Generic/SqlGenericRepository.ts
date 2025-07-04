/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return  */

/** Se deshabilitan estas reglas ya que esta 
 * clase es extremadamente abstracta */

import { Transaction, Selectable, ReferenceExpression, Insertable, Updateable, Kysely } from "kysely";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import { ApplicationPromise, IApplicationPromise } from "../../../Helpers/ApplicationPromise";
import IPaginationArgs from "../../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../Helpers/Interfaces/IPaginationResult";
import { ARRAY_INDEX_NEGATIVE, ARRAY_START_INDEX, DEFAULT_NUMBER } from "../../../Utils/const";
import ISqlGenericRepository from "../Interfaces/ISqlGenericRepository";
import { UnwrapGenerated } from "../Types/DatabaseType";
import ApplicationContext from "../../../Configurations/ApplicationContext";
import { QueryExpression } from "../Interfaces/IGenericRepository";



export default class SqlGenericRepository<
	DataBaseEntity extends object,
	TableName extends Extract<keyof DataBaseEntity, string>,
	PrimaryKey extends Extract<keyof DataBaseEntity[TableName], string>
> implements ISqlGenericRepository<
	DataBaseEntity,
	TableName,
	PrimaryKey
> {

	/** Nombre de la tabla a trabajar */
	public _tableName: TableName;

	/** Primary Key de la entidad que se está trabajando */
	public _primaryKey: PrimaryKey;

	// ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
	public _database: Kysely<DataBaseEntity>;

	/** Representa una transacción de la base de datos */
	private _transaction: Transaction<DataBaseEntity> | null = null;

	/** Contexto de aplicación */
	public readonly _applicationContext: ApplicationContext;

	/** Manejador de promesas */
	public readonly _applicationPromise: ApplicationPromise;


	constructor(
		database: Kysely<DataBaseEntity>,
		tableName: TableName,
		primaryKey: PrimaryKey,
		applicationContext: ApplicationContext
	) {
		this._tableName = tableName;
		this._database = database;
		this._primaryKey = primaryKey;
		this._applicationContext = applicationContext;
		this._applicationPromise = new ApplicationPromise(this._applicationContext)
	}

	/** Permite procesar los filtros de busqueda */
	private ProcessConditions (query:any, expressions: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>) {
	// Aseguramos que 'expressions' sea siempre un array
		const expressionsArray: QueryExpression<DataBaseEntity, TableName>[] =
			Array.isArray(expressions[ARRAY_START_INDEX]) ?
					(expressions as QueryExpression<DataBaseEntity, TableName>[]) :
					[expressions as QueryExpression<DataBaseEntity, TableName>];

		return query.where((eb:any) => {
			let conditionBuilder = null;
			let i = 0;
			while (i < expressionsArray.length) {
				const current = expressionsArray[i];
				// Si el elemento es una cadena ("or" o "and"), se omite y se utiliza en la siguiente iteración
				if (typeof current === "string") {
					i++;
					continue;
				}
				// current es una condición: [columnName, operator, value]
				const [columnName, operator, value] = current;
				if (conditionBuilder === null) {
					// Primera condición: se establece con where(...)
					conditionBuilder = eb(columnName as string, operator, value);
				} else {
					// Miramos el operador lógico que precede a esta condición (si existe)
					const prevOp = expressionsArray[i - ARRAY_INDEX_NEGATIVE];
					if (prevOp === "or") {
						// Se encadena usando OR
						conditionBuilder = conditionBuilder.or((qb:any) => qb(columnName as string, operator, value));
					} else {
						// Por defecto o si es "and", se encadena con AND
						conditionBuilder = conditionBuilder.and((qb:any) => qb(columnName as string, operator, value));
					}
				}
				i++;
			}
			return conditionBuilder;
		});
	} 

	/** Permite obtener todos los registros de una tabla */
	public async GetAll(): IApplicationPromise<Selectable<DataBaseEntity[TableName]>[]> {

		const query = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll().execute() :
			this._database.selectFrom(this._tableName).selectAll().execute();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<Selectable<DataBaseEntity[TableName]>[]>,
			"GetAll"
		);
	};

	/** Permite buscar un registro en base a un id */
	public FindById = async (id: UnwrapGenerated<DataBaseEntity[TableName][PrimaryKey]>): IApplicationPromise<Selectable<DataBaseEntity[TableName]> | null> => {
		const query = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll()
			.where(
				this._primaryKey as ReferenceExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>,
				'=',
				id
			).executeTakeFirst()
			:
			this._database.selectFrom(this._tableName).selectAll()
			.where(
				this._primaryKey as ReferenceExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>,
				'=',
				id
			).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as Promise<Selectable<DataBaseEntity[TableName]> | null>,
			"FindById"
		);
	};

	/** Permite buscar un registro en base a un predicado */
	public Find = async (expressions: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>): IApplicationPromise<Selectable<DataBaseEntity[TableName]> | null> => {
		let query: any = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll()
			:
			this._database.selectFrom(this._tableName).selectAll()

		query = this.ProcessConditions(query, expressions);
	
		const result = query.executeTakeFirst();

		return this._applicationPromise.TryQuery(
			result as Promise<Selectable<DataBaseEntity[TableName]> | null>,
			"Find"
		);
	};

	/** Permite buscar un registro según las condiciones ingresadas */
	public Where = async (expressions: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>): IApplicationPromise<Selectable<DataBaseEntity[TableName]>[]> => {
		let query: any = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll()
			:
			this._database.selectFrom(this._tableName).selectAll()

		query = this.ProcessConditions(query, expressions);

		const result = query.execute();

		return this._applicationPromise.TryQuery(
			result as Promise<Selectable<DataBaseEntity[TableName]>[]>,
			"Find"
		);
	};

	/**  Permite agregar un nuevo elemento a la tabla  */
	public async Create(record: Insertable<DataBaseEntity[TableName]>): IApplicationPromise<Selectable<DataBaseEntity[TableName]>> {
		const query = this._transaction ?
			this._transaction.insertInto(this._tableName).values(record).returningAll().executeTakeFirst() :
			this._database.insertInto(this._tableName).values(record).returningAll().executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<Selectable<DataBaseEntity[TableName]>>,
			"Create"
		);
	}

	/** Permite actualizar un elemento  */
	public async Update(
		id: UnwrapGenerated<DataBaseEntity[TableName][PrimaryKey]>,
		record: Updateable<DataBaseEntity[TableName]>
	): IApplicationPromise<number> {

		const query = this._transaction ?
			this._transaction.updateTable(this._tableName)
			.set(record as UpdateObjectExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>)
			.where(
				this._primaryKey as ReferenceExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>,
				'=',
				id
			)
			.executeTakeFirst()
			:
			this._database.updateTable(this._tableName)
			.set(record as UpdateObjectExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>)
			.where(
				this._primaryKey as ReferenceExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>,
				'=',
				id
			).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<number>,
			"Update"
		);
	}

	/** Permite actualizar un registro segun una condicion */
	public async UpdateBy(
		expressions: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>,
		record: Updateable<DataBaseEntity[TableName]>
	): IApplicationPromise<Selectable<DataBaseEntity[TableName]>> {

		let query = this._transaction
			? this._transaction.updateTable(this._tableName)
			.set(record as UpdateObjectExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>)
			: this._database.updateTable(this._tableName)
			.set(record as UpdateObjectExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>)

		query = this.ProcessConditions(query, expressions);

		const result = query.returningAll().executeTakeFirst();

		return this._applicationPromise.TryQuery(
			result as unknown as Promise<Selectable<DataBaseEntity[TableName]>>,
			"Update"
		);
	}

	/** Permite eliminar un elemento */
	public async Delete(id: UnwrapGenerated<DataBaseEntity[TableName][PrimaryKey]>): IApplicationPromise<number> {
		const query = this._transaction ?
			this._transaction.deleteFrom(this._tableName)
			.where(
				this._primaryKey as ReferenceExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>,
				'=',
				id
			).executeTakeFirst()
			:
			this._database.deleteFrom(this._tableName)
			.where(
				this._primaryKey as ReferenceExpression<DataBaseEntity, ExtractTableAlias<DataBaseEntity, TableName>>,
				'=',
				id
			).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<number>,
			"Delete"
		);
	}

	/** Permite agregar un filtro antes de eliminar */
	public async DeleteBy(expressions: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>){
		let query = this._transaction ?
			this._transaction.deleteFrom(this._tableName) :
			this._database.deleteFrom(this._tableName) ;

		query = this.ProcessConditions(query, expressions);

		const result = query.execute();

		return this._applicationPromise.TryQuery(
			result as unknown as Promise<number>,
			"DeleteBy"
		);
	}

	/** Permite paginar la data buscada en base a los argumentos de paginación */
	public async Paginate(
		params: IPaginationArgs,
		filter?: Partial<Selectable<DataBaseEntity[TableName]>>
	): IApplicationPromise<IPaginationResult<Selectable<DataBaseEntity[TableName]>>> {

		const getPaginatedResults = async () => {
			const { pageSize, currentPage } = params;
			const offsetIndex = 1;
			const offset = (currentPage - offsetIndex) * pageSize;

			// Construir la consulta base
			let baseQuery = this._transaction
				? this._transaction.selectFrom(this._tableName)
				: this._database.selectFrom(this._tableName);

			// Aplicar filtros dinámicos forzando el tipado con 'any'
			if (filter) {
				Object.entries(filter).forEach(([key, value]) => {
					// Forzar que key se use directamente en la llamada where
					baseQuery = (baseQuery as any).where(key, '=', value);
				});
			}

			// Contar el total de registros antes de la paginación
			const countQuery = (baseQuery as any).select((qb: any) => qb.fn.countAll().as('total'));
			const totalItemsResult = await countQuery.executeTakeFirst();
			const totalItems = Number(totalItemsResult?.total || DEFAULT_NUMBER);
			const totalPages = Math.ceil(totalItems / pageSize);

			// Construir la consulta paginada
			const paginatedQuery = (baseQuery as any)
			.selectAll()
			.orderBy(this._primaryKey, 'asc')
			.offset(offset)
			.fetch(pageSize);

			const items = (await paginatedQuery.execute()) as Selectable<DataBaseEntity[TableName]>[];

			// Construir y retornar el resultado de paginación
			const paginationResult: IPaginationResult<Selectable<DataBaseEntity[TableName]>> = {
				result: items,
				options: {
					pageSize,
					currentPage,
					totalPages,
					totalItems,
				},
			};

			return paginationResult;
		};

		return this._applicationPromise.TryQuery(getPaginatedResults(), "Paginate");
	}

	/** Setea una nueva transacción */
	public async SetTransaction(transaction: Transaction<DataBaseEntity> | null) {
		this._transaction = transaction;
	}

}
