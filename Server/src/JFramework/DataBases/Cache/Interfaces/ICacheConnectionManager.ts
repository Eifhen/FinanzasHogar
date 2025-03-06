import { IConnectionService } from "../../../Configurations/Types/IConnectionService";



export default interface ICacheConnectionManager extends IConnectionService {


  /** Permite la coneccion con el cliente cache */
  Connect() : Promise<void>;

  /** Permite desconectar el cliente cache */
  Disconnect(): Promise<void>;
}