import { CreateUsuarios, UpdateUsuarios } from "../../Dominio/Entities/Usuarios";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import AppImage from "../../JFramework/Helpers/DTOs/AppImage";
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import { InternalServerException, NotFoundException, RecordAlreadyExistsException, ValidationException } from "../../JFramework/ErrorHandling/Exceptions";
import ApplicationArgs from "../../JFramework/Helpers/ApplicationArgs";
import { ApiResponse, ApplicationResponse } from "../../JFramework/Helpers/ApplicationResponse";
import { IEmailDataManager } from "../Email/Interfaces/IEmailDataManager";
import IEncrypterManager from "../../JFramework/Managers/Interfaces/IEncrypterManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import ITokenManager from "../../JFramework/Managers/Interfaces/ITokenManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { EmailVerificationData } from "../Email/Types/EmailDataManagerTypes";
import { EmailData } from "../../JFramework/Managers/Types/EmailManagerTypes";
import { EstadosUsuario } from "../../JFramework/Utils/estados";
import { HttpStatusMessage } from "../../JFramework/Utils/HttpCodes";
import IsNullOrEmpty from "../../JFramework/Utils/utils";
import SignInDTO from "../DTOs/SignInDTO";
import SignUpDTO from "../DTOs/SignUpDTO";
import IAuthenticationService from "./Interfaces/IAuthenticationService";
import { DataBase } from "../../Infraestructure/DataBase";
import ISqlTransactionManager from "../../JFramework/External/DataBases/Interfaces/ISqlTransactionManager";
import UserConfirmationDTO from "../DTOs/UserConfirmationDTO";
import IEmailManager from "../../JFramework/Managers/Interfaces/IEmailManager";
import ApplicationContext from "../../JFramework/Configurations/ApplicationContext";
import CloudStorageManager from "../../JFramework/External/CloudStorage/CloudStorageManager";

interface IAuthenticationServiceDependencies {
	usuariosRepository: IUsuariosSqlRepository;
	applicationContext: ApplicationContext;
	encrypterManager: IEncrypterManager;
	tokenManager: ITokenManager;
	cloudStorageManager: CloudStorageManager;
	emailManager: IEmailManager;
	emailDataManager: IEmailDataManager;
	sqlTransactionManager: ISqlTransactionManager<DataBase>;
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
	private readonly _transaction: ISqlTransactionManager<DataBase>;

	/** Manejador de imagenes */
	private readonly _cloudStorageManager: CloudStorageManager;

	/** Manejador de emails */
	private readonly _emailManager: IEmailManager;

	/** Manejador de data para email */
	private readonly _emailDataManager: IEmailDataManager;

	constructor(deps: IAuthenticationServiceDependencies) {
		this._logger = new LoggerManager({
			entityName: "AuthenticationService",
			entityCategory: LoggEntityCategorys.CONTROLLER,
			applicationContext: deps.applicationContext,
		});

		this._usuariosRepository = deps.usuariosRepository;
		this._applicationContext = deps.applicationContext;
		this._encrypterManager = deps.encrypterManager;
		this._tokenManager = deps.tokenManager;
		this._cloudStorageManager = deps.cloudStorageManager;
		this._emailManager = deps.emailManager;
		this._emailDataManager = deps.emailDataManager;
		this._transaction = deps.sqlTransactionManager;
	}

