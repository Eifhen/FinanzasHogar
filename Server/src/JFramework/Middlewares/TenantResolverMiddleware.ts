import { Response, NextFunction } from "express";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "./Types/MiddlewareTypes";
import ApplicationContext from "../Configurations/ApplicationContext";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { ConnectionEnvironment } from "../Configurations/Types/IConnectionService";
import { BUSINESS_DATABASE_INSTANCE_NAME } from "../Utils/const";
import { MultiTenantConnectionManager } from "../External/DataBases/MultiTenantConnectionManager";
import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";
import IInternalTenantService from "../API/Services/Interfaces/IInternalTenantService";
import { BadRequestException } from "../ErrorHandling/Exceptions";



interface TenantResolverMiddlewareDependencies {
	applicationContext: ApplicationContext;
	internalTenantService: IInternalTenantService;
}

@AutoClassBinder
export default class TenantResolverMiddleware extends ApplicationMiddleware {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicacion */
	private readonly _applicationContext: ApplicationContext;

	/** Servicio interno para manejo de tenants */
	private readonly _internalTenantService: IInternalTenantService;

	/** Manejador de conección multiTenant */
	private  _multiTenantManager?: MultiTenantConnectionManager;


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

		this._internalTenantService = deps.internalTenantService;

	}
	

	/** Intercepta el request en curso y agrega funcionalidad */
	public async Intercept(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("Intercept");

			/** OJO NECESITO RECIBIR EL TENANT_KEY de alguna forma, 
			 * puede ser desde el cliente mediante un header */
			// const tenantKey = "0B7BB829-745E-4A16-9FEB-04C0A8AA61B1";

			const tenantKey = req.get(this._applicationContext.settings.apiData.headers.tenantTokenHeader)?.trim();
			if(!tenantKey){
				throw new BadRequestException("Intercept", "no-tenant", this._applicationContext, __filename);
			}

			/** Tenant de la request en curso */
			const tenant = await this._internalTenantService.GetTenantByKey(tenantKey);

			/** Detalle del tenant de la request en curso */
			const details = await this._internalTenantService.GetTenantDetailsByTenantKey(tenantKey);

			/** Inicializamos el manager */
			this._multiTenantManager = new MultiTenantConnectionManager({
				applicationContext: this._applicationContext,
				scopedContainerManager: req.container,
				options: {
					databaseType: tenant.database_type,
					databaseContainerInstanceName: BUSINESS_DATABASE_INSTANCE_NAME,
					strategyOptions: {
						env: ConnectionEnvironment.business,
						connectionData: this._internalTenantService.GetTenantConnectionConfig(tenant, details),
					}
				}
			});

			/** Iniciamos la conexión con la base de datos */
			await this._multiTenantManager.Connect();

			/** Si todo va bien entonces seguimos adelante */
			return next();
		}
		catch (err: any) {
			this._logger.Error("ERROR", "Intercept", err);

			/** Desconectamos el tenant */
			await this._multiTenantManager?.Disconnect();

			return next(err);
		}
	}

}