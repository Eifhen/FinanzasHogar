import { z, ZodSchema } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";



// Tipo base para los DTO
interface IDTO<T extends ZodSchema> {

  /** Permite validar si un objeto cumple con el esquema
   * @returns - ValidatorResult */
  Validate(obj: z.infer<T>): ValidatorResult;
}

interface ValidatorResult {
  isValid: boolean;
  error: string ;
}

// Función genérica para crear DTOs
export function schemaValidator<T extends ZodSchema>(schema: T): IDTO<T> {
  return {
    /** Permite validar si un objeto cumple con el esquema */
    Validate(obj:z.infer<T>) : ValidatorResult {
      const validation = schema.safeParse(obj);
      return {
        isValid: validation.success,
        error: validation.success ? "": fromZodError(validation.error).toString()
      }
    }
  };
}
