import ApplicationContext from "../../../Configurations/ApplicationContext";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { InternalServerException } from "../../../ErrorHandling/Exceptions";
import SqlGenericRepository from "../../../External/DataBases/Generic/SqlGenericRepository";
import ILoggerManager, { LoggEntityCategorys } from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { InternalDatabase, InternalSQLDatabase } from "../InternalDatabase";
import TenantConnectionView, { SelectTenantConnectionView } from "../Models/Views/TenantConnectionView";
import ITenantConnectionsInternalRepository from "./Interfaces/ITenantConnectionsInternalRepository";




interface ITenantConnectionsInternalRepositoryDependencies {
	/** Representa a la base de datos de uso interno */
	internalDatabase: InternalSQLDatabase;

	/** Representa al contexto de aplicación */
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad ahorros */
export default class TenantConnectionsInternalRepository extends SqlGenericRepository<InternalDatabase, "gj_tenant_connections", "id"> implements ITenantConnectionsInternalRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;


	constructor(deps: ITenantConnectionsInternalRepositoryDependencies) {
		super(deps.internalDatabase, "gj_tenant_connections", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "TenantConnectionsInternalRepository",
			applicationContext: deps.applicationContext
		});
	}

	/** Obtiene la vista tenant_connection_view filtrando por el key del tenant */
	public async GetTenantConnectionViewByKey(tenantKey: string): Promise<TenantConnectionView> {
		try {
			this._logger.Activity("GetTenantConnectionViewByKey");

			const query: SelectTenantConnectionView = await this._database
				 .selectFrom("gj_tenant_connection_view")
				 .selectAll()
				 .where("gj_tenant_connection_view.tenant_key", "=", tenantKey)
				 .executeTakeFirstOrThrow();

			return query;
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantConnectionViewByKey", err);
			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantConnectionViewByKey",
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

}