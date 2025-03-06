import { CorsOptions } from "cors";





export default interface IServerConfiguration {

  /** Agrega el middleware del contenedor de dependencias a la request en curso */
  AddContainer(): void;

  /** Permite agregar una instancia del RateLimiter 
  * Middleware como singleton */
  AddRateLimiters(): void;

  /** Método que maneja la respuesta JSON de la aplicación */
  AddJsonResponseConfiguration(limit?: string): void;

  /** Método que maneja los Cors de la aplicación */
  AddCorsConfiguration(options?: CorsOptions): void;
}