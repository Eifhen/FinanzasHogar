import { ZodError } from "zod";
import { ErrorMessageData } from "./Exceptions";







export default class SchemaValidationError {

	/** Permite devolver un mensaje de error adaptado */
	public static GetZodErrorMessage(error: ZodError): ErrorMessageData[] {

		return error.issues.map((value) => {
			const fields = value.path.join(" ").trim();

			if (value.code === "too_small") {
				return {
					message: `${value.code}_${value.type}`,
					args: [fields, value.minimum],
				} as ErrorMessageData;
			}

			if (value.code === "too_big") {
				return {
					message: `${value.code}_${value.type}`,
					args: [fields, value.maximum],
				} as ErrorMessageData;
			}

			if (value.code === "invalid_literal" || value.code === "invalid_type") {
				return {
					message: `${value.code}`,
					args: [fields, value.expected, value.received]
				} as ErrorMessageData;
			}

			// if(value.code === "invalid_union"){
			// 	return this.GetZodErrorMessage(value.unionErrors)
			// }

			/** invalid_date, 
			 *  invalid_string */
			return {
				message: `${value.code}`,
				args: [fields]
			} as ErrorMessageData;

		});
	}
}