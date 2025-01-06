import { z, ZodSchema } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";



// Tipo base para los DTO
interface IDTO<T extends ZodSchema> {
  Schema: T;
  Validate(obj: z.infer<T>): boolean;
  GetError(obj: unknown): string | null;
}

// Función genérica para crear DTOs
export function createDTO<T extends ZodSchema>(schema: T): IDTO<T> {
  return {
    Schema: schema,

     /** Permite validar si un objeto cumple con el esquema */
    Validate(obj: z.infer<T>): boolean {
      const result = schema.safeParse(obj);
      return result.success;
    },

    /** Retorna el mensaje de error apropiado si lo hay */
    GetError(obj: unknown): string | null {
      const result = schema.safeParse(obj);
      return result.success ? null : result.error.message;
    },
  };
}
