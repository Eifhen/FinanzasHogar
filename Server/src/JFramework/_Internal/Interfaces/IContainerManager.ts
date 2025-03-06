import { AwilixContainer, LifetimeType } from "awilix";
import { ClassConstructor, ClassInstance, FactoryFunction } from '../../Utils/Types/CommonTypes';





export default interface IContainerManager {

  /** Permite identificar un contenedor */
  _identifier_:string;

  /** Permite resolver una dependencia según su nombre */
  Resolve<T>(serviceName: string): T;

  /** Método que permite resolver las dependencias de una clase y devolver 
   * una instancia con sus dependencias resueltas */
  ResolveClass<Class>(implementation:ClassConstructor<Class>) : ClassInstance<Class>;

  /** Método que permite resolver las dependencias de una función factory */
  ResolveFactory<Factory>(factory: FactoryFunction<Factory>) : Factory;

  /** Permite agregar una clase al contenedor de dependencias */
  AddClass<Class>(name: string, service: ClassConstructor<Class>, lifetime?: LifetimeType): void;
  AddClass<Interface, Class extends Interface>(name: string, service: ClassConstructor<Class>, lifetime?: LifetimeType): void;

  /** Sobrecarga 1: sin restricción adicional de tipo */
  AddInstance<Clase>(name: string, implementation: ClassInstance<Clase>): void;

  /** Sobrecarga 2: que impone qu Clase extienda de Interface */
  AddInstance<Interface, Clase extends Interface>(name: string, implementation: ClassInstance<Clase>): void;

  /** Sobrecarga 1: sin restricción adicional de tipo | Permite agregar un 
   * singleton al contenedor de dependencias según su clase*/
  AddSingleton<Class>(name: string, implementation: ClassConstructor<Class>): void;

  /** Sobrecarga 2: que impone que Clase extienda de Interface | Permite agregar 
   * un singleton al contenedor de dependencias según su clase e interfaz*/
  AddSingleton<Interface, Class extends Interface>(name: string, implementation: ClassConstructor<Class>): void;

  /** Permite agregar un valor como singleton al contenedor de dependencias */
  AddValue<ValueType>(name:string, valueObject:ValueType) : void;

  /** Obtiene el contenedor de dependencias */
  GetContainer() : AwilixContainer;

  /** Revisa si el registro indicado existe dentro 
	 * del contenedor de dependencias */
	CheckRegistration(name:string) : boolean

  /** Crea una instancia de ContainerManager usando un scope del contenedor */
  CreateScopedManager() : IContainerManager 

}