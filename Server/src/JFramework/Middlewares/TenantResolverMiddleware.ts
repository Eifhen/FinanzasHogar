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
import { BadRequestException, DatabaseCommitmentException } from "../ErrorHandling/Exceptions";
import IsNullOrEmpty from "../Utils/utils";



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

			const tenantKey = req.get(this._applicationContext.settings.apiData.headers.tenantTokenHeader)?.trim();
			
			/** Validamos que el tenantKey no esté vacío */
			if(IsNullOrEmpty(tenantKey)){
				throw new BadRequestException("Intercept", "no-tenant", this._applicationContext, __filename);
			}

			/** Obtenemos los datos de conexión del tenant de la request en curso */
			const tenantData = await this._internalTenantService.GetTenantConnectionViewByKey(tenantKey!);
			
			/** Validamos si el proyect_key del tenant ingresado NO es igual al proyect key de la API,
			 * si este error ocurre podria significar que la base de datos ha sido comprometida */
			if(tenantData.proyect_key !== this._applicationContext.settings.apiData.proyect_token){

				// Aqui se podria implementar lógica para banear al usuario
				throw new DatabaseCommitmentException("Intercept", this._applicationContext, __filename);
			}

			/** Mapeamos los Datos de conexión a un objeto que nuestro manager pueda leer*/
			const connData = await this._internalTenantService.GetTenantConnectionConfig(tenantData)

			/** Inicializamos el manager */
			this._multiTenantManager = new MultiTenantConnectionManager({
				applicationContext: this._applicationContext,
				scopedContainerManager: req.container,
				options: {
					databaseType: tenantData.database_type,
					databaseContainerInstanceName: BUSINESS_DATABASE_INSTANCE_NAME,
					strategyOptions: {
						connectionEnvironment: ConnectionEnvironment.BUSINESS,
						connectionData: connData,
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