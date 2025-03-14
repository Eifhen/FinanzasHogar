import { EN } from '../Translations/en_US';
import { ZodError } from "zod";
import { ErrorMessageData } from "./Exceptions";
import { ARRAY_START_INDEX, DEFAULT_NUMBER } from "../Utils/const";



/** Clase que permite trabajar con los errores de zod y convertirlo
 *  en un formato que podramos manejar en nuestra aplicación */
export default class SchemaErrorAdapter {

	/** Permite devolver un mensaje de error adaptado 
	 * según el código de error de zod */
	public static FormatValidationErrors(error: ZodError): ErrorMessageData[] {

		return error.issues.map((value) => {

			const ONE = 1;
			const fields = value.path.join(value.path.length > ONE ? "|" : "").trim();

			/** Validamos si un string, number, bigint o array tienen una longitud 
			 * inferior a la definida por la regla */
			if (value.code === "too_small") {
				return {
					message: `${value.code}_${value.type}`,
					args: [fields, value.minimum],
				} as ErrorMessageData;
			}

			/** Validamos si un string, number, bigint o array 
			 * tienen una longitud superior a la definida por la regla */
			if (value.code === "too_big") {
				return {
					message: `${value.code}_${value.type}`,
					args: [fields, value.maximum],
				} as ErrorMessageData;
			}

			/** Validamos los tipos y literales invalidos */
			if (value.code === "invalid_literal" || value.code === "invalid_type") {
				return {
					message: `${value.code}`,
					args: [fields, value.expected, value.received]
				} as ErrorMessageData;
			}

			/** Validamos los errores de unión y devolvemos el primer 
			 * error en la lista de unionErrors  */
			if (value.code === "invalid_union") {
				if (value.unionErrors !== undefined && value.unionErrors !== null && value.unionErrors.length > DEFAULT_NUMBER) {
					const unionError = value.unionErrors[ARRAY_START_INDEX];
					return this.FormatValidationErrors(unionError)[ARRAY_START_INDEX];
				}
				return {
					message: "invalid_union",
					args: [fields],
				} as ErrorMessageData;
			}

			/** Valida si el valor ingresado corresponde con el enum definido  */
			if (value.code === "invalid_enum_value") {
				return {
					message: "invalid_enum_value",
					args: [fields, value.received, `${value.options?.join(", ")}`]
				} as ErrorMessageData;
			}

			/** Valida los campos cuando se utiliza una union discriminadora */
			if (value.code === "invalid_union_discriminator") {
				return {
					message: "invalid_union_discriminator",
					args: [fields, `${value.options?.join(", ")}`]
				} as ErrorMessageData;
			}

			/** Valida que el valor del campo no sea un multiplo 
			 * del valor definido por la regla*/
			if (value.code === "not_multiple_of") {
				return {
					message: "not_multiple_of",
					args: [fields, value.multipleOf]
				} as ErrorMessageData;
			}

			/** Valida que el objeto no contenga propiedades adicionales */
			if (value.code === "unrecognized_keys") {
				return {
					message: "unrecognized_keys",
					args: [fields, value.keys.join(", ")]
				}
			}

			/** Valida el error custom */
			if (value.code === "custom") {
				return {
					message: value.message as keyof typeof EN,
					args: value.params && Array.isArray(value.params) ? [fields, value.params?.join(", ")] : [fields]
				}
			}

			/** Este resultado genérico aplica para las siguientes 
			 *  reglas o cualquier otra que no esté definida:  
			 * 
			 *  invalid_date, 
			 *  invalid_string 
			 *  invalid_arguments
			 *  invalid_return_type
			 *  invalid_intersection_types
			 *  not_finite
			 * */
			return {
				message: `${value.code}`,
				args: [fields]
			} as ErrorMessageData;

		});
	}
}