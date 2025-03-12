import ICuentasSqlRepository from "../../Dominio/Repositories/ICuentasSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../JFramework/DataBases/Generic/SqlGenericRepository";




interface ICuentasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad cuentas */
export default class CuentasSqlRepository extends SqlGenericRepository<DataBase, "cuentas", "id"> implements ICuentasSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: ICuentasRepositoryDependencies) {
		super(deps.database, "cuentas", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "CuentasSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}