import { z } from "zod";
import { createDTO } from "../../JFramework/DTOs/BaseDTO";




/** NameSpace que contiene el esquema y el tipo LoginDTO */
export namespace SignInDTO {
  
  /** Schema para el LoginDTO */
  export const Schema = z.object({
    /** Hace referencia al email del usuario */
    email: z.string().email(),
  
    /** Hace referencia a la contraseña del usuario */
    password: z.string().min(10),
  })
  
  /** Tipo LoginDTO */
  export type Type = z.infer<typeof Schema>;

  /** Función que valida y obtiene los errores del DTO */
  export const { Validate, GetError } = createDTO(Schema);
}



