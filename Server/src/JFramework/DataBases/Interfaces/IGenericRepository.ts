import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import IPaginationArgs from "../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../Helpers/Interfaces/IPaginationResult";
import { ClassInstance } from "../../Utils/Types/CommonTypes";




/** Definición para repositorio genérico */
export default interface IGenericRepository<
  DataBaseEntity,
  TableName extends keyof DataBaseEntity,
  PrimaryKey extends keyof DataBaseEntity[TableName]
> {

  /** Obtiene todos los elementos de una colección */
  GetAll(): IApplicationPromise<DataBaseEntity[TableName][]>;

  /** Permite buscar un elemento por su id */
  FindById(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<DataBaseEntity[TableName]>

  /** Permite crear un registro */
  Create(record: DataBaseEntity[TableName]): IApplicationPromise<DataBaseEntity[TableName]>;

  /** Permite actualizar un registro */
  Update(id: DataBaseEntity[TableName][PrimaryKey], record: DataBaseEntity[TableName]): IApplicationPromise<DataBaseEntity[TableName]>;

  /** Permite eliminar un registro */
  Delete(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<number>;

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  Paginate(params: IPaginationArgs, filter?: Partial<DataBaseEntity[TableName]>): IApplicationPromise<IPaginationResult<DataBaseEntity[TableName]>>;

  /** Setea la transacción en el repositorio */
  SetTransaction(transaction: ClassInstance<DataBaseEntity>) : Promise<void>;
}