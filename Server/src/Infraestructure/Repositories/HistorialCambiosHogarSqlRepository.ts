import IHistorialCambiosHogarSqlRepository from "../../Dominio/Repositories/IHistorialCambiosHogarSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase, DataBase } from "../DataBase";
import SqlGenericRepository from "../../JFramework/DataBases/Generic/SqlGenericRepository";





interface IHistorialCambiosHogarRepositoryDependencies {
	database: ApplicationSQLDatabase;
		applicationContext: ApplicationContext;
}

/** Repositorio para la entidad historial cambios hogar */
export default class HistorialCambiosHogarSqlRepository extends SqlGenericRepository<DataBase, "historialCambiosHogar", "id_historial"> implements IHistorialCambiosHogarSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: IHistorialCambiosHogarRepositoryDependencies){
		super(deps.database, "historialCambiosHogar", "id_historial", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "HistorialCambiosHogarSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}