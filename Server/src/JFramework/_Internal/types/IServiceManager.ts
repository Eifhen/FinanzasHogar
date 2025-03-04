import { LifetimeType } from "awilix";
import { ClassConstructor, ClassInstance } from "../../Utils/types/CommonTypes";
import { ApplicationMiddleware, ApplicationErrorMiddleware } from "../../Middlewares/types/MiddlewareTypes";




export default interface IServiceManager {

  /** Agrega el middleware del contenedor de dependencias a la request en curso */
  AddContainer(): void;

  /** Agrega los controladores de la aplicacion */
  AddControllers(): void;

  /** Permite agregar un servicio al contenedor de dependencias */
  AddService<Class>(name: string, service: ClassConstructor<Class>, lifetime?: LifetimeType): void;
  AddService<Interface, Class extends Interface>(name: string, service: ClassConstructor<Class>, lifetime?: LifetimeType): void;

  /** Permite agregar una estrategia al contenedor de dependencias */
  AddStrategy<Director, Strategy>(name: string, director: ClassConstructor<Director>, strategyType: ClassConstructor<Strategy>): void;

  /** Agrega un middleware a la aplicación */
  AddMiddleware(middleware: ClassConstructor<ApplicationMiddleware | ApplicationErrorMiddleware>): void;

  /** Agrega la instancia de un middleware directamente  */
  AddMiddlewareInstance(instance: ClassInstance<ApplicationMiddleware | ApplicationErrorMiddleware>): void;

  /** Se conecta al servidor de caché y agrega un singleton 
  * con dicha conección al contenedor de dependencias*/
  AddCacheClient(): void;

  /** Permite agregar una instancia del RateLimiter 
   * Middleware como singleton */
  AddRateLimiters(): void;

  /** Permite configurar el contexto de la aplicación */
	AddAplicationContext() : void;
}