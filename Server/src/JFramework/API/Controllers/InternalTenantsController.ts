import { DELETE, GET, POST, PUT, route } from "awilix-express";
import ApplicationContext from "../../Configurations/ApplicationContext";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import IInternalTenantService from "../Services/Interfaces/IInternalTenantService";
import ApplicationRequest from "../../Helpers/ApplicationRequest";
import { NextFunction, Response } from "express";
import { HttpStatusCode } from "../../Utils/HttpCodes";
import Middlewares from "../../Helpers/Decorators/Middlewares";
import RateLimiterMiddleware from "../../Security/RateLimiter/RateLimiterMiddleware";
import CsrfValidationMiddleware from "../../Middlewares/CsrfValidationMiddleware";
import EncryptDTO from "../DataAccess/DTOs/EncryptDTO";
import { ValidationException } from "../../ErrorHandling/Exceptions";
import TenantDTO from "../DataAccess/DTOs/TenantDTO";


interface InternalTenantsControllerDependencies {
	applicationContext: ApplicationContext;
	internalTenantService: IInternalTenantService;
}

@route("/tenants")
@Middlewares([CsrfValidationMiddleware])
export default class InternalTenantsController {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de applicación */
	private readonly _applicationContext: ApplicationContext;

	/** Servicio manejador de tenants */
	private readonly _internalTenantService: IInternalTenantService;

	constructor(deps: InternalTenantsControllerDependencies) {

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "CONTROLLER",
			entityName: "InternalTenantsController"
		});

		/** Agregamos el contexto de applicación */
		this._applicationContext = deps.applicationContext;

		/** Agregamos el servicio manejador de tenants */
		this._internalTenantService = deps.internalTenantService;
	}

	@route("/all")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetAllTenants(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetAllTenants");

			const data = await this._internalTenantService.GetAllTenants();

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetAllTenants", err);
			return next(err);
		}
	}

	/** Obtiene un tenant según su proyectKey y su tenantKey */
	@route("/:tenant_key")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetTenantByKey(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetTenantByKey");

			const tenantKey = req.params.tenant_key;

			const data = await this._internalTenantService.GetTenantByKey(tenantKey);

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetTenantByKey", err);
			return next(err);
		}
	}

	/** Obtiene un tenant según su proyectKey y su tenantCode */
	@route("/code/:tenant_code")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetTenantByCode(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetTenantByCode");

			const tenantCode = req.params.tenant_code;

			const data = await this._internalTenantService.GetTenantByCode(tenantCode);

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetTenantByCode", err);
			return next(err);
		}
	}

	/** Obtiene un tenant según su proyectKey y su nombre de dominio */
	@route("/domain")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetTenantByDomain(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetTenantByDomain");

			const domainName = req.hostname;

			const data = await this._internalTenantService.GetTenantByDomainName(domainName);

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetTenantByDomain", err);
			return next(err);
		}
	}

	@route("/")
	@POST()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async AddTenant(req: ApplicationRequest<TenantDTO>, res: Response, next: NextFunction){
		try {
			this._logger.Activity("AddTenant");

			const tenant = req.body;
			const data = await this._internalTenantService.AddTenant(tenant);

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "AddTenant", err);
			return next(err);
		}
	}

	@route("/")
	@PUT()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async UpdateTenant(req: ApplicationRequest<TenantDTO>, res: Response, next: NextFunction){
		try {
			this._logger.Activity("UpdateTenant");

			const tenant = req.body;
			const data = await this._internalTenantService.UpdateTenant(tenant);

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "UpdateTenant", err);
			return next(err);
		}
	}

	@route("/:tenantKey")
	@DELETE()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async DeleteTenant(req: ApplicationRequest<string>, res: Response, next: NextFunction){
		try {
			this._logger.Activity("UpdateTenant");

			const tenantKey = req.params.tenantKey;
			const data = await this._internalTenantService.DeleteTenantByKey(tenantKey);

			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "UpdateTenant", err);
			return next(err);
		}
	}

	/** Endpoint que permite encryptar una cadena de conexión */
	@route("/connection/encrypt")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async EncryptConnectionString(req: ApplicationRequest<EncryptDTO>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("EncryptConnectionString");

			const data = req.body;

			const validate = EncryptDTO.Validate(data);
			if (!validate.isValid) {
				throw new ValidationException(
					"EncryptConnectionString",
					validate.errorData,
					this._applicationContext,
					__filename,
					validate.innerError
				);
			}

			const result = await this._internalTenantService.EncryptDecryptConnectionString(data.connectionString, false);

			return res.status(HttpStatusCode.OK).send(result);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "EncryptConnectionString", err);
			return next(err);
		}
	}

	/** Endpoint que permite desencryptar una cadena de conexión */
	@route("/connection/decrypt")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async DecryptConnectionString(req: ApplicationRequest<EncryptDTO>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("DecryptConnectionString");

			const data = req.body;

			const validate = EncryptDTO.Validate(data);
			if (!validate.isValid) {
				throw new ValidationException(
					"EncryptConnectionString",
					validate.errorData,
					this._applicationContext,
					__filename,
					validate.innerError
				);
			}

			const result = await this._internalTenantService.EncryptDecryptConnectionString(data.connectionString, true);

			return res.status(HttpStatusCode.OK).send(result);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "DecryptConnectionString", err);
			return next(err);
		}
	}

}