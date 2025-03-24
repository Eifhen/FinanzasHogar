import IHogaresSqlRepository from "../../../Dominio/Repositories/IHogaresSqlRepository";
import ApplicationContext from "../../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../../JFramework/External/DataBases/Generic/SqlGenericRepository";




interface IHogaresRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad hogares */
export default class HogaresSqlRepository extends SqlGenericRepository<DataBase, "hogares", "id_hogar"> implements IHogaresSqlRepository {

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