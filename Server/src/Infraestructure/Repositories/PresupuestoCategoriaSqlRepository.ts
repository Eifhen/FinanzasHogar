import IPresupuestoCategoriaSqlRepository from "../../Dominio/Repositories/IPresupuestoCategoriaSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";





interface IPresupuestoCategoriaRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad presupuesto categoria */
export default class PresupuestoCategoriaSqlRepository extends MssSqlGenericRepository<"presupuestoCategoria", "id"> implements IPresupuestoCategoriaSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IPresupuestoCategoriaRepositoryDependencies){
    super(deps.database, "presupuestoCategoria", "id");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "PresupuestoCategoriaSqlRepository"
    });
  }

}
