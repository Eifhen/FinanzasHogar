import IUsuarioHogarSqlRepository from "../../Dominio/Repositories/IUsuarioHogarSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";


interface IUsuarioHogarRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad Usuarios */
export default class UsuarioHogarSqlRepository extends MssSqlGenericRepository<"usuariosHogar", "id"> implements IUsuarioHogarSqlRepository {


  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IUsuarioHogarRepositoryDependencies){
    super(deps.database, "usuariosHogar", "id");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "UsuarioHogarSqlRepository"
    });
  }

}