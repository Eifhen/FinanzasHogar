import { EmailVerificationData } from "../Types/EmailDataManagerTypes";
import { EmailData } from "../Types/EmailManagerTypes";







export interface IEmailDataManager {

  /** Obtiene un objeto de verificacion de email */
  GetVerificationEmailData: (recipientName: string, recipientEmail:string, btnLink: string) => EmailData<EmailVerificationData>;
}




