import ApplicationArgs from "../../JFramework/Application/ApplicationArgs";
import { ApplicationResponse } from "../../JFramework/Application/ApplicationResponse";
import IErrorManager from "../../JFramework/ErrorHandling/Interfaces/IErrorManager";
import { SignInDTO } from "../DTOs/SignInDTO";
import { SignUpDTO } from "../DTOs/SignUpDTO";
import IAuthenticationService from "./Interfaces/IAuthenticationService";
import IUsuariosSqlRepository from '../../Dominio/Repositories/IUsuariosSqlRepository';
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import { HttpStatusCode, HttpStatusMessage, HttpStatusName } from "../../JFramework/Utils/HttpCodes";
import IsNullOrEmpty from '../../JFramework/Utils/utils';
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import IEncrypterManager from "../../JFramework/Managers/Interfaces/IEncrypterManager";
import ITokenManager from "../../JFramework/Managers/Interfaces/ITokenManager";
import { CreateUsuarios } from "../../Dominio/Entities/Usuarios";
import DateManager from "../../JFramework/Managers/DateManager";
import { EstadosUsuario } from "../../JFramework/Utils/estados";
import MssSqlTransactionBuilder from "../../Infraestructure/Repositories/Generic/MssSqlTransactionBuilder";
import ImageStrategyDirector from "../../JFramework/Strategies/Image/ImageStrategyDirector";
import { AppImage } from "../../JFramework/DTOs/AppImage";


interface IAuthenticationServiceDependencies {

  errorManager: IErrorManager;
  usuariosRepository: IUsuariosSqlRepository;
  applicationContext: ApplicationContext;
  encrypterManager: IEncrypterManager;
  tokenManager: ITokenManager;
  imageDirector: ImageStrategyDirector;
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

  /** Manejador de tokens */
  private _tokenManager: ITokenManager;

  /** Manejador de encryptado */
  private _encrypterManager: IEncrypterManager;

  /** Manejador de transacciones */
  private _transaction: MssSqlTransactionBuilder;

  /** Manejador de imagenes */
  private _imageDirector: ImageStrategyDirector;

  constructor(deps: IAuthenticationServiceDependencies) {
    this._errorManager = deps.errorManager;
    this._usuariosRepository = deps.usuariosRepository;
    this._applicationContext = deps.applicationContext;
    this._encrypterManager = deps.encrypterManager;
    this._tokenManager = deps.tokenManager;
    this._imageDirector = deps.imageDirector;

    this._logger = new LoggerManager({
      entityName: "AuthenticationService",
      entityCategory: LoggEntityCategorys.CONTROLLER,
      applicationContext: this._applicationContext,
    });

    this._transaction = new MssSqlTransactionBuilder(
      this._applicationContext, [ 
        this._usuariosRepository 
      ]
    );
  }

  /** Método que permite el registro del usuario */
  public SignUp = async (args: ApplicationArgs<SignUpDTO.Type>): Promise<ApplicationResponse<CreateUsuarios>> => {
    try {
      this._logger.Activity("SignUp");

      const isNotValid = SignUpDTO.GetError(args.data);

      // si el objeto ingresado es invalido
      if (isNotValid) {
        throw this._errorManager.GetException(
          HttpStatusName.BadRequest,
          HttpStatusCode.BadRequest,
          isNotValid.message,
          __filename
        )
      }

      const result = await this._transaction.Start<CreateUsuarios>(async () => {
        try {

          /** Se crea usuario  */
          const user: CreateUsuarios = {
            nombre: args.data.nombre,
            apellidos: args.data.apellidos,
            fecha_nacimiento: args.data.fechaNacimiento,
            sexo: args.data.sexo,
            email: args.data.email,
            password: await this._encrypterManager.Encrypt(args.data.password),
            fecha_creacion: DateManager.Format(new Date(), "DD/MM/YYYY"),
            estado: EstadosUsuario.INACTIVO, // El usuario se crea inicialmente en estado inactivo
            image_public_id: "",
            token_confirmacion: "",
            pais: args.data.pais,
          };

          /** Se guarda imagen en el proveedor */
          if (AppImage.Validate(args.data.foto)) {

            const [err, data] = await this._imageDirector.Upload(args.data.foto, "s");

            if(err){ throw err;  }

            /** Agregamos la imagen */
            user.image_public_id = !IsNullOrEmpty(data?.url) ? data?.url : "" ;
          }

          /** Se guarda el usuario en la BD */
          const [err, data] = await this._usuariosRepository.create(user);

          if(err){ throw err; }


          return user;
          /** Se envía email de confirmación. */

        }
        catch (err: any) {
          throw err;
        }
      });

      return new ApplicationResponse<CreateUsuarios>(
        this._applicationContext.requestID,
        HttpStatusMessage.Created,
        result
      );
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.ERROR, "SignUp", err);

      if(err instanceof ApplicationException ){
        throw err;
      }

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
    try {
      this._logger.Activity("SignIn");

      // Por implementar
      return new ApplicationResponse(
        this._applicationContext.requestID,
        HttpStatusMessage.Accepted,
        true
      )
    }
    catch (err: any) {
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