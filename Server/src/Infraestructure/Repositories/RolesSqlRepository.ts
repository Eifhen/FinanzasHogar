import IRolesSqlRepository from "../../Dominio/Repositories/IRolesSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";



interface IRolesRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad roles */
export default class RolesSqlRepository extends MssSqlGenericRepository<"roles", "id_rol"> implements IRolesSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IRolesRepositoryDependencies){
    super(deps.database, "roles", "id_rol");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "RolesSqlRepository"
    });
  }

}
