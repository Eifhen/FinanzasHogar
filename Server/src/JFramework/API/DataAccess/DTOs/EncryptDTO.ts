import SchemaProperty from "../../../Helpers/Decorators/SchemaProperty";
import { z } from "zod";
import EntitySchema from "../../../Helpers/DTOs/Data/EntitySchema";




export default class EncryptDTO extends EntitySchema {


	/** ConnectionString */
	@SchemaProperty(z.string().nonempty())
	public connectionString = "";

}