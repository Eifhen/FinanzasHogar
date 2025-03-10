/* eslint-disable @typescript-eslint/no-unsafe-call */

import IHogaresSqlRepository from "../../Dominio/Repositories/IHogaresSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";




interface IHogaresRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad hogares */
export default class HogaresSqlRepository extends SqlGenericRepositoryStrategy<"hogares", "id_hogar"> implements IHogaresSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IHogaresRepositoryDependencies) {
		super(deps.database, "hogares", "id_hogar", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "HogaresSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}