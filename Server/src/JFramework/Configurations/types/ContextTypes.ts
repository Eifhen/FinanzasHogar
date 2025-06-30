import IContainerManager from "../Interfaces/IContainerManager";


/** Contexto de la request en curso */
export interface RequestContext {
  /** Id de la request en curso */
  requestId: string;

  /** Contiene el lenguaje disponible en la aplicación  (esto nos llega en la request)*/
  lang: string;

  /** Ip del request en curso */
  ipAddress:string;
}

/** Contexto del servidor */
export interface ServerContext {
  /** Contenedor root */
  rootContainer: IContainerManager | null;
}