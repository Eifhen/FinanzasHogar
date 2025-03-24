import IMetasSqlRepository from "../../../Dominio/Repositories/IMetasSqlRepository";
import ApplicationContext from "../../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../../DataBase";
import SqlGenericRepository from "../../../JFramework/External/DataBases/Generic/SqlGenericRepository";



interface IMetasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad metas */
export default class MetasSqlRepository extends SqlGenericRepository<DataBase, "metas", "id"> implements IMetasSqlRepository {

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