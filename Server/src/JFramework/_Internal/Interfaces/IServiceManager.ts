import { LifetimeType } from "awilix";
import { ClassConstructor, ClassInstance } from '../../Utils/Types/CommonTypes';
import { ApplicationMiddleware, ApplicationErrorMiddleware } from "../../Middlewares/Types/MiddlewareTypes";




export default interface IServiceManager {

  /** Agrega los controladores de la aplicacion */
  AddControllers(): void;

  /** Permite agregar un servicio al contenedor de dependencias */
  AddService<Class>(name: string, service: ClassConstructor<Class>, lifetime?: LifetimeType): void;
  AddService<Interface, Class extends Interface>(name: string, service: ClassConstructor<Class>, lifetime?: LifetimeType): void;

  /** Permite agregar una estrategia al contenedor de dependencias */
  AddStrategy<Director, Strategy>(name: string, director: ClassConstructor<Director>, strategyType: ClassConstructor<Strategy>): void;

  /** Permite agregar un manager que maneja sus propias estrategias 
   * Para esto el método inyecta el contenedor de dependencias directamente al manager */
  AddStrategyManager<Class>(name:string, manager: ClassConstructor<Class>) : void;

  /** Agrega un middleware a la aplicación */
  AddMiddleware(middleware: ClassConstructor<ApplicationMiddleware | ApplicationErrorMiddleware>): void;

  /** Agrega la instancia de un middleware directamente  */
  AddMiddlewareInstance(instance: ClassInstance<ApplicationMiddleware | ApplicationErrorMiddleware>): void;

  /** Permite configurar el contexto de la aplicación */
	AddAplicationContext() : void;
}