import { z } from "zod";
import { AppImage } from "../../JFramework/DTOs/AppImage";
import { fromZodError } from "zod-validation-error";
import { schemaValidator } from "../../JFramework/Utils/schemaValidator";



/** NameSpace para el DTO de registro */
export namespace SignUpDTO {

  /** Esquema del SignUpDTO */
  export const Schema = z.object({

    /** Nombre del usuario */
    nombre: z.string().min(4),

    /** Apellidos del usuario */
    apellidos: z.string().min(4),

    /** Fecha de nacimiento del usuario */
    fechaNacimiento: z.preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    }, z.date()),

    /** Pais del usuario */
    pais: z.string().min(4),

    /** Email del usuario */
    email: z.string().email(),

    /** Contraseña del usuario */
    password: z.string().max(12),

    /** sexo del usuario */
    sexo: z.boolean(),

    /** foto perfil*/
    foto: AppImage.Schema

  });

  /** Tipo SignUpDTO */
  export type Type = z.infer<typeof Schema>;

  /** Función que valida y obtiene los errores del DTO */
  export const { Validate } = schemaValidator(Schema);
}

