



/** 
 * Representa a una clase de javascript, al utilizar esto se 
 * está indicando que el elemento es una clase 
 * que no ha sido instanciada 
 @example implementation: new (params?: any) => T
 @description
  Este tipo de definición indica un constructor que retorna una instancia de T. 
  Básicamente, estás diciendo que implementation es una función constructora que 
  puede ser invocada con el operador new para crear una nueva instancia de T.

  new (params?: any): Define una función constructora 
  que toma parámetros opcionales (params) de tipo any. 
  => T: Indica que el constructor retorna una instancia de T. 
  
  Ambas definiciones describen constructores (es decir, funciones que se pueden 
  invocar con el operador new para crear instancias), pero difieren en 
  la cantidad de argumentos que se esperan
*/
export type ClassConstructor<T = any> = 
  (new (params?: any) => ClassInstance<T>) | 
  {new (...args: any[]): ClassInstance<T>; } ;


/** Indica que T es una instancia de una clase y no un elemento callable */
export type ClassInstance<T> = T extends (...args: any[]) => any ? never : T;
