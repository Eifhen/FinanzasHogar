import ApplicationArgs from "../../JFramework/Application/ApplicationArgs";
import { ApplicationResponse } from "../../JFramework/Application/ApplicationResponse";
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
import { EstadosUsuario } from "../../JFramework/Utils/estados";
import MssSqlTransactionBuilder from "../../Infraestructure/Repositories/Generic/MssSqlTransactionBuilder";
import ImageStrategyDirector from "../../JFramework/Strategies/Image/ImageStrategyDirector";
import { AppImage } from "../../JFramework/DTOs/AppImage";
import { BadRequestException, BaseException } from "../../JFramework/ErrorHandling/Exceptions";
import IEmailManager from "../../JFramework/Managers/Interfaces/IEmailManager";
import { EmailData } from "../../JFramework/Managers/Types/EmailManagerTypes";
import { IEmailDataManager } from "../../JFramework/Managers/Interfaces/IEmailDataManager";
import { EmailVerificationData } from "../../JFramework/Managers/Types/EmailDataManagerTypes";



interface IAuthenticationServiceDependencies {
  usuariosRepository: IUsuariosSqlRepository;
  applicationContext: ApplicationContext;
  encrypterManager: IEncrypterManager;
  tokenManager: ITokenManager;
  imageDirector: ImageStrategyDirector;
  emailManager: IEmailManager;
  emailDataManager: IEmailDataManager;
}


/** Servicio de Authenticación de usuario */
export default class AuthenticationService implements IAuthenticationService {


  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  /** Repositorio de usuarios */
  private readonly _usuariosRepository: IUsuariosSqlRepository;

  /** Manejador de tokens */
  private readonly _tokenManager: ITokenManager;

  /** Manejador de encryptado */
  private readonly _encrypterManager: IEncrypterManager;

  /** Manejador de transacciones */
  private readonly _transaction: MssSqlTransactionBuilder;

  /** Manejador de imagenes */
  private readonly _imageDirector: ImageStrategyDirector;

  /** Manejador de emails */
  private readonly _emailManager: IEmailManager;

  /** Manejador de data para email */
  private readonly _emailDataManager: IEmailDataManager;

  constructor(deps: IAuthenticationServiceDependencies) {
    this._usuariosRepository = deps.usuariosRepository;
    this._applicationContext = deps.applicationContext;
    this._encrypterManager = deps.encrypterManager;
    this._tokenManager = deps.tokenManager;
    this._imageDirector = deps.imageDirector;
    this._emailManager = deps.emailManager;
    this._emailDataManager = deps.emailDataManager;

    this._logger = new LoggerManager({
      entityName: "AuthenticationService",
      entityCategory: LoggEntityCategorys.CONTROLLER,
      applicationContext: this._applicationContext,
    });

    this._transaction = new MssSqlTransactionBuilder(
      this._applicationContext, 
      [ 
        this._usuariosRepository 
      ]
    );
  }

  /** Método que permite el registro del usuario */
  public SignUp = async (args: ApplicationArgs<SignUpDTO.Type>): Promise<ApplicationResponse<CreateUsuarios>> => {
    try {
      this._logger.Activity("SignUp");

      const signupValidation = SignUpDTO.Validate(args.data);

      // si el objeto ingresado es invalido
      if (!signupValidation.isValid) {
        throw new BadRequestException(signupValidation.error, this._applicationContext, __filename);
      }

      const result = await this._transaction.Start<CreateUsuarios>(async () => {
        /** Se crea usuario  */
        const user: CreateUsuarios = {
          nombre: args.data.nombre,
          apellidos: args.data.apellidos,
          fecha_nacimiento: args.data.fechaNacimiento,
          sexo: args.data.sexo,
          email: args.data.email,
          password: await this._encrypterManager.Encrypt(args.data.password),
          fecha_creacion: new Date(),
          estado: EstadosUsuario.INACTIVO, // El usuario se crea inicialmente en estado inactivo
          image_public_id: "",
          token_confirmacion: "",
          pais: args.data.pais,
        };

        /** Se guarda imagen en el proveedor */
        if (AppImage.Validate(args.data.foto).isValid) {

          const [err, data] = await this._imageDirector.Upload(
            args.data.foto, 
            this._applicationContext.settings.fileProvider.currentProvider.data.usersFolder
          );
          
          if(err) throw err;  

          /** Agregamos la imagen */
          user.image_public_id = !IsNullOrEmpty(data?.url) ? data?.url : "" ;
        }

        /** Se guarda el usuario en la BD */
        const [createErr, createdUser] = await this._usuariosRepository.create(user);
        if(createErr) throw createErr; 
        
        /** Se envía email de confirmación. */
        const data:EmailData<EmailVerificationData> = this._emailDataManager.GetVerificationEmailData(user.nombre, user.email, "#");
        const [emailErr] = await this._emailManager.SendEmail(data);
        if(emailErr) throw emailErr;

        return user;
        
      });

      return new ApplicationResponse<CreateUsuarios>(
        this._applicationContext.requestID,
        HttpStatusMessage.Created,
        result
      );
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.ERROR, "SignUp", err);

      throw new BaseException(
        "SignUp", 
        err.message, 
        this._applicationContext, 
        __filename, 
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

      throw new BaseException(
        "SignIn", 
        err.message, 
        this._applicationContext, 
        __filename, 
        err
      );
    }
  }

}