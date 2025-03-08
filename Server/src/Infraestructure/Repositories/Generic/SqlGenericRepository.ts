/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Transaction, Selectable, ReferenceExpression, SelectQueryBuilder, Insertable, InsertResult, Updateable } from "kysely";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import { DrainOuterGeneric } from "kysely/dist/cjs/util/type-utils";
import ApplicationContext from "../../../JFramework/Context/ApplicationContext";
import { ApplicationPromise, IApplicationPromise } from "../../../JFramework/Helpers/ApplicationPromise";
import IPaginationArgs from "../../../JFramework/Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../JFramework/Helpers/Interfaces/IPaginationResult";
import { DEFAULT_NUMBER } from "../../../JFramework/Utils/const";
import { DataBase, ApplicationSQLDatabase } from "../../DataBase";
import ISqlGenericRepository, { QueryBuilderCallback } from "./ISqlGenericRepository";




export default class SqlGenericRepository<
	TableName extends keyof DataBase,
	PrimaryKey extends keyof DataBase[TableName]
> implements ISqlGenericRepository<TableName, PrimaryKey> {

	/** Nombre de la tabla a trabajar */
	public _tableName: TableName;

	/** Primary Key de la entidad que se está trabajando */
	public _primaryKey: PrimaryKey;

	// ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
	public _database: ApplicationSQLDatabase;

	/** Representa una transacción de la base de datos */
	private _transaction: Transaction<DataBase> | null = null;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Manejador de promesas */
	private readonly _applicationPromise: ApplicationPromise;


	constructor(
		database: ApplicationSQLDatabase,
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

	/** Permite obtener todos los registros de una tabla */
	public GetAll = async (): IApplicationPromise<Selectable<DataBase[TableName]>[]> => {

		const query = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll().execute() :
			this._database.selectFrom(this._tableName).selectAll().execute();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<Selectable<DataBase[TableName]>[]>,
			"GetAll"
		);
	};

	/** Permite buscar un registro en base a un id */
	public FindById = async (id: DataBase[TableName][PrimaryKey]): IApplicationPromise<Selectable<DataBase[TableName]> | null> => {
		const query = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll()
			.where(
				this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
				'=',
				id
			).executeTakeFirst()
			:
			this._database.selectFrom(this._tableName).selectAll()
			.where(
				this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
				'=',
				id
			).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as Promise<Selectable<DataBase[TableName]> | null>,
			"FindById"
		);
	};

	/** Permite buscar un registro en base a un predicado */
	public Find = async (
		columnName: keyof DataBase[TableName],
		operator: string,
		value: any
	): IApplicationPromise<Selectable<DataBase[TableName]> | null> => {
		const query: any = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll()
			:
			this._database.selectFrom(this._tableName).selectAll()

		const result = query.where(columnName, operator, value).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			result as Promise<Selectable<DataBase[TableName]> | null>,
			"Find"
		);
	};

	/** Permite buscar un registro en base a un predicado */
	public Where = async (expression: QueryBuilderCallback<TableName>): IApplicationPromise<Selectable<DataBase[TableName]> | null> => {
		let query: any = this._transaction ?
			this._transaction.selectFrom(this._tableName).selectAll()
			:
			this._database.selectFrom(this._tableName).selectAll()

		query = expression(query as SelectQueryBuilder<
			DataBase,
			ExtractTableAlias<DataBase, TableName>,
			DrainOuterGeneric<Selectable<DataBase[TableName]>>
		>);

		const result = query.execute();

		return this._applicationPromise.TryQuery(
			result as Promise<Selectable<DataBase[TableName]> | null>,
			"Where"
		);
	};

	/**  Permite agregar un nuevo elemento a la tabla  */
	public Create = async (record: Insertable<DataBase[TableName]>): IApplicationPromise<InsertResult> => {
		const query = this._transaction ?
			this._transaction.insertInto(this._tableName).values(record).executeTakeFirst() :
			this._database.insertInto(this._tableName).values(record).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<InsertResult>,
			"Create"
		);
	}

	/** Permite actualizar un elemento  */
	public Update = async (id: DataBase[TableName][PrimaryKey], record: Updateable<DataBase[TableName]>): IApplicationPromise<number> => {
		const query = this._transaction ?
			this._transaction.updateTable(this._tableName)
			.set(record as UpdateObjectExpression<DataBase, ExtractTableAlias<DataBase, TableName>>)
			.where(
				this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
				'=',
				id
			).executeTakeFirst()
			:
			this._database.updateTable(this._tableName)
			.set(record as UpdateObjectExpression<DataBase, ExtractTableAlias<DataBase, TableName>>)
			.where(
				this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
				'=',
				id
			).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<number>,
			"Update"
		);
	}

	/** Permite eliminar un elemento */
	public Delete = async (id: DataBase[TableName][PrimaryKey]): IApplicationPromise<number> => {
		const query = this._transaction ?
			this._transaction.deleteFrom(this._tableName)
			.where(
				this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
				'=',
				id
			).executeTakeFirst()
			:
			this._database.deleteFrom(this._tableName)
			.where(
				this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
				'=',
				id
			).executeTakeFirst();

		return this._applicationPromise.TryQuery(
			query as unknown as Promise<number>,
			"Delete"
		);
	}

	/** Permite paginar la data buscada en base a los argumentos de paginación */
	public Paginate = async (
		params: IPaginationArgs,
		filter?: Partial<Selectable<DataBase[TableName]>>
	): IApplicationPromise<IPaginationResult<Selectable<DataBase[TableName]>>> => {

		const getPaginatedResults = async () => {
			const { pageSize, currentPage } = params;

			// Construir la consulta base
			let baseQuery = this._transaction
				? this._transaction.selectFrom(this._tableName)
				: this._database.selectFrom(this._tableName);


			// Aplicar filtros dinámicamente
			if (filter) {
				Object.entries(filter).forEach(([key, value]) => {
					baseQuery = baseQuery.where(
						key as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
						'=',
						value
					);
				});
			}

			// Contar el total de registros antes de la paginación
			const countQuery = baseQuery.select((qb) => qb.fn.countAll().as('total'));
			const totalItemsResult = await countQuery.executeTakeFirst();
			const totalItems = Number(totalItemsResult?.total || DEFAULT_NUMBER);
			const totalPages = Math.ceil(totalItems / pageSize);

			/** El currentPage debe restarse en uno */
			const offsetIndex = 1;

			// Calcular el offset y limitar los resultados
			const offset = (currentPage - offsetIndex) * pageSize;

			const paginatedQuery = baseQuery.selectAll()
			.orderBy(this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>)
			.offset(offset)
			.fetch(pageSize);

			const items = await paginatedQuery.execute() as unknown as Selectable<DataBase[TableName]>[];

			// Construir el resultado de paginación
			const paginationResult: IPaginationResult<Selectable<DataBase[TableName]>> = {
				result: items,
				options: {
					pageSize: params.pageSize,
					currentPage: params.currentPage,
					totalPages,
					totalItems,
				},
			};

			return paginationResult;
		}

		return this._applicationPromise.TryQuery(getPaginatedResults(), "Paginate");
	}

	/** Setea una nueva transacción */
	public SetTransaction = async (transaction: Transaction<DataBase> | null) => {
		this._transaction = transaction;
	}

}
