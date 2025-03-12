import ICategoriasSqlRepository from "../../Dominio/Repositories/ICategoriasSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../JFramework/DataBases/Generic/SqlGenericRepository";



interface ICategoriasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad categorias */
export default class CategoriasSqlRepository extends SqlGenericRepository<DataBase, "categorias", "id_categoria"> implements ICategoriasSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: ICategoriasRepositoryDependencies){
		super(deps.database, "categorias", "id_categoria", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "CategoriasSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}