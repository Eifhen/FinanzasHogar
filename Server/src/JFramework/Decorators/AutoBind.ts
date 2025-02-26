



// Decorador para hacer auto bind de todos los métodos de instancia (menos el constructor)
export function AutoBind<T extends { new (...args: any[]): {} }>(constructor: T) {
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
