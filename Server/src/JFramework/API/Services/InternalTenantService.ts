import ApplicationContext from "../../Configurations/ApplicationContext";
import { DatabaseConnectionData } from "../../Configurations/Types/IConfigurationSettings";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { BadRequestException, InternalServerException, NotFoundException, ValidationException } from "../../ErrorHandling/Exceptions";
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
import { ApiResponse, ApplicationResponse } from "../../Helpers/ApplicationResponse";
import { HttpStatusMessage } from "../../Utils/HttpCodes";
import TenantDTO from "../DataAccess/DTOs/TenantDTO";
import ISqlTransactionManager from "../../External/DataBases/Interfaces/ISqlTransactionManager";
import { InternalDatabase } from "../DataAccess/InternalDatabase";
import SqlTransactionManager from "../../External/DataBases/Generic/SqlTransactionManager";
import { Kysely } from "kysely";
import IProyectsInternalRepository from "../DataAccess/Repositories/Interfaces/IProyectsInternalRepository";

interface TenantServiceDependencies {
	applicationContext: ApplicationContext;
	tenantsInternalRepository: ITenantsInternalRepository;
	tenantDetailsInternalRepository: ITenantDetailsInternalRepository;
	tenantConnectionsInternalRepository: ITenantConnectionsInternalRepository;
	proyectsInternalRepository: IProyectsInternalRepository;
	encrypterManager: IEncrypterManager;
	internalDatabase: Kysely<any>;
}

@AutoClassBinder
export default class InternalTenantService implements IInternalTenantService {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Repositorio de proyectos */
	private readonly _proyectsInternalRepostory: IProyectsInternalRepository;

	/** Repositorio para consultar los tenants */
	private readonly _tenantsInternalRepository: ITenantsInternalRepository;

	/** Repositorio para consultar el detalle de un tenant */
	private readonly _tenantDetailsInternalRepository: ITenantDetailsInternalRepository;

	/** Repositorio para consultar la información de conección del tenant */
	private readonly _tenantConnectionsInternalRepository: ITenantConnectionsInternalRepository;

	/** Manejador de encryptado */
	private readonly _encrypterManager: IEncrypterManager;

	/** Gestor de transacciones */
	private readonly _transaction: ISqlTransactionManager<InternalDatabase>;

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
		this._proyectsInternalRepostory = deps.proyectsInternalRepository;
		this._encrypterManager = deps.encrypterManager;

