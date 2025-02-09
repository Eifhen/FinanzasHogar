import { z } from "zod";
import { schemaValidator } from "../Utils/schemaValidator";



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

    /** Tamaño del archivo en bytes */
    size: z.number().refine(size => size <= 10 * 1024 * 1024, { // 10MB en bytes
      message: 'El tamaño de la imagen no puede ser mayor a 10MB'
    }),

    /** Fecha de carga del archivo */
    fecha: z.preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    }, z.date()),
  });

  /** Tipo ApplicationImage */
  export type Type = z.infer<typeof Schema>;

  /** Función que valida y obtiene los errores del DTO */
  export const { Validate } = schemaValidator(Schema);
}