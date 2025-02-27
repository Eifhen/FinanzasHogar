import { IApplicationPromise } from "../../Application/ApplicationPromise";
import { EmailData } from "../Types/EmailManagerTypes";




/** Manajador de emails */
export default interface IEmailManager {


  /** Permite enviar un email */
  SendEmail <T>(data: EmailData<T>) : IApplicationPromise<void>; 

}