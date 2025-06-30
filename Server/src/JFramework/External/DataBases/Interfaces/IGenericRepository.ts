import { IApplicationPromise } from "../../../Helpers/ApplicationPromise";
import IPaginationArgs from "../../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../../Helpers/Interfaces/IPaginationResult";
import { UnwrapGenerated } from "../Types/DatabaseType";


export type QueryExpression<DataBaseEntity extends object, TableName extends Extract<keyof DataBaseEntity, string>> =
  | [keyof DataBaseEntity[TableName], string, any] // Condición normal
  | "or"
  | "and"; // Operadores lógicos

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
  FindById(id: UnwrapGenerated<DataBaseEntity[TableName][PrimaryKey]>): IApplicationPromise<OutputEntity>

  /** Permite buscar un registro en base a un predicado */
  Find (expresion: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>): IApplicationPromise<OutputEntity | null>

  /** Permite buscar un registro según las condiciones ingresadas */
  Where(expresion: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>) : IApplicationPromise<OutputEntity[] | null>;

  /** Permite crear un registro */
  Create(record: InsertType): IApplicationPromise<OutputEntity>;

  /** Permite actualizar un registro */
  Update(id: UnwrapGenerated<DataBaseEntity[TableName][PrimaryKey]>, record: UpdateType): IApplicationPromise<UpdateOutput>;

  /** Permite actualizar un registro segun una condicion */
  UpdateBy(
    expresion: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>, 
    record: UpdateType
  ): IApplicationPromise<OutputEntity>;

  /** Permite eliminar un registro */
  Delete(id: UnwrapGenerated<DataBaseEntity[TableName][PrimaryKey]>): IApplicationPromise<DeleteOutput>;

  /** Permite eliminar un registro por un campo */
  DeleteBy(expresion: QueryExpression<DataBaseEntity, TableName>[] | QueryExpression<DataBaseEntity, TableName>): IApplicationPromise<DeleteOutput>;

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  Paginate(params: IPaginationArgs, filter?: Partial<OutputEntity>): IApplicationPromise<IPaginationResult<OutputEntity>>;

  /** Setea la transacción en el repositorio */
  SetTransaction(transaction: TransactionType | null) : Promise<void>;
}