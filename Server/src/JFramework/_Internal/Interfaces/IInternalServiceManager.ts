


export default interface IInternalServiceManager {

  /** Agrega las estrategias del negocio */
  AddInternalStrategies(): Promise<void>;

  /** Se agregan los managers del negocio */
  AddInternalManagers(): Promise<void>;

  /** Se agregan los manejadores de excepciones */
  AddExceptionManager(): Promise<void>;

  /** Agregar y conectar los servicios que realizan conecciones */
  RunConnectionServices(): Promise<void>;

  /** Desconectar los servicios que realizan conecciones */
  DisconnectConnectionServices() : Promise<void>;

}