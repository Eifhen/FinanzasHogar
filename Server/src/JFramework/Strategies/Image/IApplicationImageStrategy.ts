import { ImageFolders } from './../../Configurations/ImageProviderConfig';
import { IApplicationPromise } from "../../Application/ApplicationPromise";
import { AppImage } from "../../DTOs/AppImage";








/** Estrategia para manipulación de imágenes */
export default interface IApplicationImageStrategy {


  /** Representa al método que realiza la connección con el proveedor de imágenes */
  Connect: () => Promise<void>;

  /** Método que permite cerrar la connección con el proveedor de imágenes */
  CloseConnection: () => Promise<void>;

  /**  
   @param img {AppImage.Type} - representa el objeto de imagen que se va a imprimir
   @param folderId {string} - la carpeta donde se debe guardar la imagen
   @returns - Retorna la URL de la imagen que fue cargada exitosamente
  */
  Upload: (img: AppImage.Type, collection: string) => IApplicationPromise<AppImage.Type>;

  /** Método para obtener una determinada imagen, retorna la URL de la imagen deseada 
   * @param publicId {string} - El ID público de la imagen
   * @returns - La imagen solicitada 
  */
  Get: (publicId: string) => IApplicationPromise<AppImage.Type>;

  /** Método para eliminar una determinada imagen 
   * @param publicId {string} - El ID público de la imagen 
   * @returns - true si la imagen fue eliminada exitosamente 
  */
  Delete: (publicId:string) => IApplicationPromise<boolean>;

}