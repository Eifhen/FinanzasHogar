import IPresupuestosSqlRepository from "../../../Dominio/Repositories/IPresupuestosSqlRepository";
import ApplicationContext from "../../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../../JFramework/External/DataBases/Generic/SqlGenericRepository";



interface IPresupuestosRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad presupuestos */
export default class PresupuestosSqlRepository extends SqlGenericRepository<DataBase, "presupuestos", "id_presupuesto"> implements IPresupuestosSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IPresupuestosRepositoryDependencies) {
		super(deps.database, "presupuestos", "id_presupuesto", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "PresupuestosSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}






