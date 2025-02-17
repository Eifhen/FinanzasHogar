import ApplicationContext from "../../Application/ApplicationContext";
import { ApplicationPromise, IApplicationPromise } from "../../Application/ApplicationPromise";
import IConfigurationSettings from "../../Configurations/types/IConfigurationSettings";
import AppImage from "../../DTOs/AppImage";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import IApplicationImageStrategy from "./IApplicationImageStrategy";
import { v2 as cloudinary } from 'cloudinary';


interface CloudinaryImageStrategyDependencies {
  applicationContext: ApplicationContext;
}

export class CloudinaryImageStrategy implements IApplicationImageStrategy {


  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Representa el objeto de configuración de cloudinary */
  private readonly settings: IConfigurationSettings;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  constructor(deps: CloudinaryImageStrategyDependencies) {
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.STRATEGY,
      applicationContext: deps.applicationContext,
      entityName: "CloudinaryImageStrategy"
    });

    this._applicationContext = deps.applicationContext;
    this.settings = this._applicationContext.settings;
  }

  /** Realiza la connección con cloudinary */
  public Connect = async (): Promise<void> => {
    try {
      this._logger.Activity("Connect");
      cloudinary.config(this.settings.fileProvider.currentProvider.data);
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Connect");
      throw new ApplicationException(
        "Connect",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  }

  /** Cierra la connección con el proveedor de imagenes */
  public CloseConnection = async (): Promise<void> => {
    try {
      this._logger.Activity("CloseConnection");
      throw new Error("No Implementado")
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "CloseConnection");
      throw new ApplicationException(
        "CloseConnection",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  }

  /**  
   @param img {AppImage.Type} - representa el objeto de imagen que se va a imprimir
   @param folderId {string} - la carpeta donde se debe guardar la imagen
   @returns - Retorna la imagen que fue cargada exitosamente 
  */
  public Upload = async (img: AppImage, folderId: string): IApplicationPromise<AppImage> => {
    try {
      this._logger.Activity("Upload");
      return ApplicationPromise.Try(new Promise<AppImage>((resolve, reject) => {
        cloudinary.uploader.upload(
          img.base64,
          {
            folder: `${this.settings.fileProvider.currentProvider.data.mainFolder}/${folderId}`
          },
          (error, result) => {
            return error ? reject(error) : resolve({
              id: result?.public_id ?? "",
              url: result?.secure_url ?? "",
              nombre: result?.public_id ?? "",
              extension: img.extension,
              base64: "",
              fecha: img.fecha
            } as AppImage);
          }
        );
      }));
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Upload");
      throw new ApplicationException(
        "Upload",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  };

  /** 
   * Método para obtener una determinada imagen, retorna la URL de la imagen deseada 
   * @param publicId {string} - El ID público de la imagen
   * @returns - La imagen solicitada 
  */
  public Get = async (publicId: string): IApplicationPromise<AppImage> => {
    try {
      this._logger.Activity("Get");

      return ApplicationPromise.Try(new Promise<AppImage>((resolve, reject) => {
        cloudinary.api.resource(
          publicId,
          (error, result) => {
            return error ? reject(error) : resolve({
              id: result?.public_id ?? "",
              url: result?.secure_url ?? "",
              nombre: result?.public_id ?? "",
              extension: result?.format,
              base64: "",
              fecha: new Date(result.created_at)
            } as AppImage);
          }
        )
      }));
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Get");
      throw new ApplicationException(
        "Get",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  };

  /** Método para eliminar una determinada imagen
 * @param publicId {string} - El ID público de la imagen
 * @returns - true si la imagen fue eliminada exitosamente
 */
  public Delete = async (publicId: string): IApplicationPromise<boolean> => {
    try {
      this._logger.Activity("Delete");

      return ApplicationPromise.Try(new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          publicId,
          (error, result) => {
            if (error) {
              return reject(error);
            } else if (result.result === "ok") {
              return resolve(true);
            } else {
              return reject(result);
            }
          }
        );
      }));
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Delete");
      throw new ApplicationException(
        "Delete",
        HttpStatusName.InternalServerError,
        err.message,
        HttpStatusCode.InternalServerError,
        this._applicationContext.requestID,
        __filename,
        err
      );
    }
  };

}