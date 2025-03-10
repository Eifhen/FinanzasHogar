/* eslint-disable @typescript-eslint/no-unsafe-call */

import IMetasSqlRepository from "../../Dominio/Repositories/IMetasSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";



interface IMetasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad metas */
export default class MetasSqlRepository extends SqlGenericRepositoryStrategy<"metas", "id"> implements IMetasSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IMetasRepositoryDependencies) {
		super(deps.database, "metas", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "MetasSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}