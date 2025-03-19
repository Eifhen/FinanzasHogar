import { Response } from "express";
import ApplicationContext from "../Context/ApplicationContext";
import ICookieManager from "./Interfaces/ICookieManager";
import ILoggerManager from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { Environment } from "../Utils/Environment";
import { CustomCookieOptions } from "./Types/CustomCookieOptions";

interface ICookieManagerDependencies {
	applicationContext: ApplicationContext;
}

export default class CookieManager implements ICookieManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: ICookieManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "CookieManager"
		});

		/** Agregamos el contexto de applicación */
		this._applicationContext = deps.applicationContext;
	}

	/** Permite crear una cookie y agregarla a la respuesta */
	Create(res: Response, name: string, value: string, options: CustomCookieOptions): void {
		try {
			this._logger.Activity("Create");

			/** Obtenemos el environment */
			const environment: Environment = this._applicationContext.settings.environment;

			res.cookie(name, value, {
				httpOnly: options.httpOnly, // Por defecto, la cookie es HttpOnly
				secure: environment === Environment.PRODUCTION, // Activar solo en HTTPS
				signed: options.signed, // Indica si la cookie debe estar firmada
				sameSite: 'strict', // Configuración SameSite
				maxAge: options.maxAge ?? undefined, // Tiempo de vida
				path: options.path ?? '/' // Ruta por defecto
			});
		}
		catch (err: any) {
			this._logger.Error("ERROR", "CREATE", err);
			throw err;
		}
	}

	/** Permite eliminar una cookie y eliminarla de la respuesta */
	Delete(res: Response, name: string): void {
		try {
			this._logger.Activity("Delete");
			res.clearCookie(name);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Delete", err);
			throw err;
		}
	}

}