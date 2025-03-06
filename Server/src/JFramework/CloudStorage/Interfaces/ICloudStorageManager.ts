import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import { IConnectionService } from "../../Configurations/Types/IConnectionService";
import AppImage from "../../DTOs/AppImage";






/** En principio los métodos están definidos para trabajar solo con imagenes,
 * pero la idea es que permita trabajar tanto imagenes como documentos */
export default interface ICloudStorageManager extends IConnectionService {

  /** Permite establecer la configuración inicial del storage */
  Build() : void;

  /**
  @param img { AppImage.Type } - representa el objeto de imagen que se va a imprimir
  @param folderId { string } - la carpeta donde se debe guardar la imagen
  @returns - Retorna la imagen que fue cargada exitosamente */
  Upload(file: AppImage, collection: string): IApplicationPromise<AppImage>;

  /** 
  * Método para obtener una determinada imagen, retorna la URL de la imagen deseada 
  * @param publicId {string} - El ID público de la imagen
  * @returns - La imagen solicitada */
  Get(publicId: string): IApplicationPromise<AppImage>;

  /** Método para eliminar una determinada imagen 
 * @param publicId {string} - El ID público de la imagen 
 * @returns - true si la imagen fue eliminada exitosamente */
  Delete(publicId: string): IApplicationPromise<boolean>

}