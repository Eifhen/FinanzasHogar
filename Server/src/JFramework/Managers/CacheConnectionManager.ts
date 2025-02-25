import { createClient, RedisClientType } from "redis";
import ApplicationContext from "../Application/ApplicationContext";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import ICacheConnectionManager from "./Interfaces/ICacheConnectionManager";
import { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { Environment, EnvironmentStatus } from '../Utils/Environment';





interface CacheManagerDependencies {
  applicationContext: ApplicationContext;
}

export default class CacheConnectionManager implements ICacheConnectionManager {

  /** Logger */
  private readonly logger = new LoggerManager({
    entityCategory: LoggEntityCategorys.MANAGER,
    entityName: "CacheManager"
  })

  /** Contexto de aplicacion */
  private readonly _applicationContext: ApplicationContext;

  constructor(deps: CacheManagerDependencies) {
    this._applicationContext = deps.applicationContext;
  }


  /** Permite crear el cliente de Redis para manejar el cache */
  public Connect = async () : Promise<RedisClientType<any, any, any>> => {
    try {
      this.logger.Activity("CreateClient");

      const environment = this._applicationContext.settings.environment;
      let redisClient;

      /** Conectamos al cliente de redis */
      if(environment === EnvironmentStatus.DEVELOPMENT){
        redisClient = await createClient();
      }
      else {
        redisClient = await createClient({
          url: this._applicationContext.settings.cacheConfig.url,
          username: this._applicationContext.settings.cacheConfig.userName,
          password: this._applicationContext.settings.cacheConfig.password,
          database: this._applicationContext.settings.cacheConfig.databaseNumber,
          name: this._applicationContext.settings.cacheConfig.clientName
        });
      }

      redisClient.on("error", (err)=> {
        this.logger.Error("ERROR", "CreateClientEvent", new InternalServerException(
            "CreateClientEvent", 
            err.message, 
            this._applicationContext, 
            __filename, 
            err
          )
        );
      }); 

      redisClient.on("connect", (data)=>{
        this.logger.Message("INFO", "RedisClient Connected =>", data);
      })

      redisClient.connect();

      return redisClient;
    }
    catch(err:any){
      this.logger.Error("ERROR", "CreateClient", err);
      if(err instanceof ApplicationException){
        throw err;
      }

      throw new InternalServerException(
        "CreateClient",
        err.message, 
        this._applicationContext, 
        __filename, 
        err
      )
    }
  }

}




/**
 * @examples

  function RedisManager(){
    try {
      const client = createClient();
      client.connect();
      return client;
    }
    catch(err:any){
      console.log("REDIS ERROR =>", err);
      throw err;    
    }
  }

  const redisClient = RedisManager();
  export default redisClient;

  cacheController.get("/test", async (req: Request, res: Response, next: NextFunction) => {
    try {
      redisClient.setEx("PLANETS", EXPIRATION_TIME_IN_SECONDS, JSON.stringify(planets));
      console.log("Controlador ejecutado");
      return res.status(200).send(planets);
    }
    catch(err:any){
      console.log("Error =>", err);
    }
  });

  cacheController.get("/get-cached", async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Controlador ejecutado");
    
      const data = await redisClient.get("PLANETS");
      if(data){
        const items:Planet[] = JSON.parse(data);
        return res.status(200).send(items);
      }
      return res.status(200).send("no data");
    }
    catch(err:any){
      console.log("Error =>", err);
    }
  });

 */