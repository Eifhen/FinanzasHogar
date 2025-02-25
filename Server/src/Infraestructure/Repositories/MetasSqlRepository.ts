import IMetasSqlRepository from "../../Dominio/Repositories/IMetasSqlRepository";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";



interface IMetasRepositoryDependencies {
  database: ApplicationSQLDatabase;
  applicationContext: ApplicationContext;
}

/** Repositorio para la entidad metas */
export default class MetasSqlRepository extends MssSqlGenericRepository<"metas", "id"> implements IMetasSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor(deps: IMetasRepositoryDependencies) {
    super(deps.database, "metas", "id", deps.applicationContext);

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "MetasSqlRepository",
      applicationContext: deps.applicationContext
    });
  }

}