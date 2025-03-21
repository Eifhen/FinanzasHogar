import { CookieParseOptions } from "cookie-parser";
import { CorsOptions } from "cors";




export default interface IServerConfigurationManager {

  /** Agrega el middleware del contenedor de dependencias a la request en curso */
  AddContainer(): void;

  /** Método que maneja la respuesta JSON de la aplicación 
   * @param {string} limit - Limite del tamaño de la respuesta JSON
  */
  AddJsonResponseConfiguration(limit?: string): void;

  /** Método que maneja los Cors de la aplicación 
   * @param {CorsOptions} options - Opciones de configuración de cors
  */
  AddCorsConfiguration(options?: CorsOptions): void;

  /** Permite añadir la configuración de cookies
   * @param {CookieParseOptions} options - Opciones de configuración para el manejo de cookies
   */
  AddCookieConfiguration(options?: CookieParseOptions) : Promise<void>;

}