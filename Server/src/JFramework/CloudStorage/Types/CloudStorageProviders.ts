



/** Tipos de bases de datos contemplados por el sistema */
export const CloudStorageProviders = {

	/** Proveedor de almacenamiento */
	cloudinary: "cloudinary",

} as const;

export type CloudStorageProviders = keyof typeof CloudStorageProviders;