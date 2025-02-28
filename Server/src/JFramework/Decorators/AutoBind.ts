
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ClassConstructor } from "../Utils/types/CommonTypes";

/** Decorador para hacer auto bind de todos los métodos de 
 * instancia (menos el constructor) */
export function AutoClassBinder<T extends ClassConstructor>(constructor: T) {
  /** Básicamente aquí estoy extendiendo el constructor de la clase original, 
   * para hacer el binding de todas las propiedades */
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args); 
      // Obtener todos los nombres de propiedades definidas en el prototipo de la clase
      const propertyNames = Object.getOwnPropertyNames(constructor.prototype);
      for (const key of propertyNames) {
        // Se ignora el constructor
        if (key === 'constructor') continue;
        // Obtener el descriptor de la propiedad; solo nos interesa si es un método (función)
        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);
        if (!descriptor || typeof descriptor.value !== 'function') continue;
        // Hacer bind del método a la instancia
        (this as any)[key] = (this as any)[key].bind(this);
      }
    }
  };
}


/**
 * Decorador que realiza el autobind de un método a la instancia.
 * Esto garantiza que, incluso cuando se extraiga el método de la instancia,
 * el contexto (this) se mantenga correctamente.
 *
 * Ejemplo de uso:
 * @example
 * class Persona {
 * 
 *   constructor(public nombre: string) {}
 * 
 *   -@AutoBind
 *   saludar() {
 *     console.log(`Hola, mi nombre es ${this.nombre}`);
 *   }
 * }
 * 
 * const p = new Persona("Juan");
 * const saludar = p.saludar;
 * saludar(); // Imprime: "Hola, mi nombre es Juan"
 */
export function AutoBind(target:any, propertyName: string, descriptor: PropertyDescriptor) : PropertyDescriptor {

  /** El parámetro descriptor contiene el PropertyDescriptor 
   *  del método decorado tal cual como fue definido.
   *  Método original, tal cual está en el Prototype */
  const originalMethod = descriptor.value;

  /** Creamos un nuevo descriptor que vincula el método a la 
   * instancia de la clase, de esa manera el método 
   * tendrá el contexto de ejecución de la instancia.  
   * al hacer esto el decorador crea un AccessorDescriptor que 
   * define un método get que controla el comportamiento cuando 
   * se obtiene el valor de la propiedad/método*/
  return {
    configurable: true,
    enumerable: descriptor.enumerable,
    get(){
      /** Si el método ya fue ligado en esta instancia lo devolvemos (cache)
       * Aquí 'this' es la instancia (cuando se accede al método) y se realiza el binding. 
       * Get contiene el contexto de ejecución, por 
       * lo tanto get contiene la instancia de la clase 
       * this = instancia de la clase */
      const bindedMethod = originalMethod.bind(this);

      /** Se cachea para que no se vincule cada vez. 
       * Al hacer esto volvemos a convertir a 
       * la propiedad en un DataDescriptor, esto hace 
       * que el nuevo valor de la propiedad sea el valor del 
       * método al que aplicamos el bind, en este punto la 
       * segunda vez que se llame al método de instancia ya 
       * no se estará ejecuntando el get ya que el get no existirá 
       * por lo tanto el binding del método solo se realizará una vez.
       * 
       * Cuando se ejecute get volvemos a cambiar el 
       * descriptor de la propiedad, para que ya no 
       * sea un AccesorDescriptor si no un DataDescriptor 
      */
      Object.defineProperty(this, propertyName, {
        value: bindedMethod, 
        configurable: true,
        writable: true
      });

      return bindedMethod;
    }
  }
}


