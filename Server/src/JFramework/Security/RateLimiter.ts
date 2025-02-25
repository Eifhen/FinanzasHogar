import rateLimit, { Options, RateLimitRequestHandler } from "express-rate-limit";
import ApplicationContext from "../Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { RateLimiterConfig, TimeUnit } from "./types/RateLimiterTypes";




interface RateLimiterDependencies {
  applicationContext: ApplicationContext;
}

export default class RateLimiter {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Contexto de aplicación */
  private _applicationContext: ApplicationContext;


  constructor(deps: RateLimiterDependencies) {
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MIDDLEWARE,
      entityName: "RateLimiter"
    });

    this._applicationContext = deps.applicationContext;
  }


  /** Convierte el tiempo a milisegundos según la unidad proporcionada */
  private ConvertTimeToMiliSeconds(time: number, unit: TimeUnit): number {
    switch (unit) {
      case "minutes":
        return time * 60 * 1000; // Convertir minutos a milisegundos
      case "seconds":
        return time * 1000; // Convertir segundos a milisegundos
      default:
        throw new Error("Unidad de tiempo no soportada");
    }
  }

   /** Crear un limitador de tasa con las opciones proporcionadas */
  public CreateLimiter = (time: number, unit: TimeUnit, requestPerTime: number) : RateLimitRequestHandler => {
    this._logger.Activity("CreateReateLimiter");

    const timeUnitMsg = this._applicationContext.translator.Translate(unit);
    const windowMs = this.ConvertTimeToMiliSeconds(time, unit);

    return rateLimit({
      windowMs,
      max: requestPerTime,
      message: this._applicationContext.translator.Translate("rate-limit-exceded", [time, timeUnitMsg]),
      headers: false
    });
  }
}