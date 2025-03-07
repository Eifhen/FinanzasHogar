/* eslint-disable @typescript-eslint/no-unsafe-call */

import INotificacionesSqlRepository from "../../Dominio/Repositories/INotificacionesSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepository from "./Generic/SqlGenericRepository";








interface INotificacionesRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad notificaciones */
export default class NotificacionesSqlRepository extends SqlGenericRepository<"notificaciones", "id_notificacion"> implements INotificacionesSqlRepository {

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