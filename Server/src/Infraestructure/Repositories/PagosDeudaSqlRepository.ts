import IPagosDeudaSqlRepository from "../../Dominio/Repositories/IPagosDeudaSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";





interface IPagosDeudaRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad pagos deuda */
export default class PagosDeudaSqlRepository extends MssSqlGenericRepository<"pagosDeuda", "id"> implements IPagosDeudaSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IPagosDeudaRepositoryDependencies){
    super(deps.database, "pagosDeuda", "id");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "PagosDeudaSqlRepository"
    });
  }

}
