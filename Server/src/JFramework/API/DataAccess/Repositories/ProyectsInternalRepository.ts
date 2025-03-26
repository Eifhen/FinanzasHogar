import ApplicationContext from "../../../Configurations/ApplicationContext";
import SqlGenericRepository from "../../../External/DataBases/Generic/SqlGenericRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { InternalSQLDatabase, InternalDatabase } from "../InternalDatabase";
import IProyectsInternalRepository from "./Interfaces/IProyectsInternalRepository";


interface IProyectsInternalRepositoryDependencies {
	/** Representa a la base de datos de uso interno */
	internalDatabase: InternalSQLDatabase;

	/** Representa al contexto de aplicación */
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad ahorros */
export default class ProyectsInternalRepository extends SqlGenericRepository<InternalDatabase, "gj_proyects", "id"> implements IProyectsInternalRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: IProyectsInternalRepositoryDependencies) {
		super(deps.internalDatabase, "gj_proyects", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "ProyectsInternalRepository",
			applicationContext: deps.applicationContext
		});
	}

}