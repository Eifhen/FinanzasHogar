import { Insertable, InsertResult, Selectable, Transaction, Updateable, UpdateType } from "kysely";
import IGenericRepository from "./IGenericRepository";
import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import { UnwrapGenerated } from "../Types/DatabaseType";



/** Repositorio generico para SQL Server */
export default interface ISqlGenericRepository<
  DataBaseEntity extends object,
  TableName extends Extract<keyof DataBaseEntity, string>,
  PrimaryKey extends Extract<keyof DataBaseEntity[TableName], string>
> extends IGenericRepository<
  DataBaseEntity,
  TableName,
  PrimaryKey,
  Insertable<DataBaseEntity[TableName]>, // InsertType
  InsertResult, // InsertOutput
  Updateable<DataBaseEntity[TableName]>, // UpdateType
  number, // UpdateOutput
  number, // DeleteOutput
  Selectable<DataBaseEntity[TableName]>, // GeneralOutput
  Transaction<DataBaseEntity> // TransactionType
> {
    
}