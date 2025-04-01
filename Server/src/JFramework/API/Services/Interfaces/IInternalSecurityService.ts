import { CsrfData } from "../../../Helpers/DTOs/CsrfToken";


/** Interfaz del servicio de manejo de cookies */
export default interface IInternalSecurityService {

  /** Permite Crear una cookie y un token CSRF */
  CreateCsrfProtection() : Promise<CsrfData>;

}
