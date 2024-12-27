


/** Interfaz que modela los argumentos de paginación */
export default interface IPaginationArgs {
  //skip: number;

  /** Tamaño de las páginas */
  pageSize: number;

  /** la página actual me va a decir cuantas páginas tengo que hacer skip */
  currentPage: number;

  /** Número total de páginas es igual al total de registros / total de páginas  */
  totalPages?: number; 

  /** Sirve para saber el número total de elementos */
  totalItems?: number; 
}