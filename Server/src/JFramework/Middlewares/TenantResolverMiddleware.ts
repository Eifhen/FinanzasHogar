import { Response, NextFunction } from "express";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "./Types/MiddlewareTypes";
import ApplicationContext from "../Configurations/ApplicationContext";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { ConnectionEnvironment } from "../Configurations/Types/IConnectionService";
import ITenantsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantsInternalRepository";
import ITenantDetailsInternalRepository from "../API/DataAccess/Repositories/Interfaces/ITenantDetailsInternalRepository";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { SelectTenants } from "../API/DataAccess/Models/Tenants";
import { SelectTenantDetails } from "../API/DataAccess/Models/TenantsDetail";
import { BUSINESS_DATABASE_INSTANCE_NAME, DEFAULT_DATABASE_TIMEOUT } from "../Utils/const";
import { MultiTenantConnectionManager } from "../External/DataBases/MultiTenantConnectionManager";
import { DatabaseType } from "../External/DataBases/Types/DatabaseType";
import { DatabaseConnectionData } from "../Configurations/Types/IConfigurationSettings";
import * as tedious from 'tedious';
import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";


interface TenantResolverMiddlewareDependencies {
	applicationContext: ApplicationContext;
	tenantsInternalRepository: ITenantsInternalRepository;
	tenantDetailInternalRepository: ITenantDetailsInternalRepository;
}

@AutoClassBinder
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
	private async GetTenant(proyectId: string, tenantKey: string): Promise<SelectTenants> {
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
	private async GetTenantDetail(tenantKey: string): Promise<SelectTenantDetails> {
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

	/** Obtiene la data de conexión para la estrategia de sql */
	private StrategySqlConnectionData(tenant: SelectTenants, details: SelectTenantDetails): DatabaseConnectionData {
		
		const data = details.connectionObject;

		return {
			/** Tipo de base de datos */
			type: tenant.databaseType,

			/** Nombre de usuario de la base de datos */
			userName: data.userName,

			/** Contraseña de usuario */
			password: data.password,

			/** Nombre del dominio de la base de datos */
			domain: data.domain,

			/** Nombre del servidor */
			server: data.server,

			/** Nombre de la base de datos */
			databaseName: data.databaseName,

			/** Puerto de la base de datos */
			port: data.databasePort.toString(),

			/** Nombre de la instancia */
			instance: data.instanceName,

			/** Cadena de conección */
			connectionString: details.connectionString,

			/** Timeout de conección */
			connectionTimeout: data.connectionTimeout,

			/** Tamaño minimo del connection pool */
			connectionPoolMinSize: data.connectionPoolMinSize,

			/** Tamaño maximo del connection pool */
			connectionPoolMaxSize: data.connectionPoolMaxSize,
		}
	}

	/** Obtiene la data de configuración de conexión para la estrategia de sql */
	private StrategySqlConnectionConfig(tenant: SelectTenants, details: SelectTenantDetails): tedious.ConnectionConfiguration {
		return {
			/** Nombre del servidor */
			server: details.connectionObject.server ?? "",

			/** Opciones de configuración */
			options: {
				/** Nombre de la base de datos */
				database: details.connectionObject.databaseName ?? "",
				/** Nombre de la instancia */
				instanceName: details.connectionObject.instanceName ?? "",
				// port: Number(process.env.DB_PORT ?? 0),
				trustServerCertificate: true,
				// Aborta cualquier transacción automaticamente si ocurre un error en sql.
				abortTransactionOnError: true,
				// The number of milliseconds before the attempt to connect is considered failed (default: 15000).
				connectTimeout: details.connectionObject.connectionTimeout ?? DEFAULT_DATABASE_TIMEOUT,
				
			},
			/** Datos de autenticación */
			authentication: {
				type: 'default',
				options: {
					userName: details.connectionObject.userName ?? "",
					password: details.connectionObject.password ?? "",
					//domain: process.env.DB_DOMAIN ?? "",
				},
			}
		}
	}

	/** Obtiene la data de conexión para la estrategia de mongodb */
	private StrategyMongodbConnectionData(tenant: SelectTenants, details: SelectTenantDetails): any {
		throw new Error(`Estrategía de conexión MongoDB No implementada Tenant: ${tenant.name} Database: ${details.databaseName}`);
	}

	/** Obitiene la data de configuración para la estrategia de mongodb */
	private StrategyMongodbConnectionConfig(tenant: SelectTenants, details: SelectTenantDetails): any {
		throw new Error(`Estrategía de conexión MongoDB No implementada Tenant: ${tenant.name} Database: ${details.databaseName}`);
	}

	/** Obtiene la data de configuración de conexión para la estrategia, 
	 * según el tipo de base de datos del tenant */
	private StrategyConnectionConfig(tenant: SelectTenants, details: SelectTenantDetails): any {
		this._logger.Activity("StrategyConnectionData");

		switch (tenant.databaseType) {
			case DatabaseType.ms_sql_database:
				return this.StrategySqlConnectionConfig(tenant, details);
			case DatabaseType.mongo_database:
				return this.StrategyMongodbConnectionConfig(tenant, details);
		}
	}

	/** Obtiene la data de conexión para la estrategia, 
	* según el tipo de base de datos del tenant */
	private StrategyConnectionData(tenant: SelectTenants, details: SelectTenantDetails): any {
		this._logger.Activity("StrategyConnectionData");

		switch (tenant.databaseType) {
			case DatabaseType.ms_sql_database:
				return this.StrategySqlConnectionData(tenant, details);
			case DatabaseType.mongo_database:
				return this.StrategyMongodbConnectionData(tenant, details);
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
			const tenantKey = "0B7BB829-745E-4A16-9FEB-04C0A8AA61B1";

			/** Tenant de la request en curso */
			const tenant = await this.GetTenant(proyectId, tenantKey);

			/** Detalle del tenant de la request en curso */
			const details = await this.GetTenantDetail(tenantKey);

			/** Inicializamos el manager */
			const multiTenantManager = new MultiTenantConnectionManager({
				applicationContext: this._applicationContext,
				scopedContainerManager: req.container,
				options: {
					databaseType: tenant.databaseType,
					databaseInstanceName: BUSINESS_DATABASE_INSTANCE_NAME,
					strategyOptions: {
						env: ConnectionEnvironment.business,
						connectionData: this.StrategyConnectionData(tenant, details),
						connectionConfig: this.StrategyConnectionConfig(tenant, details),
					}
				}
			});

			/** Iniciamos la conexión con la base de datos */
			await multiTenantManager.Connect();

		}
		catch (err: any) {
			this._logger.Error("ERROR", "Intercept", err);
			next(err);
		}
	}

}