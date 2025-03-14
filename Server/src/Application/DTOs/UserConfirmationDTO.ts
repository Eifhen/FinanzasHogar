/* eslint-disable @typescript-eslint/no-magic-numbers */

import SchemaProperty from "../../JFramework/Decorators/SchemaProperty";
import { z } from "zod";
import EntitySchema from "../../JFramework/DTOs/Data/EntitySchema";


/** DTO para manejar la confirmación de usuario */
export default class UserConfirmationDTO extends EntitySchema {

	/** Representa a un token de confirmación de usuario*/
	@SchemaProperty(z.string().nonempty().min(32))
	public token: string = "";
}