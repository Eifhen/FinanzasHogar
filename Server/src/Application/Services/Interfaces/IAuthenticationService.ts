import ApplicationArgs from "../../../JFramework/Application/ApplicationArgs";
import { ApplicationResponse } from "../../../JFramework/Application/ApplicationResponse";
import SignInDTO from "../../DTOs/SignInDTO";
import SignUpDTO from "../../DTOs/SignUpDTO";





/** Interfaz que representa el servicio de autenticación de usuario */
export default interface IAuthenticationService {

  /** Método que permite el Registro de un usuario */
  SignUp(args: ApplicationArgs<SignUpDTO>) : Promise<ApplicationResponse<void>>;


  /** Método que permite el Inicio de sesión de un usuario */
  SignIn(args: ApplicationArgs<SignInDTO>) : Promise<ApplicationResponse<boolean>>;

}