




/** Manager que se encarga de agregar los servicios de seguridad internos */
export default interface IInternalSecurityManager {


  /** Agrega los rate limiters al contenedor de dependencias */
  AddRateLimiters(): void;

}