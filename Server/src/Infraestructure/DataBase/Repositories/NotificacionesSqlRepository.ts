import INotificacionesSqlRepository from "../../../Dominio/Repositories/INotificacionesSqlRepository";
import ApplicationContext from "../../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../../JFramework/External/DataBases/Generic/SqlGenericRepository";


interface INotificacionesRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad notificaciones */
export default class NotificacionesSqlRepository extends SqlGenericRepository<DataBase, "notificaciones", "id_notificacion"> implements INotificacionesSqlRepository {

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