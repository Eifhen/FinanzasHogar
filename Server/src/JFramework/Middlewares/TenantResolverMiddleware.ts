import { Response, NextFunction } from "express";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "./Types/MiddlewareTypes";
import ApplicationContext from "../Configurations/ApplicationContext";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { ConnectionEnvironment } from "../Configurations/Types/IConnectionService";
import DatabaseConnectionManager from "../External/DataBases/DatabaseConnectionManager";
import { SqlStrategyConnectionData } from '../External/DataBases/Types/DatabaseType';
import { DatabaseConnectionData } from "../Configurations/Types/IConfigurationSettings";
import { ConnectionConfiguration } from "tedious";
import ITenantsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantsInternalRepository";
import ITenantDetailsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantDetailsInternalRepository";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { SelectTenants } from "../API/DataAccess/Models/Tenants";
import { SelectTenantDetails } from "../API/DataAccess/Models/TenantsDetail";
import { BUSINESS_DATABASE_INSTANCE_NAME } from "../Utils/const";



interface TenantResolverMiddlewareDependencies {
	applicationContext: ApplicationContext;
	tenantsInternalRepository: ITenantsInternalRepository;
	tenantDetailInternalRepository: ITenantDetailsInternalRepository;
}

export default class TenantResolverMiddleware extends ApplicationMiddleware {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicacion */
	private readonly _applicationContext: ApplicationContext;

	/** Repositorio para consultar los tenants */
	private readonly _tenantsInternalRepository: ITenantsInternalRepository;

	/** Repositorio para consultar el detalle de un tenant */
	private readonly _tenantDetailInternalRepository: ITenantDetailsInternalRepository;


	constructor(deps: TenantResolverMiddlewareDependencies) {
		super();

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "MIDDLEWARE",
			entityName: "TenantResolverMiddleware",
			applicationContext: deps.applicationContext
		});

		/** Agregamos el context */
		this._applicationContext = deps.applicationContext;

		this._tenantsInternalRepository = deps.tenantsInternalRepository;
		this._tenantDetailInternalRepository = deps.tenantDetailInternalRepository;
	}

	/** Obtiene el tenant */
	private async GetTenant(proyectId: string, tenantKey: string) : Promise<SelectTenants> {
		try {
			this._logger.Activity("GetTenant");

			/** Obtenemos la data del Tenant */
			const [errTenant, tenant] = await this._tenantsInternalRepository.Find([
				["proyect_key", "=", proyectId],
				["tenant_key", "=", tenantKey]
			]);

			/** Validamos la data */
			if (errTenant || !tenant) {
				throw new InternalServerException(
					"GetTenant", 
					"not-found", 
					this._applicationContext, 
					__filename, 
					errTenant ?? undefined
				)
			}

			/** Devolvemos el tenant */
			return tenant;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenant", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenant",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtenemos los detalles del tenant */
	private async GetTenantDetail(tenantKey:string) : Promise<SelectTenantDetails> {
		try {
			this._logger.Activity("GetTenantDetail");
			
			/** Obtenemos el detalle de la configuración del tenant  */
			const [errTenantDetail, tenantDetail] = await this._tenantDetailInternalRepository.Find(["tenant_key", "=", tenantKey]);

			/** Validamos la data */
			if (errTenantDetail || !tenantDetail) {
				throw new InternalServerException(
					"GetTenantDetail", 
					"not-found", 
					this._applicationContext, 
					__filename, 
					errTenantDetail ?? undefined
				)
			}

			/** Devolvemos el detalle del tenant */
			return tenantDetail;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantDetail", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantDetail",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Intercepta el request en curso y agrega funcionalidad */
	public async Intercept(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("Intercept");

			/** Identificador del proyecto */
			const proyectId = this._applicationContext.settings.apiData.proyect_token;

			/** OJO NECESITO RECIBIR EL TENANT_KEY de alguna forma, 
			 * puede ser desde el cliente mediante un header */
			const tenantKey = "0345";

			const tenant = await this.GetTenant(proyectId, tenantKey)
			const details = await this.GetTenantDetail(tenantKey);

			/** Inicializamos el manager */
			const databaseConnecctionManager = new DatabaseConnectionManager<any, SqlStrategyConnectionData>({
				containerManager: req.container,
				configurationSettings: this._applicationContext.settings,
				options: {
					databaseInstanceName: BUSINESS_DATABASE_INSTANCE_NAME, //INTERNAL_DATABASE_INSTANCE_NAME, // "database"
					databaseType: tenant.databaseType
				}
			});

			/** Seteamos las opciones de configuración e Iniciamos la conexión con la base de datos */
			await databaseConnecctionManager
			.SetConnectionStrategy()
			.SetConnectionConfiguration({
				env: ConnectionEnvironment.business,
				connectionData: {} as DatabaseConnectionData, // estos objetos deben ser dinamicos, por ahora los mando vacios
				connectionConfig: {} as ConnectionConfiguration // estos objetos deben ser dinámicos
			}).Connect();

		}
		catch (err: any) {
			this._logger.Error("ERROR", "Intercept", err);
			next(err);
		}
	}

}