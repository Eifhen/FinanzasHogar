import { EmailVerificationData } from "../Types/EmailDataManagerTypes";
import { EmailData } from "../Types/EmailManagerTypes";







export interface IEmailDataManager {

  /** Obtiene un objeto de verificacion de email
  *  @param {string} recipientName - Indica el nombre de la persona a la que se le enviará el email
  *  @param {string} recipientEmail - Indica el email de la persona a la que se le enviará el email
  *  @param {string} token - Indica el token de activación 
  */
  GetVerificationEmailData(recipientName: string, recipientEmail:string, token: string) : EmailData<EmailVerificationData>;
}




