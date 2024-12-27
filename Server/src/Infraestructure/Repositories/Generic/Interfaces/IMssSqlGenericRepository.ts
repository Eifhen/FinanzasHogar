import { Insertable, Selectable, Transaction, Updateable } from "kysely";
import { IApplicationPromise } from "../../../../JFramework/Application/ApplicationPromise";
import IPaginationArgs from "../../../../JFramework/Application/types/IPaginationArgs";
import IPaginationResult from "../../../../JFramework/Application/types/IPaginationResult";
import { DataBase } from "../../../DataBase";



/** Representa un repositorio genérico para trabajar con tablas de la base de datos */
export default interface IMssSqlGenericRepository <
  TableName extends keyof DataBase, 
  PrimaryKey extends keyof DataBase[TableName]
> {
  /** Obtiene todos los registros de la tabla */
  getAll(): IApplicationPromise<Selectable<DataBase[TableName]>[]>;

  /** Busca un registro por su clave primaria */
  findById(id: DataBase[TableName][PrimaryKey]): IApplicationPromise<Selectable<DataBase[TableName]>>;

  /** Inserta un nuevo registro en la tabla */
  create(record: Insertable<DataBase[TableName]>): IApplicationPromise<number>;

  /** Actualiza un registro basado en la clave primaria */
  update(id: DataBase[TableName][PrimaryKey], record: Updateable<DataBase[TableName]>): IApplicationPromise<number>;

  /** Elimina un registro basado en la clave primaria */
  delete(id: DataBase[TableName][PrimaryKey]): IApplicationPromise<number>;

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  paginate(params: IPaginationArgs,  filter?: Partial<Selectable<DataBase[TableName]>>) : 
    IApplicationPromise<IPaginationResult<Selectable<DataBase[TableName]>>>;

  /** Setea la transacción en el repositorio */
  setTransaction(transaction:Transaction<DataBase>|null) : Promise<void>;
}
