import ApplicationContext from "../../../Configurations/ApplicationContext";
import SqlGenericRepository from "../../../External/DataBases/Generic/SqlGenericRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { InternalSQLDatabase, InternalDatabase } from "../InternalDatabase";
import ITenantDetailsInternalRepository from "./Interfaces/ITenantDetailsInternalRepository";


interface ITenantDetailsInternalRepositoryDependencies {
	/** Representa a la base de datos de uso interno */
	internalDatabase: InternalSQLDatabase;

	/** Representa al contexto de aplicación */
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad ahorros */
export default class TenantDetailsInternalRepository extends SqlGenericRepository<InternalDatabase, "tenantDetails", "id"> implements ITenantDetailsInternalRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: ITenantDetailsInternalRepositoryDependencies) {
		super(deps.internalDatabase, "tenantDetails", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "TenantDetailsInternalRepository",
			applicationContext: deps.applicationContext
		});
	}

}