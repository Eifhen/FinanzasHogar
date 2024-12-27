import IUsuariosSqlRepository from '../../Dominio/Repositories/IUsuariosSqlRepository';
import ILoggerManager, { LoggEntityCategorys } from '../../JFramework/Managers/Interfaces/ILoggerManager';
import LoggerManager from '../../JFramework/Managers/LoggerManager';
import { ApplicationSQLDatabase } from '../DataBase';
import IMssSqlGenericRepository from './Generic/Interfaces/IMssSqlGenericRepository';
import MssSqlGenericRepository from './Generic/MssSqlGenericRepository';




interface IUsuariosRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad Usuarios */
export default class UsuariosSqlRepository extends MssSqlGenericRepository<"usuarios", "id_usuario"> implements IUsuariosSqlRepository {


  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: IUsuariosRepositoryDependencies){
    super(deps.database, "usuarios", "id_usuario");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "UsuariosSqlRepository"
    });
  }

}