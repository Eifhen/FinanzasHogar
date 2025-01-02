import { JwtPayload } from "jsonwebtoken";







/** Nos permite administrar tokens de jwt */
export default interface ITokenManager {

  /** Permite generar un token con un payload del tipo ingresado */
  Generate<T>(payload:T) : Promise<string>;

  /** Permite decodificar un token ingresado */
  Decode(token:string) : Promise<string | JwtPayload>

}