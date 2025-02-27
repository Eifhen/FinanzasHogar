import { RedisClientType } from "redis";





export default interface ICacheConnectionManager {


  /** Permite la coneccion con el cliente cache */
  Connect() : RedisClientType<any, any, any>;

}