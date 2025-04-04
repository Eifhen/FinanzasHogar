import ITransaccionesSqlRepository from "../../../Dominio/Repositories/ITransaccionesSqlRepository";
import ApplicationContext from "../../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../../JFramework/External/DataBases/Generic/SqlGenericRepository";


interface ITransaccionesRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad Transacciones */
export default class TransaccionesSqlRepository extends SqlGenericRepository<DataBase, "transacciones", "id"> implements ITransaccionesSqlRepository {


	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: ITransaccionesRepositoryDependencies){
		super(deps.database, "transacciones", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "TransaccionesSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}