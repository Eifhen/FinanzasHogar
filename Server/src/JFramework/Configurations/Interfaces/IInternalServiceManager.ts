


export default interface IInternalServiceManager {

  /** Agrega las estrategias del negocio */
  AddInternalStrategies(): Promise<void>;

  /** Se agregan los managers del negocio */
  AddInternalManagers(): Promise<void>;

  /** Se agregan los manejadores de excepciones */
  AddExceptionManager(): Promise<void>;

  /** Permite añadir los servicios de uso interno */
  AddInternalServices(): Promise<void>;

  /** Permite añadir los repositorios de uso interno al contenedor de dependencias */
  AddInternalRepositories() : Promise<void>;

  /** Permite añadir endpoints de uso interno */
  AddInternalEndpoints(): Promise<void>;

  /** Permite agregar una instancia del RateLimiter 
  * Middleware como singleton */
  AddInternalSecurity(): Promise<void>;

  /** Agregar y conectar los servicios que realizan conecciones */
  RunConnectionServices(): Promise<void>;

  /** Desconectar los servicios que realizan conecciones */
  DisconnectConnectionServices(): Promise<void>;


}