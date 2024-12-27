import ApplicationException from "../ErrorHandling/ApplicationException";




/*** Retorna una promesa de aplicación  */
export type IApplicationPromise<T> = Promise<[ApplicationException|Error|null, T|null]>;


export class ApplicationPromise {

  /**
 * Envuelve una promesa en un manejo de errores simplificado.
 * Retorna un array donde el primer elemento es un posible error (o `null` si no hay error)
 * y el segundo elemento es el resultado exitoso de la promesa (o `null` si hubo error).
 *
 * @template T
 * @param {Promise<T>} promise - La promesa a manejar.
 * @returns {Promise<[ApplicationException|Error|null, T|null]>} Un array con el error o los datos resultantes de la promesa.
 */
  public static Try = async <T>(promise:Promise<T>) : IApplicationPromise<T> =>{
    try {
      const data = await promise;
      return [null, data];
    } catch (err:any) {
      return [err, null];
    }
  }
}

