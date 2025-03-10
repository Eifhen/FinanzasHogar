import { CreateUsuarios } from "../../Dominio/Entities/Usuarios";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import SqlTransactionStrategy from "../../JFramework/DataBases/Generic/SqlTransactionStrategy";
import CloudStorageManager from "../../JFramework/CloudStorage/CloudStorageManager";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import AppImage from "../../JFramework/DTOs/AppImage";
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import { BadRequestException, InternalServerException, RecordAlreadyExistsException } from "../../JFramework/ErrorHandling/Exceptions";
import ApplicationArgs from "../../JFramework/Helpers/ApplicationArgs";
import { ApplicationResponse } from "../../JFramework/Helpers/ApplicationResponse";
import { IEmailDataManager } from "../../JFramework/Managers/Interfaces/IEmailDataManager";
import IEmailManager from "../../JFramework/Managers/Interfaces/IEmailManager";
import IEncrypterManager from "../../JFramework/Managers/Interfaces/IEncrypterManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import ITokenManager from "../../JFramework/Managers/Interfaces/ITokenManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { EmailVerificationData } from "../../JFramework/Managers/Types/EmailDataManagerTypes";
import { EmailData } from "../../JFramework/Managers/Types/EmailManagerTypes";
import { EstadosUsuario } from "../../JFramework/Utils/estados";
import { HttpStatusMessage } from "../../JFramework/Utils/HttpCodes";
import IsNullOrEmpty from "../../JFramework/Utils/utils";
import SignInDTO from "../DTOs/SignInDTO";
import SignUpDTO from "../DTOs/SignUpDTO";
import IAuthenticationService from "./Interfaces/IAuthenticationService";


interface IAuthenticationServiceDependencies {
	usuariosRepository: IUsuariosSqlRepository;
	applicationContext: ApplicationContext;
	encrypterManager: IEncrypterManager;
	tokenManager: ITokenManager;
	cloudStorageManager: CloudStorageManager;
	emailManager: IEmailManager;
	emailDataManager: IEmailDataManager;
	sqlTransactionManager: SqlTransactionStrategy;
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
	private readonly _transaction: SqlTransactionStrategy;

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
	public SignUp = async (args: ApplicationArgs<SignUpDTO>): Promise<ApplicationResponse<void>> => {
		try {
			this._logger.Activity("SignUp");

			// Validamos datos de entrada
			const signupValidation = SignUpDTO.Validate(args.data);
			if (!signupValidation.isValid) {
				throw new BadRequestException("SignUp", signupValidation.error, this._applicationContext, __filename);
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
	private ValidateUserData = async (data: SignUpDTO): Promise<CreateUsuarios> => {
		// Validar que no exista un usuario con ese email
		const [findUserError, findUser] = await this._usuariosRepository.Find("email", "=", data.email);

		if (findUserError) {
			throw new InternalServerException("ValidateUserData", findUserError.message, this._applicationContext, __filename);
		}

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
	private ValidateAndUploadImage = async (data: SignUpDTO, user: CreateUsuarios): Promise<string> => {
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
	private DeleteUploadedImage = async (imageId: string): Promise<void> => {
		// Si ocurre un error en la transacción eliminamos la imagen
		if (!IsNullOrEmpty(imageId)) {
			const [deleteErr] = await this._cloudStorageManager.Delete(imageId);

			if (deleteErr) {
				throw deleteErr;
			}
		}
	}

	/** Envia el email al usuario */
	private SendUserEmail = async (user: CreateUsuarios) => {
		/** Se envía email de confirmación. */
		const data: EmailData<EmailVerificationData> = this._emailDataManager.GetVerificationEmailData(
			user.nombre,
			user.email,
			user.token_confirmacion ?? ""
		);

		const [emailErr] = await this._emailManager.SendEmail(data);
		if (emailErr) throw emailErr;
	}

	/** Método que permite el inicio de sesión del usuario */
	public SignIn = async (args: ApplicationArgs<SignInDTO>): Promise<ApplicationResponse<boolean>> => {
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