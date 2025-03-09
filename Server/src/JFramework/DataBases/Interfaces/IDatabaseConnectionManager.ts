import { IConnectionService } from "../../Configurations/Types/IConnectionService";






export default interface IDatabaseConnectionManager extends IConnectionService {

	/** Realiza la conección a la base de datos */
  Connect() : Promise<void>;

  /** Cierra la conección a la base de datos */
  Disconnect() : Promise<void>;

}