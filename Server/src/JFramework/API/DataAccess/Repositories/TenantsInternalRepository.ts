import ApplicationContext from "../../../Configurations/ApplicationContext";
import SqlGenericRepository from "../../../External/DataBases/Generic/SqlGenericRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { InternalDatabase, InternalSQLDatabase } from "../InternalDatabase";
import ITenantsInternalRepository from "./Interfaces/ITenantsInternalRepository";


interface ITenantsInternalRepositoryDependencies {
	/** Representa a la base de datos de uso interno */
	internalDatabase: InternalSQLDatabase;

	/** Representa al contexto de aplicación */
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad ahorros */
export default class TenantsInternalRepository extends SqlGenericRepository<InternalDatabase, "tenants", "id"> implements ITenantsInternalRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: ITenantsInternalRepositoryDependencies) {
		super(deps.internalDatabase, "tenants", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "TenantsInternalRepository",
			applicationContext: deps.applicationContext
		});
	}

}