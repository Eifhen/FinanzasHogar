
import ApplicationContext from "../../Configurations/ApplicationContext";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import AppImage from "../../Helpers/DTOs/AppImage";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import ICloudStorageManager from "./Interfaces/ICloudStorageManager";
import ICloudStoreStrategy from "./Interfaces/ICloudStoreStrategy";
import { CloudinaryStorageStrategy } from "./Strategies/CloudinaryStorageStrategy";
import { CloudStorageProviders } from "./Types/CloudStorageProviders";



interface CloudStorageDependencies {
	applicationContext: ApplicationContext;
	containerManager: IContainerManager;
	// configurationSettings: ConfigurationSettings;
}

export default class CloudStorageManager implements ICloudStorageManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Contenedor de dependencias*/
	private readonly _containerManager: IContainerManager;

	/** Objeto de configuraciones */
	// private _configurationSettings: ConfigurationSettings;

	/** Estrategia de almacenamiento */
	private _strategy?: ICloudStoreStrategy;

	constructor(deps: CloudStorageDependencies) {

		this._applicationContext = deps.applicationContext;
		this._containerManager = deps.containerManager;
		// this._configurationSettings = deps.configurationSettings;

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			applicationContext: deps.applicationContext,
			entityName: "CloudStorageManager",
		});

		this.SetCloudStrategy();
	}

	/** Permite setear la estrategia de cloud */
	private SetCloudStrategy(): void {
		this._logger.Activity("SetCloudStrategy");

		/** Ejecutamos una estrategía de conección según 
		 * el proveedor especificado en la configuración */
		switch (this._applicationContext.settings.cloudProvider.currentProvider.name) {
			case CloudStorageProviders.cloudinary:
				this._strategy = this._containerManager.ResolveClass(CloudinaryStorageStrategy);
				break;
			default:
				throw new Error("Estrategía de conección No implementada");
		}

		/** Aplicamos la configuración del storage */
		this.Build();
	}

	/** Permite conectarse al proveedor de almacenamiento */
	public async Connect(): Promise<void> {
		try {
			this._logger.Activity("Connect");
			if (this._strategy) {
				await this._strategy.Connect();
			}
			else {
				throw new ApplicationException(
					"Connect",
					HttpStatusName.CloudStorageNoInstanceException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Connect", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Connect",
				HttpStatusName.CloudStorageConnectionException,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestContext.requestId,
				__filename,
				err
			);
		}
	}

	/** Permite desconectarse del proveedor de almacenamiento */
	public async Disconnect(): Promise<void> {
		try {
			this._logger.Activity("Disconnect");
			if (this._strategy) {
				await this._strategy.Disconnect();
			}
			else {
				throw new ApplicationException(
					"Disconnect",
					HttpStatusName.CloudStorageNoInstanceException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Disconnect", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Disconnect",
				HttpStatusName.CloudStorageDisconnectException,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestContext.requestId,
				__filename,
				err
			);
		}
	}

	/** Permite conectarse al proveedor de almacenamiento */
	public Build(): void {
		try {
			this._logger.Activity("Build");
			if (this._strategy) {
				this._strategy.Build();
			}
			else {
				throw new ApplicationException(
					"Build",
					HttpStatusName.CloudStorageNoInstanceException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Build", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Build",
				HttpStatusName.CloudStorageConnectionException,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestContext.requestId,
				__filename,
				err
			);
		}
	}

	/** Permite cargar archivos */
	public async Upload(file: AppImage, collection: string): IApplicationPromise<AppImage> {
		try {
			this._logger.Activity("Upload");
			if (this._strategy) {
				return await this._strategy.Upload(file, collection);
			}
			else {
				throw new ApplicationException(
					"Upload",
					HttpStatusName.CloudStorageNoInstanceException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Upload", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Upload",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestContext.requestId,
				__filename,
				err
			);
		}
	}

	/** Permite obtener archivos segun su id publica */
	public async Get(publicId: string): IApplicationPromise<AppImage> {
		try {
			this._logger.Activity("Get");
			if (this._strategy) {
				return await this._strategy.Get(publicId);
			}
			else {
				throw new ApplicationException(
					"Get",
					HttpStatusName.CloudStorageNoInstanceException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Get", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Get",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestContext.requestId,
				__filename,
				err
			);
		}
	}

	/** Permite eliminar archivos */
	public async Delete(publicId: string): IApplicationPromise<boolean> {
		try {
			this._logger.Activity("Delete");
			if (this._strategy) {
				return await this._strategy.Delete(publicId);
			}
			else {
				throw new ApplicationException(
					"Delete",
					HttpStatusName.CloudStorageNoInstanceException,
					"La estrategía de conección no está definida",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Delete", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"Delete",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				this._applicationContext.requestContext.requestId,
				__filename,
				err
			);
		}
	}

}