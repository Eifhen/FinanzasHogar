/* eslint-disable @typescript-eslint/no-unsafe-call */

import IDeudasSqlRepository from "../../Dominio/Repositories/IDeudasSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";






interface IDeudasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad deudas */
export default class DeudasSqlRepository extends SqlGenericRepositoryStrategy<"deudas", "id"> implements IDeudasSqlRepository {

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