import { IApplicationPromise } from "../../Application/ApplicationPromise";
import { AppImage } from "../../DTOs/AppImage";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { NO_REQUEST_ID } from "../../Utils/const";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import IApplicationImageStrategy from "./IApplicationImageStrategy";


export default class ImageStrategyDirector {

  /** Representa la estrategia seleccionada */
  private _imageStrategy: IApplicationImageStrategy;

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor(strategy: IApplicationImageStrategy) {
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.DIRECTOR,
      entityName: "ImageStrategyDirector"
    });

    this._imageStrategy = strategy;

    /** Se connecta al proveedor de imágenes */
    this.Connect();
  }


  /** Realiza la connección con el proveedor de imagenes */
  public Connect = async (): Promise<void> => {
    try {
      this._logger.Activity("Connect");
      await this._imageStrategy.Connect();
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Connect");
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

  /** Cierra la connección con el proveedor de imagenes */
  public CloseConnection = async (): Promise<void> => {
    try {
      this._logger.Activity("CloseConnection");
      await this._imageStrategy.CloseConnection();
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "CloseConnection");
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

  /**  
   @param img {AppImage.Type} - representa el objeto de imagen que se va a imprimir
   @param folderId {string} - la carpeta donde se debe guardar la imagen
   @returns - Retorna la imagen que fue cargada exitosamente */
  public Upload = async (img: AppImage.Type, collection: string): IApplicationPromise<AppImage.Type> => {
    try {
      this._logger.Activity("Upload");
      return await this._imageStrategy.Upload(img, collection);
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Upload");
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  };


  /** 
  * Método para obtener una determinada imagen, retorna la URL de la imagen deseada 
  * @param publicId {string} - El ID público de la imagen
  * @returns - La imagen solicitada */
  public Get = async (publicId: string): IApplicationPromise<AppImage.Type> => {
    try {
      this._logger.Activity("Get");
      return await this._imageStrategy.Get(publicId);
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Get");
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  };

  /** Método para eliminar una determinada imagen 
   * @param publicId {string} - El ID público de la imagen 
   * @returns - true si la imagen fue eliminada exitosamente 
  */
  public Delete = async (publicId:string): IApplicationPromise<boolean> => {
    try {
      this._logger.Activity("Delete");
      return await this._imageStrategy.Delete(publicId);
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Delete");
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  };

}