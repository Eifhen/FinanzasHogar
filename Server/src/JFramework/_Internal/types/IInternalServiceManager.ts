


export default interface IInternalServiceManager {

  /** Agrega las estrategias del negocio */
  AddInternalStrategies(): Promise<void>;

  /** Se agregan los managers del negocio */
  AddInternalManagers(): Promise<void>;

  /** Se agregan los manejadores de excepciones */
  AddExceptionManager(): Promise<void>;
}