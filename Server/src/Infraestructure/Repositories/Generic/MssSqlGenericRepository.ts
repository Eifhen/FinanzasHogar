import { Insertable, InsertResult, ReferenceExpression, Selectable, SelectQueryBuilder, Transaction, Updateable } from "kysely";
import { ApplicationSQLDatabase, DataBase } from "../../DataBase";
import { ApplicationPromise, IApplicationPromise } from "../../../JFramework/Application/ApplicationPromise";
import IPaginationArgs from "../../../JFramework/Application/types/IPaginationArgs";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import IPaginationResult from "../../../JFramework/Application/types/IPaginationResult";
import IMssSqlGenericRepository, { QueryBuilderCallback } from "./Interfaces/IMssSqlGenericRepository";
import { DrainOuterGeneric } from "kysely/dist/cjs/util/type-utils";


export default class MssSqlGenericRepository<
  TableName extends keyof DataBase,
  PrimaryKey extends keyof DataBase[TableName]
> implements IMssSqlGenericRepository<TableName, PrimaryKey> {

  /** Nombre de la tabla a trabajar */
  public _tableName: TableName;

  /** Primary Key de la entidad que se está trabajando */
  public _primaryKey: PrimaryKey;

  // ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
  public _database: ApplicationSQLDatabase;

  /** Representa una transacción de la base de datos */
  public _transaction: Transaction<DataBase> | null = null;


  constructor(database: ApplicationSQLDatabase, tableName: TableName, primaryKey: PrimaryKey) {
    this._tableName = tableName;
    this._database = database;
    this._primaryKey = primaryKey;

  }

  /** Permite obtener todos los registros de una tabla */
  public getAll = async (): IApplicationPromise<Selectable<DataBase[TableName]>[]> => {

    const query = this._transaction ?
      this._transaction.selectFrom(this._tableName).selectAll().execute() :
      this._database.selectFrom(this._tableName).selectAll().execute();

    return ApplicationPromise.Try(query as unknown as Promise<Selectable<DataBase[TableName]>[]>);
  };

  /** Permite buscar un registro en base a un id */
  public findById = async (id: DataBase[TableName][PrimaryKey]): IApplicationPromise<Selectable<DataBase[TableName]> | null> => {
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

    return ApplicationPromise.Try(query as Promise<Selectable<DataBase[TableName]> | null>);
  };

  /** Permite buscar un registro en base a un predicado */
  public find = async (
    columnName: keyof DataBase[TableName],
    operator: string,
    value: any
  ): IApplicationPromise<Selectable<DataBase[TableName]> | null> => {
    let query:any = this._transaction ?
      this._transaction.selectFrom(this._tableName).selectAll()
      :
      this._database.selectFrom(this._tableName).selectAll()

    const result = query.where(columnName, operator, value).executeTakeFirst();

    return ApplicationPromise.Try(result as Promise<Selectable<DataBase[TableName]> | null>);
  };

  /** Permite buscar un registro en base a un predicado */
  public where = async (expression: QueryBuilderCallback<TableName>): IApplicationPromise<Selectable<DataBase[TableName]> | null> => {
    let query:any = this._transaction ?
      this._transaction.selectFrom(this._tableName).selectAll()
      :
      this._database.selectFrom(this._tableName).selectAll()

      query = expression(query as SelectQueryBuilder<
        DataBase,
        ExtractTableAlias<DataBase, TableName>,
        DrainOuterGeneric<Selectable<DataBase[TableName]>>
      >);

    const result = query.execute();

    return ApplicationPromise.Try(result as Promise<Selectable<DataBase[TableName]> | null>);
  };

  /**  Permite agregar un nuevo elemento a la tabla  */
  public create = async (record: Insertable<DataBase[TableName]>): IApplicationPromise<InsertResult> => {
    const query = this._transaction ?
      this._transaction.insertInto(this._tableName).values(record).executeTakeFirst() :
      this._database.insertInto(this._tableName).values(record).executeTakeFirst();

    return ApplicationPromise.Try(query as unknown as Promise<InsertResult>);
  }

  /** Permite actualizar un elemento  */
  public update = async (id: DataBase[TableName][PrimaryKey], record: Updateable<DataBase[TableName]>): IApplicationPromise<number> => {
    const query = this._transaction ?
      this._transaction.updateTable(this._tableName)
        .set(record as UpdateObjectExpression<DataBase, ExtractTableAlias<DataBase, TableName>>)
        .where(
          this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
          '=',
          id
        )
        .executeTakeFirst()
      :
      this._database.updateTable(this._tableName)
        .set(record as UpdateObjectExpression<DataBase, ExtractTableAlias<DataBase, TableName>>)
        .where(
          this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
          '=',
          id
        )
        .executeTakeFirst();
    return ApplicationPromise.Try(query as unknown as Promise<number>);
  }

  /** Permite eliminar un elemento */
  public delete = async (id: DataBase[TableName][PrimaryKey]): IApplicationPromise<number> => {
    const query = this._transaction ?
      this._transaction.deleteFrom(this._tableName)
        .where(
          this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
          '=',
          id
        )
        .executeTakeFirst()
      :
      this._database.deleteFrom(this._tableName)
        .where(
          this._primaryKey as ReferenceExpression<DataBase, ExtractTableAlias<DataBase, TableName>>,
          '=',
          id
        )
        .executeTakeFirst();
    return ApplicationPromise.Try(query as unknown as Promise<number>);
  }

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  public paginate = async (
    params: IPaginationArgs,
    filter?: Partial<Selectable<DataBase[TableName]>>
  ): IApplicationPromise<IPaginationResult<Selectable<DataBase[TableName]>>> => {

    return ApplicationPromise.Try(
      (async () => {
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
        const totalItems = Number(totalItemsResult?.total || 0);
        const totalPages = Math.ceil(totalItems / pageSize);


        // Calcular el offset y limitar los resultados
        const offset = (currentPage - 1) * pageSize;

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
            totalPages: totalPages,
            totalItems: totalItems,
          },
        };

        return paginationResult;
      })()
    );
  }

  /** Setea una nueva transacción */
  public setTransaction = async (transaction: Transaction<DataBase> | null) => {
    this._transaction = transaction;
  }

}
