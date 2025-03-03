import IDeudasSqlRepository from "../../Dominio/Repositories/IDeudasSqlRepository";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepository from "./Generic/SqlGenericRepository";






interface IDeudasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad deudas */
export default class DeudasSqlRepository extends SqlGenericRepository<"deudas", "id"> implements IDeudasSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IDeudasRepositoryDependencies) {
		super(deps.database, "deudas", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "DeudasSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}