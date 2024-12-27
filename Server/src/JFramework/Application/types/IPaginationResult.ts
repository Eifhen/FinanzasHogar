import IPaginationArgs from "./IPaginationArgs";




/** Interfaz que modela un resultado paginado */
export default interface IPaginationResult<T> {
  
  /** Resultado paginado */
  result: T[];

  /** Opciones de paginación */
  options: IPaginationArgs;
}