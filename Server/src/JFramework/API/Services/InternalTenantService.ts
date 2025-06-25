import ApplicationContext from "../../Configurations/ApplicationContext";
import { DatabaseConnectionData } from "../../Configurations/Types/IConfigurationSettings";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { BadRequestException, InternalServerException, NotFoundException } from "../../ErrorHandling/Exceptions";
import { AutoClassBinder } from "../../Helpers/Decorators/AutoBind";
import IEncrypterManager from "../../Managers/Interfaces/IEncrypterManager";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { DEFAULT_CONNECTION_POOL_SIZE, DEFAULT_DATABASE_TIMEOUT } from "../../Utils/const";
import IsNullOrEmpty from "../../Utils/utils";
import { SelectTenants } from "../DataAccess/Models/TenantsTable";
import { SelectTenantConnection } from "../DataAccess/Models/TenantsConnectionsTable";
import { SelectTenantDetails } from "../DataAccess/Models/TenantsDetailTable";
import ITenantConnectionsInternalRepository from "../DataAccess/Repositories/Interfaces/ITenantConnectionsInternalRepository";
import ITenantDetailsInternalRepository from "../DataAccess/Repositories/Interfaces/ITenantDetailsInternalRepository";
import ITenantsInternalRepository from "../DataAccess/Repositories/Interfaces/ITenantsInternalRepository";
import IInternalTenantService from "./Interfaces/IInternalTenantService";
import { SelectTenantConnectionView } from "../DataAccess/Models/Views/TenantConnectionView";

interface TenantServiceDependencies {
	applicationContext: ApplicationContext;
	tenantsInternalRepository: ITenantsInternalRepository;
	tenantDetailsInternalRepository: ITenantDetailsInternalRepository;
	tenantConnectionsInternalRepository: ITenantConnectionsInternalRepository;
	encrypterManager: IEncrypterManager;
}

@AutoClassBinder
export default class InternalTenantService implements IInternalTenantService {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Repositorio para consultar los tenants */
	private readonly _tenantsInternalRepository: ITenantsInternalRepository;

	/** Repositorio para consultar el detalle de un tenant */
	private readonly _tenantDetailsInternalRepository: ITenantDetailsInternalRepository;

	/** Repositorio para consultar la información de conección del tenant */
	private readonly _tenantConnectionsInternalRepository: ITenantConnectionsInternalRepository;

	/** Manejador de encryptado */
	private readonly _encrypterManager: IEncrypterManager;


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
		this._tenantConnectionsInternalRepository = deps.tenantConnectionsInternalRepository;
		this._encrypterManager = deps.encrypterManager;
	}

	/** Permite encriptar y desencriptar un connectionString 
	 * @param {string} connectionString - ConnectionString que se desea encriptar o desencriptar
	 * @param {boolean} decrypt - Indica si debe desencriptar o encriptar, encriptar = false, desencriptar = true */
	public async EncryptDecryptConnectionString(connectionString: string, decrypt: boolean): Promise<string> {
		try {
			this._logger.Activity("EncryptDecryptConnectionString");

			const secret = this._applicationContext.settings.databaseConnectionData.tenantConnectionSecret;

			/** Si la operación es de desencriptado */
			if (decrypt) {
				const data = await this._encrypterManager.Decrypt(connectionString, secret, "aes-256-cbc");
				return data;
			}

			/** Si la operación des de encriptado */
			const data = await this._encrypterManager.Encrypt(connectionString, secret, "aes-256-cbc");
			return data;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "EncryptDecryptConnectionString", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"EncryptDecryptConnectionString",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtiene un tenant según su proyectKey y su tenantKey */
	public async GetTenantByKey(tenantKey: string): Promise<SelectTenants> {
		try {
			this._logger.Activity("GetTenantByKey");

			if (IsNullOrEmpty(tenantKey)) {
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

			if (errTenant) {
				throw new InternalServerException(
					"GetTenantByKey",
					"tenant-error",
					this._applicationContext,
					__filename,
					errTenant ?? undefined
				)
			}

			if (!tenant) {
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

			if (IsNullOrEmpty(tenantCode)) {
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

			if (errTenant) {
				throw new InternalServerException(
					"GetTenantByCode",
					"tenant-error",
					this._applicationContext,
					__filename,
					errTenant ?? undefined
				)
			}

			if (!tenant) {
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

			if (IsNullOrEmpty(domainName)) {
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

			if (errTenant) {
				throw new InternalServerException(
					"GetTenantByDomainName",
					"tenant-error",
					this._applicationContext,
					__filename,
					errTenant ?? undefined
				)
			}

			if (!tenant) {
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

	/** Obtiene la configuración de conección del tenant */
	public async GetTenantConnectionByKey(tenantKey: string): Promise<SelectTenantConnection> {
		try {
			this._logger.Activity("GetTenantConnectionByKey");

			/** Obtenemos el detalle de la configuración del tenant  */
			const [errData, data] = await this._tenantConnectionsInternalRepository.Find(
				["tenant_key", "=", tenantKey]
			);

			/** Validamos la data */
			if (errData || !data) {
				throw new InternalServerException(
					"GetTenantConnectionByKey",
					"not-found",
					this._applicationContext,
					__filename,
					errData ?? undefined
				)
			}

			/** Devolvemos el detalle del tenant */
			return data;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantConnectionByKey", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantConnectionByKey",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	public async GetTenantConnectionViewByKey(tenantKey: string): Promise<SelectTenantConnectionView> {
		try {
			this._logger.Activity("GetTenantConnectionViewByKey");

			/** Obtenemos el detalle de la configuración del tenant  */
			const data = await this._tenantConnectionsInternalRepository.GetTenantConnectionViewByKey(tenantKey);

			/** Devolvemos el detalle del tenant */
			return data;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantConnectionViewByKey", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantConnectionViewByKey",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtienes los datos de conexión según el tenant y desencripta el connectionString */
	public async GetTenantConnectionConfig(connectionData: SelectTenantConnectionView): Promise<DatabaseConnectionData> {
		try {
			this._logger.Activity("GetTenantConnectionConfig");

			/** Desencriptamos la cadena de conexión del tenant */
			const connString = await this.EncryptDecryptConnectionString(connectionData.connection, true);

			return {
				/** Tipo de base de datos */
				type: connectionData.database_type,

				/** Cadena de conección */
				connectionString: connString ?? "",

				/** Timeout de conección */
				connectionTimeout: connectionData.timeout ?? DEFAULT_DATABASE_TIMEOUT,

				/** Tamaño minimo del connection pool */
				connectionPoolMinSize: connectionData.pool_min ?? DEFAULT_CONNECTION_POOL_SIZE,

				/** Tamaño maximo del connection pool */
				connectionPoolMaxSize: connectionData.pool_max ?? DEFAULT_CONNECTION_POOL_SIZE,
			}
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTenantConnectionConfig", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetTenantConnectionConfig",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}


}