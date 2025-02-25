import { RedisClientType } from "redis";
import ApplicationContext from "../../Application/ApplicationContext";
import { Options } from "express-rate-limit";
import LoggerManager from "../../Managers/LoggerManager";
import { LoggEntityCategorys } from "../../Managers/Interfaces/ILoggerManager";
import RedisStore from "rate-limit-redis";
import { InternalServerException } from "../../ErrorHandling/Exceptions";







interface RateLimiterManagerDependencies {
  applicationContext: ApplicationContext;
  cacheClient: RedisClientType<any, any, any>,
}

export default class RateLimiterManager {

  /** Logger */
  private logger = new LoggerManager({
    entityCategory: LoggEntityCategorys.MANAGER,
    entityName: "RateLimiterManager"
  })

  /** Contexto de aplicación */
  private applicationContext: ApplicationContext;

  /** Cliente de cache */
  private cacheClient: RedisClientType<any, any, any>;

  constructor(deps: RateLimiterManagerDependencies) {
    this.applicationContext = deps.applicationContext;
    this.cacheClient = deps.cacheClient;
  }


  /** Agrega el RedisStore al objeto options del RateLimiter */
  public BuildStore = (options: Partial<Options>) : Partial<Options> => {
    try {
      this.logger.Activity("BuildStore");

      const time = options.windowMs ?? 0;
      const unit = "seconds";

      options.message = this.applicationContext.translator.Translate("rate-limit-exceded", [time, unit]);
      options.store = new RedisStore({
        sendCommand: (...args:string[]) => this.cacheClient.sendCommand(args) 
      })
  
      return options;
    }
    catch(err:any){
      this.logger.Error("ERROR", "BuildStore", err);
      throw new InternalServerException(
        "BuildStore", 
        err.message, 
        this.applicationContext, 
        __filename, 
        err
      );
    }
  };
}