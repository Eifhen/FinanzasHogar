import ICategoriasSqlRepository from "../../Dominio/Repositories/ICategoriasSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";








interface ICategoriasRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad categorias */
export default class CategoriasSqlRepository extends MssSqlGenericRepository<"categorias", "id_categoria"> implements ICategoriasSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: ICategoriasRepositoryDependencies){
    super(deps.database, "categorias", "id_categoria");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "CategoriasSqlRepository"
    });
  }

}