import IHogaresSqlRepository from "../../Dominio/Repositories/IHogaresSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";




interface IHogaresRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad hogares */
export default class HogaresSqlRepository extends MssSqlGenericRepository<"hogares", "id_hogar"> implements IHogaresSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IHogaresRepositoryDependencies){
    super(deps.database, "hogares", "id_hogar");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "HogaresSqlRepository"
    });
  }

}