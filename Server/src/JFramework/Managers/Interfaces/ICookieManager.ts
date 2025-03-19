import { Response } from "express";
import { CustomCookieOptions } from "../Types/CustomCookieOptions";





/** Interfaz que permite crear cookies */
export default interface ICookieManager {


  /** Permite crear una cookie y agregarla a la respuesta */
  Create(res: Response, name: string, value: string, options: CustomCookieOptions) : void;

  /** Permite eliminar una cookie de la respuesta */
  Delete(res: Response, name: string) : void;

}