import IRolesSqlRepository from "../../Dominio/Repositories/IRolesSqlRepository";
import ApplicationContext from "../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../JFramework/External/DataBases/Generic/SqlGenericRepository";



interface IRolesRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad roles */
export default class RolesSqlRepository extends SqlGenericRepository<DataBase, "roles", "id_rol"> implements IRolesSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IRolesRepositoryDependencies) {
		super(deps.database, "roles", "id_rol", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "RolesSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}
