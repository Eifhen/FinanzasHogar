import IPresupuestoCategoriaSqlRepository from "../../Dominio/Repositories/IPresupuestoCategoriaSqlRepository";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepository from "./Generic/SqlGenericRepository";





interface IPresupuestoCategoriaRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad presupuesto categoria */
export default class PresupuestoCategoriaSqlRepository extends SqlGenericRepository<"presupuestoCategoria", "id"> implements IPresupuestoCategoriaSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IPresupuestoCategoriaRepositoryDependencies) {
		super(deps.database, "presupuestoCategoria", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "PresupuestoCategoriaSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}
