import ApplicationArgs from "../../../JFramework/Helpers/ApplicationArgs";
import { ApiResponse, ApplicationResponse } from "../../../JFramework/Helpers/ApplicationResponse";
import SignInDTO from "../../DTOs/SignInDTO";
import SignUpDTO from "../../DTOs/SignUpDTO";
import UserConfirmationDTO from "../../DTOs/UserConfirmationDTO";





/** Interfaz que representa el servicio de autenticación de usuario */
export default interface IAuthenticationService {

  /** Método que permite el Registro de un usuario */
  SignUp(args: ApplicationArgs<SignUpDTO>) : ApiResponse<void>;

  /** Permite Validar el token de confirmación de un usuario y marcar el usuario como activo */
  ValidateUserConfirmationToken(args: ApplicationArgs<UserConfirmationDTO>) : ApiResponse<void>;

  /** Método que permite el Inicio de sesión de un usuario */
  SignIn(args: ApplicationArgs<SignInDTO>) : ApiResponse<boolean>;




}