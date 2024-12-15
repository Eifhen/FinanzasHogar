import { Kysely } from "kysely";
import { DataBase } from "../../Data/DataBase";


export default interface DataBaseConfig {

  /** Instancia  de la base de datos */
  instance: Kysely<DataBase>;

  /** Método que cierra una determinada conección */
  CloseDataBaseConnection(): Promise<void>;
}