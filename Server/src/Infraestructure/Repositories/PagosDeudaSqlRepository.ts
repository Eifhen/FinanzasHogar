import IPagosDeudaSqlRepository from "../../Dominio/Repositories/IPagosDeudaSqlRepository";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";





interface IPagosDeudaRepositoryDependencies {
  database: ApplicationSQLDatabase;
  applicationContext: ApplicationContext;
}

/** Repositorio para la entidad pagos deuda */
export default class PagosDeudaSqlRepository extends MssSqlGenericRepository<"pagosDeuda", "id"> implements IPagosDeudaSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor(deps: IPagosDeudaRepositoryDependencies) {
    super(deps.database, "pagosDeuda", "id", deps.applicationContext);

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "PagosDeudaSqlRepository",
      applicationContext: deps.applicationContext
    });
  }

}
