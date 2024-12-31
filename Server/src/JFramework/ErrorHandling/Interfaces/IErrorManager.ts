import { HttpStatusCodes, HttpStatusNames } from "../../Utils/HttpCodes";
import ApplicationException from "../ApplicationException";



/**  
  Interfaz ErrorManager la cual nos permite controlar el comportamiento 
  de los errores de la aplicación
*/
export default interface IErrorManager {


  /**  Retorna un objeto ApplicationException en base a la configuración ingresada */
  GetException(name:HttpStatusNames,status:HttpStatusCodes, msg: string, path:string, innerException?: Error) : ApplicationException;

}