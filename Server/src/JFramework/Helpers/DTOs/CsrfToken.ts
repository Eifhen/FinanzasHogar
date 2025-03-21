import SchemaProperty from "../Decorators/SchemaProperty";
import { DEFAULT_TOKEN_LENGTH } from "../../Utils/const";
import EntitySchema from "./Data/EntitySchema";
import { z } from "zod";
import { Cookie } from "./Cookie";



/** Representa un token CSRF */
export default class CsrfToken extends EntitySchema {

	/** Representa un token de aplicación */
	@SchemaProperty(z.string().nonempty().min(DEFAULT_TOKEN_LENGTH))
	public token: string = "";
	
}

/** Data necesaria para generar validación CSRF */
export type CsrfData = {
	token: CsrfToken;
	cookie: Cookie;
}
