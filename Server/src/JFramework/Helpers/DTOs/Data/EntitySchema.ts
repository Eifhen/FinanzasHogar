/* eslint-disable @typescript-eslint/no-this-alias */

import { z, ZodObject, ZodSchema } from "zod";
import { ErrorMessageData } from "../../../ErrorHandling/Exceptions";
import SchemaErrorAdapter from "../../../ErrorHandling/SchemaErrorAdapter";

interface ValidationResult {
	isValid: boolean;
	innerError?: Error;
	errorData: ErrorMessageData[];
}

/** Hemos convertido EntitySchema en una clase abstracta, ya que no será 
 instanciada directamente y está diseñada para ser heredada. */
export default abstract class EntitySchema {

	/** Esquema de zod interno, este esquema es construido mediante el
	 * decorador `SchemaProperty`, luego lo validamos 
	 * mediante el método Validate*/
	protected static schema: Record<string, ZodSchema>= {};

	/** Crea el esquema en base al esquema definido 
	 * en la clase hija (this.schema) recordando que cuando los metodos 
	 * no son de tipo arrow function el valor del this es igual a la 
	 * instancia del caller de la función.
	 * Este const schema = this.schema en realidad está apuntando al schema de la clase hija, 
	 * es decir al schema de la clase que implementa a EntitySchema */
	public static createSchema(): ZodObject<any> {
		const caller = this; // hace referencia al caller de esta función
		const schema = caller.schema;
		return z.object(schema).strict();
	}

	/** Valida la instancia de una clase como si fuera un schema de zod, 
	 * mediante la propiedad interna schema, la cual es creada mediante 
	 * el decorador `SchemaProperty` y obtenida mediante el método `createSchema` */
	public static Validate(instance: any): ValidationResult {
		const zodSchema = this.createSchema();
		const validation = zodSchema.safeParse(instance);

		if(validation.success){
			return {
				isValid: true,
				errorData: []
			}
		} else {
			return {
				isValid: false,
				innerError: validation.error,
				errorData: SchemaErrorAdapter.FormatValidationErrors(validation.error),
			} as ValidationResult;
		}
	}
}