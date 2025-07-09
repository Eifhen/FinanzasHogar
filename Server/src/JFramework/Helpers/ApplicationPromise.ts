import { ConnectionError } from "tedious";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { DatabaseConnectionException, DatabaseException } from "../ErrorHandling/Exceptions";
import { AutoBind } from "./Decorators/AutoBind";
import ApplicationContext from "../Configurations/ApplicationContext";


/*** Retorna una promesa de aplicación  */
export type IApplicationPromise<T> = Promise<[ApplicationException | Error | null, T | null]>;

export class ApplicationPromise {

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(applicationContext: ApplicationContext) {
		this._applicationContext = applicationContext;
	}


	/**
 * Envuelve una promesa en un manejo de errores simplificado.
 * Retorna un array donde el primer elemento es un posible error (o `null` si no hay error)
 * y el segundo elemento es el resultado exitoso de la promesa (o `null` si hubo error).
 *
 * @template T
 * @param {Promise<T>} queryPromise - La promesa/promesa a manejar.
 * @returns {Promise<[ApplicationException|Error|null, T|null]>} Un array con el error o los datos resultantes de la promesa.
 */
	@AutoBind
	public async TryQuery <T>(queryPromise: Promise<T>, callerName:string = ""): IApplicationPromise<T> {
		try {
			const data = await queryPromise;
			return [null, data];
		}
		catch (err: any) {
			let exception: ApplicationException;
		 
			if (err instanceof ApplicationException) {
				exception = err;
			} else if (err instanceof ConnectionError) {
				exception = new DatabaseConnectionException(callerName, this._applicationContext, __filename, err);
			} else {
				exception = new DatabaseException(callerName, "database-exception", this._applicationContext, __filename, err);
			}

			return [exception, null];
		}
	}
 


	/**
 * Envuelve una promesa en un manejo de errores simplificado.
 * Retorna un array donde el primer elemento es un posible error (o `null` si no hay error)
 * y el segundo elemento es el resultado exitoso de la promesa (o `null` si hubo error).
 *
 * @template T
 * @param {Promise<T>} promise - La promesa a manejar.
 * @returns {Promise<[ApplicationException|Error|null, T|null]>} Un array con el error o los datos resultantes de la promesa.
 */
	public static async Try <T>(promise: Promise<T>): IApplicationPromise<T> {
		try {
			const data = await promise;
			return [null, data];
		} catch (err: any) {
			return [err, null];
		}
	}
	
}

