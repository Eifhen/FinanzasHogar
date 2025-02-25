import IAhorrosSqlRepository from "../../Dominio/Repositories/IAhorrosSqlRepository";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";


interface IAhorrosRepositoryDependencies {
  database: ApplicationSQLDatabase;
  applicationContext: ApplicationContext;
}

/** Repositorio para la entidad ahorros */
export default class AhorrosSqlRepository extends MssSqlGenericRepository<"ahorros", "id"> implements IAhorrosSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IAhorrosRepositoryDependencies){
    super(deps.database, "ahorros", "id", deps.applicationContext);

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "AhorrosSqlRepository",
      applicationContext: deps.applicationContext
    });
  }

}