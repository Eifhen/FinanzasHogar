import { IApplicationPromise } from "../../Application/ApplicationPromise";
import IPaginationArgs from "../../Application/types/IPaginationArgs";


/** Repositorio genérico */
export default interface IGenericRepository<T> {

  /** Permite obtener todos los registros de una tabla */
  getAll() : IApplicationPromise<T>;

  /** Permite buscar un registro en base a una condición */
  find(condition:object) : IApplicationPromise<T>;

  /** Permite buscar un registro en base a un id */
  findById(id: number) : IApplicationPromise<T>;

  /** Permite agregar un nuevo elemento a la tabla */
  create(data: T) : IApplicationPromise<T>;
  
  /** Permite actualizar un elemento */
  update(data: T) : IApplicationPromise<T>;

  /** Permite eliminar un elemento */
  delete(id: number) : IApplicationPromise<T>;

  /** Permite paginar la data buscada en base a los argumentos de paginación */
  paginate(params: IPaginationArgs, filter?: object) : IApplicationPromise<T>;

}