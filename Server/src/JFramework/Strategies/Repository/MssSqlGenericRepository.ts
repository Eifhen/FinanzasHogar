import { Selectable } from "kysely";
import { ApplicationSQLDatabase, DataBase } from "../../../Infraestructure/DataBase";
import { ApplicationPromise, IApplicationPromise } from "../../Application/ApplicationPromise";
import IPaginationArgs from "../../Application/types/IPaginationArgs";
import IGenericRepository from "./IGenericRepository";



// TableName extends keyof Tables,
//   T extends Tables[TableName]


export default class MssSqlGenericRepository<T extends keyof DataBase, key = Selectable<DataBase[T]>> {

  /** Nombre de la tabla a trabajar */
  private _tableName: T;

  // ApplicationSQLDatabase es de tipo ApplicationSQLDatabase = Kysely<DataBase>;
  private _database: ApplicationSQLDatabase;


  constructor(tableName: T, database: ApplicationSQLDatabase) {
    this._tableName = tableName;
    this._database = database;

  }

  /** Permite obtener todos los registros de una tabla */
  getAll = async (): IApplicationPromise<key[]> => {
    const query = this._database.selectFrom(this._tableName).selectAll();
    return ApplicationPromise.Try(query.execute() as Promise<key[]>);
  }

  /** Permite buscar un registro en base a una condición */
  find = async (condition: object): IApplicationPromise<T> => {
    throw new Error("Method not implemented.");
  }

  /** Permite buscar un registro en base a un id */
  findById = async (id: number): IApplicationPromise<T> => {
    throw new Error("Method not implemented.");
  }

  /** Permite agregar un nuevo elemento a la tabla */
  create = async (data: T): IApplicationPromise<T> => {
    throw new Error("Method not implemented.");
  }

  /** Permite actualizar un elemento */
  update = async (data: T): IApplicationPromise<T> => {
    throw new Error("Method not implemented.");
  }

  /** Permite eliminar un elemento */
  delete = async (id: number): IApplicationPromise<T> => {
    throw new Error("Method not implemented.");
  }

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  paginate = async (params: IPaginationArgs, filter?: object): IApplicationPromise<T> => {
    throw new Error("Method not implemented.");
  }
}