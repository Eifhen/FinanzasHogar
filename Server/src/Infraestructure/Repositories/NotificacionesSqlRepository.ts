import INotificacionesSqlRepository from "../../Dominio/Repositories/INotificacionesSqlRepository";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import MssSqlGenericRepository from "./Generic/MssSqlGenericRepository";








interface INotificacionesRepositoryDependencies {
  database: ApplicationSQLDatabase;
  applicationContext: ApplicationContext;
}

/** Repositorio para la entidad notificaciones */
export default class NotificacionesSqlRepository extends MssSqlGenericRepository<"notificaciones", "id_notificacion"> implements INotificacionesSqlRepository {

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor(deps: INotificacionesRepositoryDependencies) {
    super(deps.database, "notificaciones", "id_notificacion", deps.applicationContext);

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.REPOSITORY,
      entityName: "NotificacionesSqlRepository",
      applicationContext: deps.applicationContext
    });
  }

}