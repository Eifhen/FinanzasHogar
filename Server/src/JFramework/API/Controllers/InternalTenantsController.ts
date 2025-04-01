import { GET, route } from "awilix-express";
import ApplicationContext from "../../Configurations/ApplicationContext";
import ILoggerManager, { LoggerTypes } from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import IInternalTenantService from "../Services/Interfaces/IInternalTenantService";
import ApplicationRequest from "../../Helpers/ApplicationRequest";
import { NextFunction, Response } from "express";
import { ApplicationResponse } from "../../Helpers/ApplicationResponse";
import { HttpStatusCode, HttpStatusMessage } from "../../Utils/HttpCodes";
import Middlewares from "../../Helpers/Decorators/Middlewares";
import RateLimiterMiddleware from "../../Security/RateLimiter/RateLimiterMiddleware";
import CsrfValidationMiddleware from "../../Security/CSRF/CsrfValidationMiddleware";


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

	/** Obtiene un tenant según su proyectKey y su tenantKey */
	@route("/:tenant_key")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetTenantByKey(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetTenantByKey");

			const tenantKey = req.params.tenant_key;

			const data = await this._internalTenantService.GetTenantByKey(tenantKey);

			return res.status(HttpStatusCode.OK).send(
				new ApplicationResponse(
					this._applicationContext,
					HttpStatusMessage.OK,
					data
				)
			);
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

			return res.status(HttpStatusCode.OK).send(
				new ApplicationResponse(
					this._applicationContext,
					HttpStatusMessage.OK,
					data
				)
			);
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

			return res.status(HttpStatusCode.OK).send(
				new ApplicationResponse(
					this._applicationContext,
					HttpStatusMessage.OK,
					data
				)
			);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "GetTenantByDomain", err);
			return next(err);
		}
	}

}