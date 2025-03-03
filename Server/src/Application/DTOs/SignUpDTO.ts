/* eslint-disable @typescript-eslint/no-magic-numbers */

import { z } from "zod";
import SchemaProperty from "../../JFramework/Decorators/SchemaProperty";
import EntitySchema from "../../JFramework/DTOs/Data/EntitySchema";
import AppImage from "../../JFramework/DTOs/AppImage";


export default class SignUpDTO extends EntitySchema {

	/** Nombre del usuario */
	@SchemaProperty(z.string().min(4))
	public nombre: string = "";

	/** Apellido del usuario */
	@SchemaProperty(z.string().min(4))
	public apellidos: string = "";

	/** Fecha de nacimiento del usuario */
	@SchemaProperty(z.preprocess((arg) => {
		if (typeof arg === "string" || arg instanceof Date) {
			return new Date(arg);
		}
		return arg;
	}, z.date()))
	public fechaNacimiento: Date = new Date();

	/** Pais de origen del usuario */
	@SchemaProperty(z.string().min(4))
	public pais: string = "";

	/** Email del usuario */
	@SchemaProperty(z.string().email())
	public email: string = "";

	/** Contraseña del usuario */
	@SchemaProperty(z.string().max(12))
	public password: string = "";

	/** Sexo del usuario false = F | true = M */
	@SchemaProperty(z.boolean())
	public sexo: boolean = false;
 
	/** Datos de la foto de perfil */
	@SchemaProperty(AppImage.createSchema())
	public foto:AppImage = new AppImage();

}

