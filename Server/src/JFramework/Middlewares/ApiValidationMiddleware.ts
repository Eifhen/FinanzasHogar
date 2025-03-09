import { NextFunction, Response } from 'express';
import ApplicationRequest from '../Helpers/ApplicationRequest';
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from '../Managers/Interfaces/ILoggerManager';
import LoggerManager from '../Managers/LoggerManager';
import IsNullOrEmpty from '../Utils/utils';
import ApplicationException from '../ErrorHandling/ApplicationException';
import { HttpStatusCode, HttpStatusName } from '../Utils/HttpCodes';
import { v4 as uuidv4 } from 'uuid';
import ApplicationContext from '../Context/ApplicationContext';
import ConfigurationSettings from '../Configurations/ConfigurationSettings';
import { ApplicationMiddleware } from './Types/MiddlewareTypes';
import { AutoClassBinder } from '../Decorators/AutoBind';
import { ApplicationLenguages, ApplicationLenguage } from '../Translations/Types/ApplicationLenguages';




/** Middleware para manejo de la validación del api */
@AutoClassBinder
export default class ApiValidationMiddleware extends ApplicationMiddleware {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	constructor(){
		super();
		
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MIDDLEWARE,
			entityName: "ApiValidationMiddleware"
		});
	
	}

	/** Obtiene la configuración de idioma de la requeste en curso */
	private GetLenguageConfig (req: ApplicationRequest, settings: ConfigurationSettings) {
		if(IsNullOrEmpty(req.headers[settings.apiData.headers.langHeader])){
			return ApplicationLenguages.en
		}
		else {
			return req.headers[settings.apiData.headers.langHeader] as ApplicationLenguage ;
		}
	}

	/** Intercepta el request en curso y agrega funcionalidad */
	public async Intercept (req: ApplicationRequest, res: Response, next: NextFunction) : Promise<any> {
		try {
			this._logger.Activity("Intercept");
			const START_INDEX = 0;
			const END_INDEX = 8;

			/** Obtenemos el contexto de aplicación */
			const applicationContext = req.container.Resolve<ApplicationContext>("applicationContext");
			
			/** Data de aplicación */
			const apiData = applicationContext.settings.apiData;
			
			/** ApiKey recibida en la request */
			const incomingApiKey = req.headers[apiData.headers.apiKeyHeader];
		 
			/** Creamos un nuevo RequestID */
			const request_id = uuidv4().slice(START_INDEX, END_INDEX);

			/** Validamos si el ApiKey está definido en el contexto o 
			 * si el ApiKey no fue ingresado en la request */
			if(IsNullOrEmpty(apiData.apiKey) || IsNullOrEmpty(incomingApiKey)){
				throw new ApplicationException(
					"ApiValidationMiddleware",
					HttpStatusName.InternalServerError,
					applicationContext.translator.Translate("apikey-no-definido"),
					HttpStatusCode.InternalServerError,
					request_id,
					__filename
				);
			}

			/** Validamos que el ApiKey definido en el context y 
			 * el ApiKey ingresado en la request concuerden */
			if(apiData.apiKey !== incomingApiKey){
				const invalidKey = Array.isArray(incomingApiKey) ? incomingApiKey : [incomingApiKey ? incomingApiKey : ""] ;
				throw new ApplicationException(
					"ApiValidationMiddleware",
					HttpStatusName.BadRequest,
					applicationContext.translator.Translate("apikey-invalido", invalidKey),
					HttpStatusCode.BadRequest,
					request_id,
					__filename
				);
			}

			/** Agregamos el ApiKey al contexto */
			applicationContext.requestID = request_id;

			/** Agregamos la ip actual al contexto */
			applicationContext.ipAddress = IsNullOrEmpty(req.ip) ? "" : req.ip!;

			/** Seteamos la configuración de idioma al contexto */
			applicationContext.lang = this.GetLenguageConfig(req, applicationContext.settings);

			/** Agregamos el ApiKey a la request */
			req.requestID = request_id;

			return next();
		}
		catch(err:any){
			this._logger.Error(LoggerTypes.ERROR, "Intercept", err);
			next(err);
		}
	}

}