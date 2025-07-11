import { RedisClientType } from "redis";
import { Options as RateLimiterOptions } from "express-rate-limit";
import LoggerManager from "../../Managers/LoggerManager";
import { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import RedisStore from "rate-limit-redis";
import { ErrorMessageData, InternalServerException, TooManyRequestsException } from "../../ErrorHandling/Exceptions";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../Utils/HttpCodes";
import { TimeUnitConverter } from "../../Utils/TimeUnitConverter";
import { Limiters } from "./Limiters";
import IsNullOrEmpty from '../../Utils/utils';
import { AutoBind } from "../../Helpers/Decorators/AutoBind";
import ApplicationContext from "../../Configurations/ApplicationContext";


interface RateLimiterManagerDependencies {
	applicationContext: ApplicationContext;
	cacheClient: RedisClientType<any, any, any>,
}

export default class RateLimiterManager {

	/** Logger */
	private _logger: LoggerManager;

	/** Contexto de aplicación */
	private _applicationContext: ApplicationContext;

	/** Cliente de cache */
	private _cacheClient: RedisClientType<any, any, any>;

	constructor(deps: RateLimiterManagerDependencies) {
		this._applicationContext = deps.applicationContext;
		this._cacheClient = deps.cacheClient;

		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MANAGER,
			entityName: "RateLimiterManager",
			applicationContext: deps.applicationContext
		})
	}

	/** Agrega el RedisStore al objeto options del RateLimiter */
	@AutoBind
	public BuildStore (limiterName: Limiters, rateLimiterConfigOptions: Partial<RateLimiterOptions>): Partial<RateLimiterOptions> {
		try {
			this._logger.Activity(`BuildStore | ${limiterName}`);

			/** Agrega el store a las opciones de 
			 * configuración del RateLimiter, el store es importante 
			 * ya que allí se agregará la data persistente que el 
			 * rateLimiter necesita como por ejemplo el conteo de requests */
			rateLimiterConfigOptions.store = new RedisStore({
				sendCommand: (...args: string[]) => this._cacheClient.sendCommand(args)
			})

			/** Agregamos el middleware a las opciones de configuracion */
			rateLimiterConfigOptions.handler = this.RequestLimiterHandler(limiterName, rateLimiterConfigOptions.windowMs);

			return rateLimiterConfigOptions;
		}
		catch (err: any) {
			this._logger.Error("ERROR", "BuildStore", err);
			throw new InternalServerException(
				"BuildStore",
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	};

	/** 
	 * @param {Limiters} limiterName Nombre del limiter a ejecutar
	 * @param {number} requestCooldownInMs Tiempo que debe transcurrir antes de  permitir 
	 * solicitudes nuevamente esto se expresa en milisegundos
	 * @description  Retorna el Middleware que será usado por el rateLimiter cuando 
	 * se llegue al limite de peticiones. 
	 * 
	 * Este middleware es activado por el rateLimiter cuando se 
	 * llega al limite de peticiones */
	@AutoBind
	private RequestLimiterHandler (limiterName: Limiters, requestCooldownInMs: number = 0) {
		return (req: Request, res: Response, next: NextFunction) => {
			try {
				this._logger.Activity(`RequestLimiterHandler | ${limiterName}`);

				/** Obtenemos la unidad de tiempo según los milisegundos */
				const unit = TimeUnitConverter.MillisecondsToUnit(requestCooldownInMs);

				/** Obtenemos el tiempo de espera según la unidad especificada y los milisegundos */
				const coolDown = TimeUnitConverter.FromMilliseconds(requestCooldownInMs, unit);

				const messageData: ErrorMessageData = {
					message: IsNullOrEmpty(limiterName) ? "too-many-requests" : limiterName,
					args: [coolDown, unit]
				}

				return res.status(HttpStatusCode.TooManyRequests).send(new TooManyRequestsException(
					"RequestLimiterHandler",
					messageData,
					this._applicationContext,
					__filename,
				));
			}
			catch (err: any) {
				this._logger.Error("ERROR", "RequestLimiterHandler", err);
				next(new InternalServerException(
					"RequestLimiterHandler",
					err.message,
					this._applicationContext,
					__filename,
					err
				));
			}
		}
	}

}