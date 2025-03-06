import { IApplicationPromise } from "../../Helpers/ApplicationPromise";
import { IConnectionService } from "../../Configurations/Types/IConnectionService";
import AppImage from "../../DTOs/AppImage";



/** Estrategia para manipulación de imágenes */
export default interface ICloudStoreStrategy extends IConnectionService {


  /** Permite setear la configuración inicial del store */
  Build() : void;

  /**  
   @param img {AppImage} - representa el objeto de imagen que se va a imprimir
   @param folderId {string} - la carpeta donde se debe guardar la imagen
   @returns - Retorna la URL de la imagen que fue cargada exitosamente
  */
  Upload(img: AppImage, collection: string) : IApplicationPromise<AppImage>;

  /** Método para obtener una determinada imagen, retorna la URL de la imagen deseada 
   * @param publicId {string} - El ID público de la imagen
   * @returns - La imagen solicitada 
  */
  Get(publicId: string) : IApplicationPromise<AppImage>;

  /** Método para eliminar una determinada imagen 
   * @param publicId {string} - El ID público de la imagen 
   * @returns - true si la imagen fue eliminada exitosamente 
  */
  Delete(publicId:string) : IApplicationPromise<boolean>;

}