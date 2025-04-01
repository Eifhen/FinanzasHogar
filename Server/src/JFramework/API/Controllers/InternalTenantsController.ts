import { route } from "awilix-express";
import ApplicationContext from "../../Configurations/ApplicationContext";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import IInternalTenantService from "../Services/Interfaces/IInternalTenantService";





interface InternalTenantsControllerDependencies {
	applicationContext: ApplicationContext;
	internalTenantService: IInternalTenantService;
}

@route("/tenants")
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

	


}