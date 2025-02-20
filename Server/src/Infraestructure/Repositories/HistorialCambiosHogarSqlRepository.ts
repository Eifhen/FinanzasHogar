import IHistorialCambiosHogarSqlRepository from "../../Dominio/Repositories/IHistorialCambiosHogarSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";





interface IHistorialCambiosHogarRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad historial cambios hogar */
export default class HistorialCambiosHogarSqlRepository extends MssSqlGenericRepository<"historialCambiosHogar", "id_historial"> implements IHistorialCambiosHogarSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IHistorialCambiosHogarRepositoryDependencies){
    super(deps.database, "historialCambiosHogar", "id_historial");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "HistorialCambiosHogarSqlRepository"
    });
  }

}