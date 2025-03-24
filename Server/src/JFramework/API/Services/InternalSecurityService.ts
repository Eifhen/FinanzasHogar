
import ApplicationContext from "../../Configurations/ApplicationContext";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { InternalServerException } from "../../ErrorHandling/Exceptions";
import { CsrfData } from "../../Helpers/DTOs/CsrfToken";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import ITokenManager from "../../Managers/Interfaces/ITokenManager";
import LoggerManager from "../../Managers/LoggerManager";
import { Cookie } from "../../Helpers/DTOs/Cookie";
import { Environment } from "../../Utils/Environment";
import { TimeUnitConverter } from "../../Utils/TimeUnitConverter";
import IInternalSecurityService from "./Interfaces/InternalSecurityService";

interface InternalSecurityServiceDependencies {
	applicationContext: ApplicationContext;
	tokenManager: ITokenManager;
}

/** Clase para el manejo de las cookies internas del sistema */
export default class InternalSecurityService implements IInternalSecurityService {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Manejador de tokens */
	private readonly _tokenManager: ITokenManager;


	constructor(deps: InternalSecurityServiceDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "SERVICE",
			entityName: "InternalSecurityService"
		});

		/** Agregamos el contexto de applicación */
		this._applicationContext = deps.applicationContext;

		/** Agregamos el manejador de tokens */
		this._tokenManager = deps.tokenManager;
	}

	/** Permite Crear un token y una cookie para protección contra ataques CSRF */
	public async CreateCsrfProtection(): Promise<CsrfData> {
		try {
			this._logger.Activity("CreateCsrfProtection");

			/** Representa el nombre de la cookie que almacena el token CSRF */
			const csrfCookieData = this._applicationContext.settings.apiData.cookieData.csrfTokenCookie;

			/** Obtenemos el environment */
			const environment: Environment = this._applicationContext.settings.environment;

			/** Generamos el token */
			const token = await this._tokenManager.GenerateToken();

			/** Creamos la cookie */
			const cookie: Cookie = {
				name: csrfCookieData.name,
				value: token,
				options: {
					httpOnly: false,
					maxAge: TimeUnitConverter.ToMilliseconds(csrfCookieData.time.value, csrfCookieData.time.unit),
					sameSite: "strict",
					signed: false,
					secure: environment === Environment.PRODUCTION,
					path: '/'
				}
			}

			/** Agregamos el objeto a la respuesta */
			const data: CsrfData = {
				cookie,
				token: { token },
			}

			return data;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "CreateCsrfProtection", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"CreateCsrfProtection",
				"",
				this._applicationContext,
				__filename,
				err
			);
		}
	}


}