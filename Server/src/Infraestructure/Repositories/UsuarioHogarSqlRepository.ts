import IUsuarioHogarSqlRepository from "../../Dominio/Repositories/IUsuarioHogarSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../JFramework/DataBases/Generic/SqlGenericRepository";


interface IUsuarioHogarRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad Usuarios */
export default class UsuarioHogarSqlRepository extends SqlGenericRepository<DataBase, "usuariosHogar", "id"> implements IUsuarioHogarSqlRepository {


	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: IUsuarioHogarRepositoryDependencies){
		super(deps.database, "usuariosHogar", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "UsuarioHogarSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}