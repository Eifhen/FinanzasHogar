import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import IPaginationArgs from "../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../Helpers/Interfaces/IPaginationResult";
import { ClassInstance } from "../../Utils/Types/CommonTypes";






/** Definición interfaz para repositorio genérico */
export default interface IGenericRepository<
  DataBaseEntity extends object, // Esquema subyacente (p.ej. MyDbSchema)
  TableName extends Extract<keyof DataBaseEntity, string>,
  PrimaryKey extends Extract<keyof DataBaseEntity[TableName], string>,
  InsertType,
  InsertOutput,
  UpdateType,
  UpdateOutput,
  DeleteOutput,
  OutputEntity,
  TransactionType
> {

  /** Obtiene todos los elementos de una colección */
  GetAll(): IApplicationPromise<OutputEntity[]>;

  /** Permite buscar un elemento por su id */
  FindById(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<OutputEntity>

  /** Permite crear un registro */
  Create(record: InsertType): IApplicationPromise<InsertOutput>;

  /** Permite actualizar un registro */
  Update(id: DataBaseEntity[TableName][PrimaryKey], record: UpdateType): IApplicationPromise<UpdateOutput>;

  /** Permite eliminar un registro */
  Delete(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<DeleteOutput>;

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  Paginate(params: IPaginationArgs, filter?: Partial<OutputEntity>): IApplicationPromise<IPaginationResult<OutputEntity>>;

  /** Setea la transacción en el repositorio */
  SetTransaction(transaction: TransactionType | null) : Promise<void>;
}