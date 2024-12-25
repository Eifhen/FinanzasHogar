import { Generated, Insertable, Selectable, Updateable } from "kysely";







/** Tabla que manea las categorias del sistema  */
export interface CategoriasTable {

  /** Id secuencial  */
  id_categoria: Generated<number>;

  /** Nombre de la categoria */
  nombre: string;

  /** Descripción de la categoría */
  descripcion: string;

  /** Tipo de categoría Ingreso/Gasto */
  tipo: string;

  /** Clave foranea con la tabla de hogar */
  id_hogar: number;
}


/** Tipo para consultas de selección */
export type SelectCategorias = Selectable<CategoriasTable>;

/** Tipo para realizar consultas de inserción */
export type CreateCategorias = Insertable<CategoriasTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateCategorias = Updateable<CategoriasTable>;