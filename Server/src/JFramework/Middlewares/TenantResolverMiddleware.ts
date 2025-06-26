import { Response, NextFunction } from "express";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "./Types/MiddlewareTypes";
import ApplicationContext from "../Configurations/ApplicationContext";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import { ConnectionEnvironment } from "../Configurations/Types/IConnectionService";
import { BUSINESS_DATABASE_INSTANCE_NAME } from "../Utils/const";
import { AutoClassBinder } from "../Helpers/Decorators/AutoBind";
import IInternalTenantService from "../API/Services/Interfaces/IInternalTenantService";
import { BadRequestException, DatabaseCommitmentException, DatabaseNoInstanceException } from "../ErrorHandling/Exceptions";
import IsNullOrEmpty from "../Utils/utils";
import DatabaseInstanceManager from "../External/DataBases/DatabaseInstanceManager";
import DatabaseStrategyDirector from "../External/DataBases/Strategies/DatabaseStrategyDirector";



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

	/** Manejador de instancia de base de datos */
	private _databaseInstanceManager: DatabaseInstanceManager | null = null;

	/** Tenant en curso */
	private _tenantKey?:string;

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

			this._tenantKey = req.get(this._applicationContext.settings.apiData.headers.tenantTokenHeader)?.trim();
			const scopedContainer = req.container;

			/** Validamos que el tenantKey no esté vacío */
			if (!this._tenantKey || IsNullOrEmpty(this._tenantKey)) {
				throw new BadRequestException("Intercept", "no-tenant", this._applicationContext, __filename);
			}
			
			/** Obtenemos el instance manager */
			this._databaseInstanceManager = scopedContainer.Resolve<DatabaseInstanceManager>("databaseInstanceManager");
			
			console.log("Contenedor en curso =>", scopedContainer._identifier);
			console.log("DatabaseInstanceManager container =>", this._databaseInstanceManager.containerIdentity);

			/** Validamos si la instancia ya se encuentra en el registro de instancias */
			const isInRegistry = this._databaseInstanceManager.CheckInstance(this._tenantKey);

			/** Si está en el registro entonces buscamos la instancia */
			if (isInRegistry) {
				this._logger.Message("INFO", `El tenatKey ${this._tenantKey} ya se encuentra registrado`);

				/** Obtenemos la instancia de la conexión asociada al strategy de 
				 * conexión esto sería el objeto kysely o mongoclient etc */
				const dbInstance = this._databaseInstanceManager.GetDatabaseInstance(this._tenantKey);

				/** agregamos la instancia al scopedContainer, 
				 * en este punto la conexión ya se encuentra establecida solo es cuestión de meter 
				 * la instancia al container para que los repositorios, servicios y controladores 
				 * la puedan usar. */
				scopedContainer.AddInstance(BUSINESS_DATABASE_INSTANCE_NAME, dbInstance);
			}
			else {
				/** Si no está en el registro entonces creamos una instancia nueva y 
				 * la agregamos al registro de instancias */
				this._logger.Message("INFO", `El tenatKey ${this._tenantKey} NO se encuentra registrado, se procederá a registrarlo.`);

				/** Obtenemos los datos de conexión del tenant de la request en curso */
				const tenant = await this._internalTenantService.GetTenantConnectionViewByKey(this._tenantKey);

				/** Validamos si el proyect_key del tenant ingresado NO es igual al proyect key de la API,
				 * si este error ocurre podria significar que la base de datos ha sido comprometida. 
				 * Aqui se podria implementar lógica para banear al usuario si fuese necesario. */
				if (tenant.proyect_key !== this._applicationContext.settings.apiData.proyect_token) {
					throw new DatabaseCommitmentException("Intercept", this._applicationContext, __filename);
				}

				/** Obtenemos el applicationContext */
				const applicationContext = scopedContainer.Resolve<ApplicationContext>("applicationContext");

				/** Mapeamos los Datos de conexión a un objeto que nuestro manager pueda leer*/
				const connectionData = await this._internalTenantService.GetTenantConnectionConfig(tenant);

				/** Obtenemos el director de estrategias */
				const databaseStrategyDirector = new DatabaseStrategyDirector({ applicationContext });

				/** Obtenemos la entidad de conexión que contiene el connection strategy */
				const entity = databaseStrategyDirector.GetConnectionStrategy({
					connectionEnvironment: ConnectionEnvironment.BUSINESS,
					databaseType: tenant.database_type,
					databaseRegistryName: this._tenantKey, // identificador en el map de conexiones
					databaseContainerInstanceName: BUSINESS_DATABASE_INSTANCE_NAME, // identificador en el container
					connectionData
				});

				/** Validamos que la estrategia se haya creado correctamente */
				if (!entity.strategy) {
					throw new DatabaseNoInstanceException("Intercept", applicationContext, __filename);
				}

				/** Nos conectamos a la base de datos mediante la estrategia de conexión */
				const dbInstance = await entity.strategy.Connect();

				/** Validamos la instancia de conexión: kysely, mongoclient etc */
				if(!dbInstance){
					throw new DatabaseNoInstanceException("Intercept", applicationContext, __filename);
				}

				/** Agregamos la instancia de kysely o mongoclient al scopedContainer
				 * para que nuestros repositorios, servicios y controllers la puedan utilizar */
				scopedContainer.AddInstance(entity.options.databaseContainerInstanceName, dbInstance);
			}

			/** Si todo va bien entonces seguimos adelante */
			return next();
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Intercept", err);

			/** Desconectamos el tenant */
			if(this._tenantKey && !IsNullOrEmpty(this._tenantKey) && this._databaseInstanceManager){
				this._logger.Message("FATAL", `Ha ocurrido un error al intentar conectarse al tenant ${this._tenantKey}`);

				await this._databaseInstanceManager.DisconnectInstance(this._tenantKey).catch(err => {
					this._logger.Message("FATAL", `Ha ocurrido un error al intentar desconectarse del tenant ${this._tenantKey}`, err);
				})
			}

			/** Pasamos el error al middleware de manejo de error */
			return next(err);
		}
	}

}