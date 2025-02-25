
import ApplicationContext from "../../Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { RateLimiterConfig } from "../types/RateLimiterTypes";
import { ConvertTimeToMiliSeconds } from "../../Utils/utils";
import { TimeUnit } from "../../Utils/types/CommonTypes";
import { NextFunction, Response, Request } from "express";
import ApplicationRequest from "../../Application/ApplicationRequest";
import { Limiters } from "./Limiters";
import { RateLimitRequestHandler } from "express-rate-limit";





// Define una interfaz base para las dependencias comunes
interface CommonDependencies {
  applicationContext: ApplicationContext;
}

// Utiliza un tipo mapeado para extender la interfaz base con los limitadores específicos
type RateLimiterDependencies<LimiterName extends Limiters> = CommonDependencies & {
  [key in LimiterName]: RateLimitRequestHandler;
};


export default function RateLimiter<LimiterName extends Limiters>(limiterName: LimiterName){
  
  /** Logger */
  const logger = new LoggerManager({
    entityCategory: LoggEntityCategorys.MIDDLEWARE,
    entityName: "RateLimiter"
  })


  /** Devuelve una función que recibe las dependencias y 
   * devuelve el middleware `rateLimit` */
  return async (deps: RateLimiterDependencies<LimiterName>) => {
    try {
      logger.Activity("RateLimiter");
      const rateLimiter:RateLimitRequestHandler = deps[limiterName];
      console.log("Rate =>", rateLimiter);
      return rateLimiter;
    }
    catch(err:any){
      logger.Error("ERROR", "RateLimiter", err);
      return (req: Request, res:Response, next:NextFunction) => {
        next(err);
      }
    }
  }
}