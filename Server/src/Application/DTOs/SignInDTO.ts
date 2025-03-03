/* eslint-disable @typescript-eslint/no-magic-numbers */

import { z } from "zod";
import SchemaProperty from "../../JFramework/Decorators/SchemaProperty";
import EntitySchema from "../../JFramework/DTOs/Data/EntitySchema";


export default class SignInDTO extends EntitySchema {

	/** Hace referencia al email del usuario */
	@SchemaProperty(z.string().email())
	public email: string = "";

	/** Hace referencia a la contraseña del usuario */
	@SchemaProperty(z.string().min(10))
	public password: string = "";


}



