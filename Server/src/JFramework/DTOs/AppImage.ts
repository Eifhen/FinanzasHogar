import { z } from "zod";
import { createDTO } from "./BaseDTO";



/** Representa una imagen de la aplicación */
export namespace AppImage {

  /** Esquema del DTO AppImage */
  export const Schema = z.object({
    
    /** Id de la imagen */
    id: z.string().nullable(),

    /** Url de la imagen */
    url: z.string(),

    /** Nombre del archivo */
    nombre: z.string(),

    /** Nombre de la extensión del archivo */
    extension: z.string(),

    /** Archivo en base64 */
    base64: z.string(),

    /** Fecha de carga del archivo */
    fecha: z.date().default(new Date()),
  });

  /** Tipo ApplicationImage */
  export type Type = z.infer<typeof Schema>;

  /** Función que valida y obtiene los errores del DTO */
  export const { Validate, GetError } = createDTO(Schema);
}