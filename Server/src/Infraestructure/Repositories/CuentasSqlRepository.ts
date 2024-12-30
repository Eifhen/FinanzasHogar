import ICuentasSqlRepository from "../../Dominio/Repositories/ICuentasSqlRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";




interface ICuentasRepositoryDependencies {
  database: ApplicationSQLDatabase;
}

/** Repositorio para la entidad cuentas */
export default class CuentasSqlRepository extends MssSqlGenericRepository<"cuentas", "id"> implements ICuentasSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;
    
  constructor(deps: ICuentasRepositoryDependencies){
    super(deps.database, "cuentas", "id");

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "CuentasSqlRepository"
    });
  }

}