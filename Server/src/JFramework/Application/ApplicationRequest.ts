

import { Request } from "express";



/** Función que extiende el funcionamiento de la clase Request de express */
export default class ApplicationRequest extends Request {

  /** Id del request en curso */
  requestID: string = "";

}