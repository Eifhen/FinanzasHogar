import { SignInDTO } from '../../DTOs/SignInDTO';
import ApplicationArgs from "../../../JFramework/Application/ApplicationArgs";
import { ApplicationResponse } from "../../../JFramework/Application/ApplicationResponse";
import { SignUpDTO } from "../../DTOs/SignUpDTO";





/** Interfaz que representa el servicio de autenticación de usuario */
export default interface IAuthenticationService {

  /** Método que permite el Registro de un usuario */
  SignUp(args: ApplicationArgs<SignUpDTO.Type>) : Promise<ApplicationResponse<boolean>>;


  /** Método que permite el Inicio de sesión de un usuario */
  SignIn(args: ApplicationArgs<SignInDTO.Type>) : Promise<ApplicationResponse<boolean>>;

}