	/** Método que permite el registro del usuario */
	public async SignUp(args: ApplicationArgs<SignUpDTO>): ApiResponse<void> {
		try {
			this._logger.Activity("SignUp");

			// Validamos datos de entrada
			const signupValidation = SignUpDTO.Validate(args.data);
			if (!signupValidation.isValid) {
				throw new ValidationException("SignUp", signupValidation.errorData, this._applicationContext, __filename, signupValidation.innerError)
			}

			let uploadedImageId = "";

			/** Se inicia la transacción */
			const [transError] = await this._transaction.Start(async (builder, trans) => {

				/** Seteamos los repositorios */
				await builder.SetWorkingRepositorys(trans, [this._usuariosRepository]);

				/** Validamos y devolvemos los datos del usuario recibido */
				const user = await this.ValidateUserData(args.data);

				/** Valida y carga la imagen de usuario y retornamos el id de la imagen */
				uploadedImageId = await this.ValidateAndUploadImage(args.data, user);

				/** Se guarda el usuario en la BD */
				const [createErr] = await this._usuariosRepository.Create(user);
				if (createErr) throw createErr;

				/** Envia el email al usuario */
				await this.SendUserEmail(user);

			});

			/** Si ocurre un error en la transacción eliminamos la imagen */
			if (transError) {
				await this.DeleteUploadedImage(uploadedImageId);

				/** Relanzamos el error */
				throw transError;
			}

			return new ApplicationResponse(
				this._applicationContext,
				HttpStatusMessage.Created,
			);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "SignUp", err);
			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"SignUp",
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Valida la data del objeto recibido y devuelve un objeto `CreateUsuarios` */
	private async ValidateUserData(data: SignUpDTO): Promise<CreateUsuarios> {
		// Validar que no exista un usuario con ese email
		const [findUserError, findUser] = await this._usuariosRepository.Find("email", "=", data.email);

		/** Error al realizar la operación de buscar al usuario */
		if (findUserError) {
			throw new InternalServerException("ValidateUserData", findUserError.message, this._applicationContext, __filename);
		}

		/** Error si no encontramos al usuario */
		if (findUser) {
			throw new RecordAlreadyExistsException(
				"ValidateUserData",
				["email", findUser.email],
				this._applicationContext,
				__filename
			);
		}

		/** Se crea usuario  */
		const user: CreateUsuarios = {
			nombre: data.nombre,
			apellidos: data.apellidos,
			fecha_nacimiento: data.fechaNacimiento,
			sexo: data.sexo,
			email: data.email,
			password: await this._encrypterManager.Encrypt(data.password),
			fecha_creacion: new Date(),
			estado: EstadosUsuario.INACTIVO, // El usuario se crea inicialmente en estado inactivo
			image_public_id: "",
			token_confirmacion: await this._tokenManager.GenerateToken(),
			pais: data.pais,
		};

		return user;
	}

	/** Valida la data de la imagen recibida, si la misma es valida, 
	 * entonces se sube la imagen, retorna el id de la imagen guardada */
	private async ValidateAndUploadImage(data: SignUpDTO, user: CreateUsuarios): Promise<string> {
		/** Se guarda imagen en el proveedor */
		if (AppImage.Validate(data.foto).isValid) {

			/** Cargamos la imagen al proveedor */
			const [imageErr, imageData] = await this._cloudStorageManager.Upload(
				data.foto,
				this._applicationContext.settings.cloudProvider.currentProvider.data.usersFolder
			);

			if (imageErr) throw imageErr;

			/** Agregamos la imagen */
			user.image_public_id = imageData!.url;
			return imageData!.id!;
		}

		return "";
	}

	/** Elimina la imagen cargada */
	private async DeleteUploadedImage(imageId: string): Promise<void> {
		// Si ocurre un error en la transacción eliminamos la imagen
		if (!IsNullOrEmpty(imageId)) {
			const [deleteErr] = await this._cloudStorageManager.Delete(imageId);

			if (deleteErr) {
				throw deleteErr;
			}
		}
	}

	/** Envia el email al usuario */
	private async SendUserEmail(user: CreateUsuarios) {
		/** Se envía email de confirmación. */
		const data: EmailData<EmailVerificationData> = this._emailDataManager.GetVerificationEmailData(
			user.nombre,
			user.email,
			user.token_confirmacion ?? ""
		);

		const [emailErr] = await this._emailManager.SendEmail(data);
		if (emailErr) throw emailErr;
	}

	/** Permite Validar el token de confirmación de un usuario y marcar el usuario como activo */
	public async ValidateUserConfirmationToken(args: ApplicationArgs<UserConfirmationDTO>) : ApiResponse<void> {
		try {
			this._logger.Activity("ValidateUserConfirmationToken");
			
			/** Obtenemos el token del usuario */
			const token = args.data.token;
			const validate = UserConfirmationDTO.Validate(args.data);

			if(!validate.isValid){
				throw new ValidationException(
					"ValidateUserConfirmationToken", 
					validate.errorData, 
					this._applicationContext, 
					__filename, 
					validate.innerError
				);
			}

			const [errFind, find] = await this._usuariosRepository.Find("token_confirmacion", "=", token);

			/** Validamos si ocurre un error en la operación de búsqueda */
			if(errFind){
				throw new InternalServerException("ValidateUserConfirmationToken", errFind.message, this._applicationContext, __filename, errFind);
			}

			/** Validamos si el usuario fue encontrado o no */
			if(!find){
				throw new NotFoundException("ValidateUserConfirmationToken", [token], this._applicationContext, __filename);
			} 

			/** id del usuario */
			const id = find.id_usuario;

			/** Limpiamos el campo token confirmación */
			find.token_confirmacion = "";

			/** Marcamos al usuario como activo */
			find.estado = EstadosUsuario.ACTIVO;
		
			/** Removemos la propiedad id del objeto, para evitar actualizarla al momento de llamar update */
			delete find.id_usuario;

			/* Actualizamos el usuario */
			const [errUpdate] = await this._usuariosRepository.Update(id, find as UpdateUsuarios);

			/** Ha ocurridon un error al actualizar */
			if(errUpdate){
				throw new InternalServerException("ValidateUserConfirmationToken", errUpdate.message, this._applicationContext, __filename, errUpdate);
			}

			return new ApplicationResponse(
				this._applicationContext,
				HttpStatusMessage.Updated,
			);

		}
		catch(err:any){
			this._logger.Error(LoggerTypes.ERROR, "ValidateUserConfirmationToken", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"ValidateUserConfirmationToken",
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Método que permite el inicio de sesión del usuario */
	public async SignIn(args: ApplicationArgs<SignInDTO>): ApiResponse<boolean> {
		try {
			this._logger.Activity("SignIn");

			console.log("args =>", args);

			// Por implementar
			return new ApplicationResponse(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				true
			)
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "SignIn", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"SignIn",
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

}