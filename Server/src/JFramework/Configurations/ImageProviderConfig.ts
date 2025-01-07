


/** Datos de configuración de cloudinary */
export interface ICloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}


const providers = JSON.parse(process.env.IMAGE_PROVIDER ?? "");

/** Objeto que contiene los datos de configuración de cloudinary */
export const cloudinaryConfig:ICloudinaryConfig = providers.cloudinary;