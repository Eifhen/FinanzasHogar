import { Insertable, InsertResult, Selectable, SelectQueryBuilder, Transaction, Updateable } from "kysely";
import { IApplicationPromise } from "../../../../JFramework/Application/ApplicationPromise";
import IPaginationArgs from "../../../../JFramework/Application/types/IPaginationArgs";
import IPaginationResult from "../../../../JFramework/Application/types/IPaginationResult";
import { DataBase } from "../../../DataBase";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { DrainOuterGeneric } from "kysely/dist/cjs/util/type-utils";


export type QueryBuilderCallback<TableName extends keyof DataBase> = (
  qb: SelectQueryBuilder<
    DataBase,
    ExtractTableAlias<DataBase, TableName>,
    DrainOuterGeneric<Selectable<DataBase[TableName]>>
  >
) => SelectQueryBuilder<
  DataBase,
  ExtractTableAlias<DataBase, TableName>,
  DrainOuterGeneric<Selectable<DataBase[TableName]>>
>;

/** Representa un repositorio genérico para trabajar con tablas de la base de datos */
export default interface IMssSqlGenericRepository <
  TableName extends keyof DataBase, 
  PrimaryKey extends keyof DataBase[TableName]
> {
  /** Obtiene todos los registros de la tabla */
  GetAll(): IApplicationPromise<Selectable<DataBase[TableName]>[]>;

  /** Busca un registro por su clave primaria */
  FindById(id: DataBase[TableName][PrimaryKey]): IApplicationPromise<Selectable<DataBase[TableName]>>;

  /** Permite buscar un registro por un campo */
  Find(
    columnName: keyof DataBase[TableName],
    operator: string,
    value: any
  ) : IApplicationPromise<Selectable<DataBase[TableName]>>

  /** Permite buscar un registro por un campo */
  Where(expression: QueryBuilderCallback<TableName>) : IApplicationPromise<Selectable<DataBase[TableName]>>

  /** Inserta un nuevo registro en la tabla */
  Create(record: Insertable<DataBase[TableName]>): IApplicationPromise<InsertResult>;

  /** Actualiza un registro basado en la clave primaria */
  Update(id: DataBase[TableName][PrimaryKey], record: Updateable<DataBase[TableName]>): IApplicationPromise<number>;

  /** Elimina un registro basado en la clave primaria */
  Delete(id: DataBase[TableName][PrimaryKey]): IApplicationPromise<number>;

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  Paginate(params: IPaginationArgs,  filter?: Partial<Selectable<DataBase[TableName]>>) : 
    IApplicationPromise<IPaginationResult<Selectable<DataBase[TableName]>>>;

  /** Setea la transacción en el repositorio */
  SetTransaction(transaction:Transaction<DataBase>|null) : Promise<void>;
}
