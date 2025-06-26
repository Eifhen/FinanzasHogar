/** Representa el length de un array vacio*/
export const ARRAY_LENGTH_EMPTY = 0;

/** Repreesnta el indice inicial de un array */
export const ARRAY_START_INDEX = 0;

/** Representa el valor por defecto de un indice negativo */
export const ARRAY_INDEX_NEGATIVE = -1;

/** Indica el puerto por defecto de la aplicación */
export const DEFAULT_PORT: number = 5000;

/** Versión del api por default */
export const DEFAULT_API_VERSION:number = 1;

/** Tiempo default de espera de la database  */
export const DEFAULT_DATABASE_TIMEOUT:number = 3000;

/** Límite por defecto del tamaño de la respuesta json */
export const DEFAULT_JSON_RESPONSE_LIMIT:string = "10mb";

/** Define la indentación por defecto */
export const DEFAULT_INDENT = 2;

/** Representa el valor default de un numero */
export const DEFAULT_NUMBER = 0;

/** Representa la longitud del secreto que necesita el cifrado AES_256 */
export const AES_256_SECRET_LENGTH = 32;

/** Representa la longitud del tamaño del IV para encriptación */
export const AES_256_IV_LENGTH = 16;

/** Representa la longitud de los tokens en la app */
export const DEFAULT_TOKEN_LENGTH = 32;

/** Tamaño por defecto del connection pool */
export const DEFAULT_CONNECTION_POOL_SIZE = 10;

/** Nombre de la base da datos de uso interno en el contenedor de dependencias */
export const INTERNAL_DATABASE_INSTANCE_NAME = "internalDatabase";

/** Nombre de la base de datos de uso interno en el registro de instancias del DatabaseInstanceManager */
export const INTERNAL_DATABASE_REGISTRY_NAME = "internal_db";

/** Nombre de la base da datos de uso del negocio en el contenedor de dependencias */
export const BUSINESS_DATABASE_INSTANCE_NAME = "database";

/** Nombre de la base de datos de uso del negocio en el registro de instancias del DatabaseInstanceManager */
export const BUSINESS_DATABASE_REGISTRY_NAME = "business_no_tenant_db";

/** Texto a desplegar cuando queremos mandar algo en lugar de un request ID */
export const NO_REQUEST_ID: string = "NO_REQUEST_ID";

/** Identificador del contenedor de dependencias root */
export const ROOT_CONTAINER_KEY = "ROOT_CONTAINER";