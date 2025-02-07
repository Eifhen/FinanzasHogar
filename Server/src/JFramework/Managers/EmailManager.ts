import ApplicationContext from "../Application/ApplicationContext";
import { ApplicationPromise, IApplicationPromise } from "../Application/ApplicationPromise";
import IEmailManager from "./Interfaces/IEmailManager";
import ILoggerManager, { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import { EmailData } from "./Types/EmailManagerTypes";
import IFileManager from "./Interfaces/IFileManager";
import nodemailer from 'nodemailer';
import Mail from "nodemailer/lib/mailer";
import { IEmailTemplateManager } from "./Interfaces/IEmailTemplateManager";


interface IEmailManagerDependencies {
  applicationContext: ApplicationContext;
  fileManager: IFileManager;
  emailTemplateManager: IEmailTemplateManager;
}

export default class EmailManager implements IEmailManager {

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  /** Manejador de archivos */
  private readonly _fileManager: IFileManager;

  /** Manejador de templates para email */
  private readonly _emailTemplateManager: IEmailTemplateManager;


  constructor(deps:IEmailManagerDependencies){

    this._applicationContext = deps.applicationContext;
    this._fileManager = deps.fileManager;
    this._emailTemplateManager = deps.emailTemplateManager;

    this._logger = new LoggerManager({
      entityName: "EmailManager",
      entityCategory: LoggEntityCategorys.MANAGER,
      applicationContext: this._applicationContext,
    });
  }

  /** Método que permite enviar un email a un usuario */
  public SendEmail = async <T>(data:EmailData<T>) : IApplicationPromise<void> => {
    try {
      this._logger.Activity("SendEmail");
      return ApplicationPromise.Try((async ()=> {
        try {
          /** Email provider */
          const provider = this._applicationContext.settings.emailProviderConfig.currentProvider;

          /** Datos para inyectar en la plantilla */
          const htmlToSend = this._emailTemplateManager.GetTemplate<T>(data.template.name, data.template.data);

          /** Preparamos el transporter */
          const transporter = nodemailer.createTransport({ 
            service: provider.service, 
            auth: { 
              user: provider.auth.user, 
              pass: provider.auth.pass 
            } 
          });

          /** Mail options */
          const mailOptions: Mail.Options = {
            from: provider.auth.user,
            to: data.recipientEmail,
            subject: data.title,
            html: htmlToSend,
            attachments: data.attatchments
          }

          /** Enviar correo */
          transporter.sendMail(mailOptions, (err, info)=>{
            if(err){
              console.log("Error al enviar correo =>", err);
              throw err;
            }
            else{
              console.log("Correo enviado", info.response);
            }
          });

        }
        catch(err:any){
          console.log("Catch =>", err);
          throw err;
        }
      })());
    }
    catch(err:any){
      this._logger.Error("ERROR", "SendMail", err);
      throw new InternalServerException(err.message, this._applicationContext, __filename, err);
    }
  }

}
