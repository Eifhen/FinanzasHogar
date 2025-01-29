


/** Datos de configuración de cloudinary */
export interface ICloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  mainFolder: string;
  usersFolder: string;
  assetsFolder: string;
}


const providers = JSON.parse(process.env.IMAGE_PROVIDER ?? "");


/** Objeto que contiene los datos de configuración de cloudinary */
export const cloudinaryConfig:ICloudinaryConfig = providers.cloudinary;


/** Folders donde se guardan las imagenes */
export const ImageFolders = {

  /** Folder principal */
  mainFolder: cloudinaryConfig.mainFolder,

  /** Folder para guardar imagenes de usuario */
  usersFolder: cloudinaryConfig.usersFolder,

  /** Folder para guardar recursos de la app */
  assetsFolder: cloudinaryConfig.assetsFolder,
} as const;
