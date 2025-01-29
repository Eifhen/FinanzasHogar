import { ApplicationImages } from "../../Configurations/AppImagesConfig";
import { EmailProviderConfig, IEmailProvider } from "../../Configurations/EmailProviderConfig";
import { ApplicationLenguage } from "./types";




/** Contiene datos importantes de la aplicación */
export interface IApplicationData {

  /** Imagenes por defecto de la aplicación */
  images: ApplicationImages;

  /** Contiene el lenguaje disponible en la aplicación */
  lang: ApplicationLenguage;

  /** Proveedor de email */
  emailProvider: IEmailProvider
}