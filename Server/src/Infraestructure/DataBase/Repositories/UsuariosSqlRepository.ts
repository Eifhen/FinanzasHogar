import IUsuariosSqlRepository from '../../../Dominio/Repositories/IUsuariosSqlRepository';
import ApplicationContext from "../../../JFramework/Configurations/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from '../../../JFramework/Managers/Interfaces/ILoggerManager';
import LoggerManager from '../../../JFramework/Managers/LoggerManager';
import { ApplicationSQLDatabase, DataBase } from '../../DataBase';
import SqlGenericRepository from '../../../JFramework/External/DataBases/Generic/SqlGenericRepository';


interface IUsuariosRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad Usuarios */
export default class UsuariosSqlRepository extends SqlGenericRepository<DataBase, "usuarios", "id_usuario"> implements IUsuariosSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: IUsuariosRepositoryDependencies){
		super(deps.database, "usuarios", "id_usuario", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "UsuariosSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}