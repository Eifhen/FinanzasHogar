import { Request, Query } from 'express-serve-static-core'
import IContainerManager from '../_Internal/types/IContainerManager';


/** Función que extiende el funcionamiento de la clase Request de express */
export default interface ApplicationRequest<TBody = any, TQuery extends Query = Query> extends Request {

  /** Id del request en curso */
  requestID: string;

  /** Query args */
  query: TQuery;

  /** Body Type */
  body: TBody;

  /** Manejador del contenedor */
  containerManager: IContainerManager;
}
