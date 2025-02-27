import ApplicationContext from "../../Application/ApplicationContext";
import { IApplicationPromise } from "../../Application/ApplicationPromise";
import AppImage from "../../DTOs/AppImage";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { HttpStatusName, HttpStatusCode } from "../../Utils/HttpCodes";
import IApplicationImageStrategy from "./IApplicationImageStrategy";


interface ImageStrategyDirectorDependencies {
  strategy: IApplicationImageStrategy;
  applicationContext: ApplicationContext;
}
export default class ImageStrategyDirector {

  /** Representa la estrategia seleccionada */
  private readonly _imageStrategy: IApplicationImageStrategy;

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;

  constructor(deps: ImageStrategyDirectorDependencies) {
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.DIRECTOR,
      applicationContext: deps.applicationContext,
      entityName: "ImageStrategyDirector"
    });

    this._imageStrategy = deps.strategy;
    this._applicationContext = deps.applicationContext;

    /** Se connecta al proveedor de imágenes */
    this.Connect();
  }


  /** Realiza la connección con el proveedor de imagenes */
  public async Connect (): Promise<void> {
    try {
      this._logger.Activity("Connect");
      await this._imageStrategy.Connect();
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
  public async CloseConnection (): Promise<void> {
    try {
      this._logger.Activity("CloseConnection");
      await this._imageStrategy.CloseConnection();
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
   @returns - Retorna la imagen que fue cargada exitosamente */
  public async Upload (img: AppImage, collection: string): IApplicationPromise<AppImage> {
    try {
      this._logger.Activity("Upload");
      return await this._imageStrategy.Upload(img, collection);
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
  * @returns - La imagen solicitada */
  public async Get (publicId: string): IApplicationPromise<AppImage> {
    try {
      this._logger.Activity("Get");
      return await this._imageStrategy.Get(publicId);
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
  public async Delete (publicId:string): IApplicationPromise<boolean> {
    try {
      this._logger.Activity("Delete");
      return await this._imageStrategy.Delete(publicId);
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