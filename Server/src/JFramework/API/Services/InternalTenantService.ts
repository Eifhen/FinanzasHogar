import ApplicationContext from "../../Configurations/ApplicationContext";
import { DatabaseConnectionData } from "../../Configurations/Types/IConfigurationSettings";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { BadRequestException, InternalServerException, NotFoundException } from "../../ErrorHandling/Exceptions";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import IsNullOrEmpty from "../../Utils/utils";
import { SelectTenants } from "../DataAccess/Models/Tenants";
import { SelectTenantDetails } from "../DataAccess/Models/TenantsDetail";
import ITenantDetailsInternalRepository from "../DataAccess/Repositories/Interfaces/ITenantDetailsInternalRepository";
import ITenantsInternalRepository from "../DataAccess/Repositories/Interfaces/ITenantsInternalRepository";
import IInternalTenantService from "./Interfaces/IInternalTenantService";

interface TenantServiceDependencies {
	applicationContext: ApplicationContext;
	tenantsInternalRepository: ITenantsInternalRepository
	tenantDetailsInternalRepository: ITenantDetailsInternalRepository
}

export default class InternalTenantService implements IInternalTenantService {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Repositorio para consultar los tenants */
	private readonly _tenantsInternalRepository: ITenantsInternalRepository;

	/** Repositorio para consultar el detalle de un tenant */
	private readonly _tenantDetailsInternalRepository: ITenantDetailsInternalRepository;


	constructor(deps: TenantServiceDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "SERVICE",
			entityName: "InternalTenantService"
		});

		/** Agregamos el contexto de applicación */
		this._applicationContext = deps.applicationContext;

		this._tenantsInternalRepository = deps.tenantsInternalRepository;
		this._tenantDetailsInternalRepository = deps.tenantDetailsInternalRepository;
	}

	/** Obtiene un tenant según su proyectKey y su tenantKey */
	public async GetTenantByKey(tenantKey: string): Promise<SelectTenants> {
		try {
			this._logger.Activity("GetTenantByKey");

			if(IsNullOrEmpty(tenantKey)){
				throw new BadRequestException("GetTenantByKey", "no-tenant", this._applicationContext, __filename);
			}

			/** Identificador del proyecto */
			const proyectId = this._applicationContext.settings.apiData.proyect_token;

			/** Obtenemos la data del Tenant */
			const [errTenant, tenant] = await this._tenantsInternalRepository.Find([
				["proyect_key", "=", proyectId],
				"and",
				["tenant_key", "=", tenantKey]
			]);

			if(errTenant){
				throw new InternalServerException(
					"GetTenantByKey",
					"tenant-error",
					this._applicationContext,
					__filename,
					errTenant ?? undefined
				) 
			}

			if(!tenant){
				throw new NotFoundException("GetTenantByKey", [tenantKey], this._applicationContext, __filename);
			}

			/** Devolvemos el tenant */
			return tenant;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantByKey", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantByKey",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtiene un tenant según su proyectKey y su tenantCode */
	public async GetTenantByCode(tenantCode: string): Promise<SelectTenants> {
		try {
			this._logger.Activity("GetTenantByCode");

			if(IsNullOrEmpty(tenantCode)){
				throw new BadRequestException("GetTenantByCode", "no-tenant", this._applicationContext, __filename);
			}

			/** Identificador del proyecto */
			const proyectId = this._applicationContext.settings.apiData.proyect_token;

			/** Obtenemos la data del Tenant */
			const [errTenant, tenant] = await this._tenantsInternalRepository.Find([
				["proyect_key", "=", proyectId],
				"and",
				["tenant_code", "=", tenantCode]
			]);

			if(errTenant){
				throw new InternalServerException(
					"GetTenantByCode",
					"tenant-error",
					this._applicationContext,
					__filename,
					errTenant ?? undefined
				) 
			}

			if(!tenant){
				throw new NotFoundException("GetTenantByCode", [tenantCode], this._applicationContext, __filename);
			}

			/** Devolvemos el tenant */
			return tenant;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantByCode", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantByCode",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtiene un tenant según su proyectKey y su nombre de dominio */
	public async GetTenantByDomainName(domainName: string): Promise<SelectTenants> {
		try {
			this._logger.Activity("GetTenantByDomainName");

			if(IsNullOrEmpty(domainName)){
				throw new BadRequestException("GetTenantByDomainName", "no-tenant", this._applicationContext, __filename);
			}

			/** Identificador del proyecto */
			const proyectId = this._applicationContext.settings.apiData.proyect_token;

			/** Obtenemos la data del Tenant */
			const [errTenant, tenant] = await this._tenantsInternalRepository.Find([
				["proyect_key", "=", proyectId],
				"and",
				["domain", "=", domainName]
			]);

			if(errTenant){
				throw new InternalServerException(
					"GetTenantByDomainName",
					"tenant-error",
					this._applicationContext,
					__filename,
					errTenant ?? undefined
				) 
			}

			if(!tenant){
				throw new NotFoundException("GetTenantByDomainName", [domainName], this._applicationContext, __filename);
			}

			/** Devolvemos el tenant */
			return tenant;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantByDomainName", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantByDomainName",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtiene el detalle de un tenant según su tenantKey */
	public async GetTenantDetailsByTenantKey(tenantKey: string): Promise<SelectTenantDetails> {
		try {
			this._logger.Activity("GetTenantDetailsByTenantKey");

			/** Obtenemos el detalle de la configuración del tenant  */
			const [errTenantDetail, tenantDetail] = await this._tenantDetailsInternalRepository.Find(
				["tenant_key", "=", tenantKey]
			);

			/** Validamos la data */
			if (errTenantDetail || !tenantDetail) {
				throw new InternalServerException(
					"GetTenantDetailsByTenantKey",
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
			this._logger.Error("ERROR", "GetTenantDetailsByTenantKey", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantDetailsByTenantKey",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtienes los datos de conexión según el tenant */
	public GetTenantConnectionConfig(tenant: SelectTenants, details: SelectTenantDetails) : DatabaseConnectionData {
		const data = JSON.parse(details.connectionObject as unknown as string);

		return {
			/** Tipo de base de datos */
			type: tenant.database_type,

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
			port: data.databasePort,

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

}