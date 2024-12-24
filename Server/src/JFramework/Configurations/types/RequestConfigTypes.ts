import { AwilixContainer } from "awilix";


/** 
  Este archivo modifica el objeto Request de express
  para agregarle propiedades adicionales
*/

declare global {
  namespace Express {
    interface Request {
      container: AwilixContainer;
      currentUser?: any;
      requestID: string;
    }
  }
}
