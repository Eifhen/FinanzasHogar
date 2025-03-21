import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import { EmailData } from "../../Managers/Types/EmailManagerTypes";




/** Manajador de emails */
export default interface IEmailManager {


  /** Permite enviar un email */
  SendEmail <T>(data: EmailData<T>) : IApplicationPromise<void>; 

}