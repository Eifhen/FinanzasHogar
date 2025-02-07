import { JwtPayload } from "jsonwebtoken";







/** Nos permite administrar tokens de jwt */
export default interface ITokenManager {

  /** Permite generar un token jwt con un payload del tipo ingresado */
  GeneratePayloadToken<T>(payload:T) : Promise<string>;

  /** Permite decodificar un token jwt ingresado */
  Decode(token:string) : Promise<string | JwtPayload>

  /**
 * Genera un token aleatorio y seguro (No JWT), y lo hashea usando bcrypt
 * @returns {Promise<string>} - El token hasheado generado
 */
  GenerateToken() : Promise<string>;

}