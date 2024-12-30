import IDeudasSqlRepository from "../../Dominio/Repositories/IDeudasSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";






interface IDeudasRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad deudas */
export default class DeudasSqlRepository extends MssSqlGenericRepository<"deudas", "id"> implements IDeudasSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IDeudasRepositoryDependencies){
    super(deps.database, "deudas", "id");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "DeudasSqlRepository"
    });
  }

}