		this._transaction = new SqlTransactionManager({
			applicationContext: this._applicationContext,
			database: deps.internalDatabase
		});
	}

	/** Permite encriptar y desencriptar un connectionString 
	 * @param {string} connectionString - ConnectionString que se desea encriptar o desencriptar
	 * @param {boolean} decrypt - Indica si debe desencriptar o encriptar, encriptar = false, desencriptar = true */
	public async EncryptDecryptConnectionString(connectionString: string, decrypt: boolean): ApiResponse<string> {
		try {
			this._logger.Activity("EncryptDecryptConnectionString");

			const secret = this._applicationContext.settings.databaseConnectionData.tenantConnectionSecret;

			let data: string = "";

			/** Si la operación es de desencriptado */
			if (decrypt) {
				data = await this._encrypterManager.Decrypt(connectionString, secret, "aes-256-cbc");
			} else {
				/** Si la operación des de encriptado */
				data = await this._encrypterManager.Encrypt(connectionString, secret, "aes-256-cbc");
			}

			return new ApplicationResponse<string>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				data
			);
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

	/** Obtiene el listado de todos los tenants registrados */
	public async GetAllTenants(): ApiResponse<SelectTenants[]> {
		try {
			this._logger.Activity("GetAllTenants");

			const [error, data] = await this._tenantsInternalRepository.GetAll();

			if (error) {
				throw new InternalServerException("GetAllTenants", "internal-error", this._applicationContext, __filename, error);
			}

			return new ApplicationResponse<SelectTenants[]>(
				this._applicationContext,
				HttpStatusMessage.OK,
				data ?? []
			);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetAllTenants", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetAllTenants",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Obtiene un tenant según su proyectKey y su tenantKey */
	public async GetTenantByKey(tenantKey: string): ApiResponse<SelectTenants> {
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
			return new ApplicationResponse<SelectTenants>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				tenant
			);

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
	public async GetTenantByCode(tenantCode: string): ApiResponse<SelectTenants> {
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
			return new ApplicationResponse<SelectTenants>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				tenant
			);

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
	public async GetTenantByDomainName(domainName: string): ApiResponse<SelectTenants> {
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
			return new ApplicationResponse<SelectTenants>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				tenant
			);

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
	public async GetTenantDetailsByTenantKey(tenantKey: string): ApiResponse<SelectTenantDetails> {
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
			return new ApplicationResponse<SelectTenantDetails>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				tenantDetail
			);
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
	public async GetTenantConnectionByKey(tenantKey: string): ApiResponse<SelectTenantConnection> {
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
			return new ApplicationResponse<SelectTenantConnection>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				data
			);
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

	public async GetTenantConnectionViewByKey(tenantKey: string): ApiResponse<SelectTenantConnectionView> {
		try {
			this._logger.Activity("GetTenantConnectionViewByKey");

			/** Obtenemos el detalle de la configuración del tenant  */
			const data = await this._tenantConnectionsInternalRepository.GetTenantConnectionViewByKey(tenantKey);

			/** Devolvemos el detalle del tenant */
			return new ApplicationResponse<SelectTenantConnectionView>(
				this._applicationContext,
				HttpStatusMessage.Accepted,
				data
			);
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
			const decrypt = await this.EncryptDecryptConnectionString(connectionData.connection, true);

			return {
				/** Tipo de base de datos */
				type: connectionData.database_type,

				/** Cadena de conección. reemplazamos todas las comillas por espacio vacío */
				connectionString: decrypt.data ?? "",

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

	/** Método que nos permite agregar un tenant */
	public async AddTenant(tenant: TenantDTO): ApiResponse<TenantDTO> {
		try {
			this._logger.Activity("AddTenant");

			/** Validamos la información ingresada */
			const validation = TenantDTO.Validate(tenant);

			/** Validamos que los datos  del tenant ingresado sean validos */
			if (!validation.isValid) {
				throw new ValidationException("AddTenant", validation.errorData, this._applicationContext, __filename);
			}

			const [transError, transResult] = await this._transaction.Start(async (builder, trans) => {

				await builder.SetWorkingRepositorys(trans, [
					this._tenantsInternalRepository,
					this._tenantConnectionsInternalRepository,
					this._tenantDetailsInternalRepository,
					this._proyectsInternalRepostory
				]);

				const [errProyect, findProyect] = await this._proyectsInternalRepostory.Find(["proyect_key", "=", tenant.proyectKey])
				if(errProyect) throw errProyect;

				if(!findProyect){
					throw new NotFoundException("AddTenant", [tenant.proyectKey], this._applicationContext, __filename);
				}

				/** Creamos el tenant */
				const [errCreatedTenant, createdTenant] = await this._tenantsInternalRepository.Create(TenantDTO.toTenantModel(tenant));
				if (errCreatedTenant) throw errCreatedTenant;

				const [errTenantDetail] = await this._tenantDetailsInternalRepository.Create(TenantDTO.toTenantDetail(tenant));
				if (errTenantDetail) throw errTenantDetail;

				const [errTenantConn] = await this._tenantConnectionsInternalRepository.Create(TenantDTO.toTenantConnectionModel(tenant));
				if (errTenantConn) throw errTenantConn;

				if (!createdTenant) {
					throw new InternalServerException("AddTenant", "tenant-error", this._applicationContext, __filename);
				}

				return createdTenant;
			});

			if (transError) throw transError;

			tenant.id = transResult?.id;

			return new ApplicationResponse(
				this._applicationContext,
				HttpStatusMessage.Created,
				tenant
			);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "AddTenant", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"AddTenant",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Método que nos permite actualizar un tenant */
	public async UpdateTenant(tenant: TenantDTO): ApiResponse<TenantDTO> {
		try {
			this._logger.Activity("UpdateTenant");

			/** Validamos la información ingresada */
			const validation = TenantDTO.Validate(tenant);

			/** Validamos que los datos  del tenant ingresado sean validos */
			if (!validation.isValid) {
				throw new ValidationException("UpdateTenant", validation.errorData, this._applicationContext, __filename);
			}

			/** Ejecutamos la transacción */
			const [transError] = await this._transaction.Start(async (builder, trans) => {

				await builder.SetWorkingRepositorys(trans, [
					this._tenantsInternalRepository,
					this._tenantConnectionsInternalRepository,
					this._tenantDetailsInternalRepository,
					this._proyectsInternalRepostory
				]);

				const [errProyect, findProyect] = await this._proyectsInternalRepostory.Find(["proyect_key", "=", tenant.proyectKey])
				if(errProyect) throw errProyect;

				if(!findProyect){
					throw new NotFoundException("UpdateTenant", [tenant.proyectKey], this._applicationContext, __filename);
				}

				/** Creamos el tenant */
				const [errUpdatedTenant] = await this._tenantsInternalRepository.UpdateBy(
					["tenant_key", "=", tenant.tenantKey], 
					TenantDTO.toTenantModel(tenant)
				);

				if (errUpdatedTenant) throw errUpdatedTenant;

				const [errTenantDetail] = await this._tenantDetailsInternalRepository.UpdateBy(
					["tenant_key", "=", tenant.tenantKey], 
					TenantDTO.toTenantDetail(tenant)
				);

				if (errTenantDetail) throw errTenantDetail;

				const [errTenantConn] = await this._tenantConnectionsInternalRepository.UpdateBy(
					["tenant_key", "=", tenant.tenantKey], 
					TenantDTO.toTenantConnectionModel(tenant)
				);

				if (errTenantConn) throw errTenantConn;
			});

			/** Lanzamos si ocurre un error en la transacción */
			if (transError) throw transError;

			return new ApplicationResponse(
				this._applicationContext,
				HttpStatusMessage.Updated,
				tenant
			);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "UpdateTenant", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"UpdateTenant",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Permite eliminar un tenant por su key */
	public async DeleteTenantByKey(tenantKey: string): ApiResponse<boolean> {
		try {
			this._logger.Activity("UpdateTenant");

			/** Ejecutamos la transacción */
			const [transError] = await this._transaction.Start(async (builder, trans) => {

				await builder.SetWorkingRepositorys(trans, [
					this._tenantsInternalRepository,
					this._tenantConnectionsInternalRepository,
					this._tenantDetailsInternalRepository
				]);

				/** Validamos que el tenant exista */
				const [errFind, find] = await this._tenantsInternalRepository.Find(["tenant_key", "=", tenantKey]);
				if(errFind || !find){
					throw new NotFoundException("DeleteTenantByKey", [tenantKey], this._applicationContext, __filename);
				}

				/** Eliminamos el tenant */
				const [errTenant] = await this._tenantsInternalRepository.DeleteBy(["tenant_key", "=", tenantKey]);
				if(errTenant) throw errTenant;
				
				/** Eliminamos el tenant connection */
				const [errTenantConn] = await this._tenantConnectionsInternalRepository.DeleteBy(["tenant_key", "=", tenantKey]);
				if(errTenantConn) throw errTenantConn;

				/** Eliminamos el tenantDetail */
				const [errTenantDetail] = await this._tenantDetailsInternalRepository.DeleteBy(["tenant_key", "=", tenantKey]);
				if(errTenantDetail) throw errTenantDetail;

			});

			/** Lanzamos si ocurre un error en la transacción */
			if (transError) throw transError;

			return new ApplicationResponse(
				this._applicationContext,
				HttpStatusMessage.Deleted,
				true
			);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "UpdateTenant", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"UpdateTenant",
				"internal-error",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

}