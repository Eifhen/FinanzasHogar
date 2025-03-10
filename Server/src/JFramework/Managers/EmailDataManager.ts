import ApplicationContext from "../Context/ApplicationContext";
import { IEmailDataManager } from "./Interfaces/IEmailDataManager";
import ILoggerManager, { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { EmailVerificationData } from "./Types/EmailDataManagerTypes";
import { EmailData } from "./Types/EmailManagerTypes";


interface IEmailDataManagerDependencies {
	applicationContext: ApplicationContext;
}

/** Clase que permite generar objetos `EmailData` 
 * para ser utilizados por el `EmailManager` estos objetos son pasados
 * al `EmailTemplateManager` para ser utilizados en el template que se enviará
 * por correo */
export class EmailDataManager implements IEmailDataManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: IEmailDataManagerDependencies) {
		this._applicationContext = deps.applicationContext;

		this._logger = new LoggerManager({
			entityName: "EmailDataManager",
			entityCategory: LoggEntityCategorys.MANAGER,
			applicationContext: this._applicationContext,
		});
	}

	/** Obtiene un objeto de verificacion de email
 *  @param {string} name - Indica el nombre de la persona a la que se le enviará el email
 *  @param {string} email - Indica el email de la persona a la que se le enviará el email
 *  @param {string} token - Indica el token de activación 
 */
	public GetVerificationEmailData(name: string, email: string, token: string): EmailData<EmailVerificationData> {
		this._logger.Activity("GetValidationEmailData");

		return {
			title: this._applicationContext.translator.Translate("activar-cuenta"),
			recipientEmail: email,
			template: {
				name: "verification_email",
				data: {
					headTitle: this._applicationContext.translator.Translate("activar-cuenta"),
					homeBudgetLogo: this._applicationContext.settings.apiData.defaultImages.APP_LOGO,
					portfolioLogo: this._applicationContext.settings.apiData.defaultImages.PORTFOLIO_LOGO,
					blackWave: this._applicationContext.settings.apiData.defaultImages.BLACK_WAVE,
					subject: this._applicationContext.translator.Translate("activar-cuenta"),
					paragraph: {
						accentColor: this._applicationContext.settings.apiData.styleConfig.primaryColor,
						greating1: this._applicationContext.translator.Translate("hola"),
						recipientName: name,
						greating2: this._applicationContext.translator.Translate("bienvenido-a").toLowerCase(),
						bussinessName: this._applicationContext.settings.appPrettyName ?? "",
						argument: this._applicationContext.translator.Translate("cuenta-creada-exitosamente"),
					},
					button: {
						link: `${this._applicationContext.settings.apiData.appLinks.accountActivation}/${token}`,
						text: this._applicationContext.translator.Translate("activar"),
						color: this._applicationContext.settings.apiData.styleConfig.primaryColor
					}
				}
			},
			attatchments: undefined
		}
	};

}