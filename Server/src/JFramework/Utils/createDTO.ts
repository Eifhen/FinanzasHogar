import { z, ZodSchema } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";



// Tipo base para los DTO
interface IDTO<T extends ZodSchema> {

  /** Permite validar si un objeto cumple con el esquema
   * @returns - true si el objeto es valido
   */
  Validate(obj: z.infer<T>): boolean;

  /** Retorna el mensaje de error apropiado si lo hay */
  GetError(obj: z.infer<T>): ValidationError | null;
}

// Función genérica para crear DTOs
export function createDTO<T extends ZodSchema>(schema: T): IDTO<T> {
  return {

     /** Permite validar si un objeto cumple con el esquema */
    Validate(obj: z.infer<T>): boolean {
      const result = schema.safeParse(obj);
      return result.success;
    },

    /** Retorna el mensaje de error apropiado si lo hay */
    GetError(obj: z.infer<T>): ValidationError | null {
      const result = schema.safeParse(obj);
      return result.success ? null : fromZodError(result.error);
    },
  };
}
