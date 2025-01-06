import ApplicationArgs from "../../JFramework/Application/ApplicationArgs";
import { ApplicationResponse } from "../../JFramework/Application/ApplicationResponse";
import IErrorManager from "../../JFramework/ErrorHandling/Interfaces/IErrorManager";
import { SignInDTO } from "../DTOs/SignInDTO";
import { SignUpDTO } from "../DTOs/SignUpDTO";
import IAuthenticationService from "./Interfaces/IAuthenticationService";
import IUsuariosSqlRepository from '../../Dominio/Repositories/IUsuariosSqlRepository';
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import { HttpStatusCode, HttpStatusMessage } from "../../JFramework/Utils/HttpCodes";
import IsNullOrEmpty from '../../JFramework/Utils/utils';
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";


interface IAuthenticationServiceDependencies {

  errorManager: IErrorManager;
  usuariosRepository: IUsuariosSqlRepository;
  applicationContext: ApplicationContext;

}


/** Servicio de Authenticación de usuario */
export default class AuthenticationService implements IAuthenticationService {

  /** Manejador de errores */
  private _errorManager: IErrorManager;

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;
  
  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;
  
  /** Repositorio de usuarios */
  private _usuariosRepository: IUsuariosSqlRepository;

  constructor(deps: IAuthenticationServiceDependencies){
    this._errorManager = deps.errorManager;
    this._usuariosRepository = deps.usuariosRepository;

    this._applicationContext = deps.applicationContext;
    
    this._logger = new LoggerManager({
      entityName: "AuthenticationService",
      entityCategory: LoggEntityCategorys.CONTROLLER,
      applicationContext: this._applicationContext,
    });
  }

  /** Método que permite el registro del usuario */
  public SignUp = async (args: ApplicationArgs<SignUpDTO.Type>): Promise<ApplicationResponse<boolean>> => {
    try{
      this._logger.Activity("SignUp");

      // Por implementar

      return new ApplicationResponse<boolean>(
        this._applicationContext.requestID,
        HttpStatusMessage.Created,
        true
      );
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "SignUp", err);

      throw this._errorManager.GetException(
        IsNullOrEmpty(err.name) ? "SignUp" : err.name,
        IsNullOrEmpty(err.status) ? HttpStatusCode.InternalServerError : err.status,
        IsNullOrEmpty(err.message) ? HttpStatusMessage.InternalServerError : err.message,
        IsNullOrEmpty(err.path) ? __filename : err.path!,
        err
      );
    }
  }

  /** Método que permite el inicio de sesión del usuario */
  public SignIn = async (args: ApplicationArgs<SignInDTO.Type>): Promise<ApplicationResponse<boolean>> => {
    try{
      this._logger.Activity("SignIn");

      // Por implementar
      return new ApplicationResponse(
        this._applicationContext.requestID,
        HttpStatusMessage.Accepted,
        true
      )
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.ERROR, "SignIn", err);
      throw this._errorManager.GetException(
        IsNullOrEmpty(err.name) ? "SignIn" : err.name,
        IsNullOrEmpty(err.status) ? HttpStatusCode.InternalServerError : err.status,
        IsNullOrEmpty(err.message) ? HttpStatusMessage.InternalServerError : err.message,
        IsNullOrEmpty(err.path) ? __filename : err.path!,
        err
      );
    }
  }

}