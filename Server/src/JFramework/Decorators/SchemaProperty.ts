/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ZodSchema } from "zod";


/** Decorador de propiedades que recibe el tipo Zod de la propiedad 
 * este decorador se ejecuta cuando se cambia el valor de 
 * una propiedad de la clase */
export default function SchemaProperty(zodPropertyType: ZodSchema) {
	return function (target:any, propertyKey: string){
		
		/** Obtenemos el constructor de la clase */
		const classConstructor = target.constructor;

		/** Si nuestro target no tiene una propiedad schema, 
		 * entonces la creamos  como un objeto vacio*/
		const hasProperty = Object.prototype.hasOwnProperty.call(classConstructor, "schema");
		if(!hasProperty || !classConstructor.schema){
			classConstructor.schema = {};
		} 
 
		/** Agregamos el valor de propiedad zod a la 
		 * key de nuestro objeto schema */
		classConstructor.schema[propertyKey] = zodPropertyType;

		/** Para fines de depuración */
		// console.log(`Clase: ${classConstructor.name}, Propiedad: ${propertyKey}, Tipo:`, zodPropertyType);
		// console.log(`Esquema actual de ${classConstructor.name}:`, classConstructor.schema);
 
		let value: any;

		/** Definimos la propiedad getter */
		const getter = function(){
			return value;
		}

		/** Definimos la propiedad setter */
		const setter = function(newVal:any){
			value = newVal;
		}

		/** Sobreescribimos el get y el setter de la propiedad */
		Object.defineProperty(target, propertyKey, {
			get: getter,
			set: setter
		});
	}
}