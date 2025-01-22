import ApplicationContext from "../Application/ApplicationContext";
import { ImageStaticBucket } from "../Assets/ImageStaticBucket";
import { IEmailDataManager } from "./Interfaces/IEmailDataManager";
import ILoggerManager, { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { EmailVerificationData } from "./Types/EmailDataManagerTypes";
import { EmailData } from "./Types/EmailManagerTypes";




interface IEmailDataManagerDependencies {
    applicationContext: ApplicationContext;
}


/** Clase que permite generar objetos EmailData para ser utilizados por el EmailManager */
export class EmailDataManager implements IEmailDataManager {

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  constructor(deps: IEmailDataManagerDependencies){
    this._applicationContext = deps.applicationContext;

    this._logger = new LoggerManager({
      entityName: "EmailDataManager",
      entityCategory: LoggEntityCategorys.MANAGER,
      applicationContext: this._applicationContext,
    });
  }

  /** Obtiene un objeto de verificacion de email */
  public GetVerificationEmailData = (recipientName: string, recipientEmail:string, btnLink: string) : EmailData<EmailVerificationData> => {
    this._logger.Activity("GetValidationEmailData");

    return {
      title: "Activate Account",
      recipientEmail: recipientEmail,
      template: {
        name: "verification_email.html",
        data: {
          headTitle: "Activate Account",
          homeBudgetLogo: ImageStaticBucket.HomeBudget,
          portfolioLogo: ImageStaticBucket.Portafolio,
          subject: "Activate Account",
          paragraph: {
            greating1: "Hello ",
            recipientName: recipientName,
            greating2: "welcome to ",
            bussinessName: process?.env?.PrettyAppName ?? "",
            argument: `Your account has been successfully created. 
              Click the link below to activate your account`,
          },
          button: {
            link: btnLink,
            text: "Activate"
          }
        }
      },
      attatchments: undefined
    }
  };



}