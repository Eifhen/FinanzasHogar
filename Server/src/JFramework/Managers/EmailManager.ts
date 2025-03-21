import Mail from "nodemailer/lib/mailer";
import nodemailer from 'nodemailer';
import { AutoBind } from "../Helpers/Decorators/AutoBind";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import { IApplicationPromise, ApplicationPromise } from "../Helpers/ApplicationPromise";
import IFileManager from "../Managers/Interfaces/IFileManager";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import IEmailManager from "./Interfaces/IEmailManager";
import { IEmailTemplateManager } from "./Interfaces/IEmailTemplateManager";
import { EmailData } from "./Types/EmailManagerTypes";
import ApplicationContext from "../Configurations/ApplicationContext";



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
	@AutoBind
	public async SendEmail <TemplateData>(data:EmailData<TemplateData>) : IApplicationPromise<void> {
		try {
			this._logger.Activity("SendEmail");
			return ApplicationPromise.Try((async ()=> {
				try {
					/** Email provider */
					const provider = this._applicationContext.settings.emailProviderConfig.currentProvider;

					/** Datos para inyectar en la plantilla */
					const htmlToSend = this._emailTemplateManager.GetTemplate<TemplateData>(data.template.name, data.template.data);

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
							this._logger.Message("ERROR", "Error al enviar correo", err);
							throw err;
						}
						else{
							this._logger.Message("INFO", `Correo enviado => ${info.response}`);
						}
					});

				}
				catch(err:any){
					this._logger.Message("ERROR", "SendMail Promise Error", err);
					throw err;
				}
			})());
		}
		catch(err:any){
			this._logger.Error("ERROR", "SendMail", err);
			throw new InternalServerException(
				"SendEmail",
				err.message, 
				this._applicationContext, 
				__filename, 
				err
			);
		}
	}

}
