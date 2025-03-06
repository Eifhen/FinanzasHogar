import AuthenticationService from "../../Application/Services/AuthenticationService";
import IAuthenticationService from "../../Application/Services/Interfaces/IAuthenticationService";
import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import TestService from "../../Application/Services/TestService";
import IAhorrosSqlRepository from "../../Dominio/Repositories/IAhorrosSqlRepository";
import ICategoriasSqlRepository from "../../Dominio/Repositories/ICategoriasSqlRepository";
import ICuentasSqlRepository from "../../Dominio/Repositories/ICuentasSqlRepository";
import IDeudasSqlRepository from "../../Dominio/Repositories/IDeudasSqlRepository";
import IHistorialCambiosHogarSqlRepository from "../../Dominio/Repositories/IHistorialCambiosHogarSqlRepository";
import IHogaresSqlRepository from "../../Dominio/Repositories/IHogaresSqlRepository";
import IMetasSqlRepository from "../../Dominio/Repositories/IMetasSqlRepository";
import INotificacionesSqlRepository from "../../Dominio/Repositories/INotificacionesSqlRepository";
import IPagosDeudaSqlRepository from "../../Dominio/Repositories/IPagosDeudaSqlRepository";
import IPresupuestoCategoriaSqlRepository from "../../Dominio/Repositories/IPresupuestoCategoriaSqlRepository";
import IRolesSqlRepository from "../../Dominio/Repositories/IRolesSqlRepository";
import ISolicitudHogarSqlRepository from "../../Dominio/Repositories/ISolicitudHogarSqlRepository";
import ITransaccionesSqlRepository from "../../Dominio/Repositories/ITransaccionesSqlRepository";
import IUsuarioHogarSqlRepository from "../../Dominio/Repositories/IUsuarioHogarSqlRepository";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import AhorrosSqlRepository from "../../Infraestructure/Repositories/AhorrosSqlRepository";
import CategoriasSqlRepository from "../../Infraestructure/Repositories/CategoriasSqlRepository";
import CuentasSqlRepository from "../../Infraestructure/Repositories/CuentasSqlRepository";
import DeudasSqlRepository from "../../Infraestructure/Repositories/DeudasSqlRepository";
import HistorialCambiosHogarSqlRepository from "../../Infraestructure/Repositories/HistorialCambiosHogarSqlRepository";
import HogaresSqlRepository from "../../Infraestructure/Repositories/HogaresSqlRepository";
import MetasSqlRepository from "../../Infraestructure/Repositories/MetasSqlRepository";
import NotificacionesSqlRepository from "../../Infraestructure/Repositories/NotificacionesSqlRepository";
import PagosDeudaSqlRepository from "../../Infraestructure/Repositories/PagosDeudaSqlRepository";
import PresupuestoCategoriaSqlRepository from "../../Infraestructure/Repositories/PresupuestoCategoriaSqlRepository";
import RolesSqlRepository from "../../Infraestructure/Repositories/RolesSqlRepository";
import SolicitudHogarSqlRepository from "../../Infraestructure/Repositories/SolicitudHogarSqlRepository";
import TransaccionesSqlRepository from "../../Infraestructure/Repositories/TransaccionesSqlRepository";
import UsuarioHogarSqlRepository from "../../Infraestructure/Repositories/UsuarioHogarSqlRepository";
import UsuariosSqlRepository from "../../Infraestructure/Repositories/UsuariosSqlRepository";
import IServiceManager from "../../JFramework/_Internal/Interfaces/IServiceManager";
import IStartup, { IStartupDependencies } from "../../JFramework/_Internal/Interfaces/IStartup";
import ILoggerManager from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import ApiValidationMiddleware from "../../JFramework/Middlewares/ApiValidationMiddleware";
import ConfigurationSettings from "../../JFramework/Configurations/ConfigurationSettings";
import IServerConfiguration from "../../JFramework/_Internal/Interfaces/IServerConfiguration";


export default class Startup implements IStartup {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Manejador de servicios */
	private readonly _serviceManager: IServiceManager;

	/** Configuracion del servidor */
	private readonly _serverConfiguration: IServerConfiguration;

	/** Configuraciones del sistema */
	private readonly _configurationSettings: ConfigurationSettings;


	constructor(deps: IStartupDependencies) {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "CONFIGURATION",
			entityName: "Startup"
		});

		this._serviceManager = deps.serviceManager;
		this._serverConfiguration = deps.serverConfiguration;
		this._configurationSettings = deps.configurationSettings;
	}

	/** Administramos la configuración inicial del servidor */
	public async AddConfiguration(): Promise<void> {
		try {
			this._logger.Activity("AddConfiguration");

			/** Agregamos el contexto de aplicación */
			this._serviceManager.AddAplicationContext();

			/** Agregamos el contenedor de dependencias */
			this._serverConfiguration.AddContainer();

			/** Agregamos la configuración de cors */
			this._serverConfiguration.AddCorsConfiguration();

			/** Parsea la respuesta a json */
			this._serverConfiguration.AddJsonResponseConfiguration();

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddConfiguration", err);
			throw err;
		}
	}

	/** Implementa los servicios de configuración de seguridad */
	public async AddSecurityConfiguration(): Promise<void> {
		try {
			this._logger.Activity("AddSecurityConfiguration");

			this._serverConfiguration.AddRateLimiters();

		} catch (err: any) {
			this._logger.Error("FATAL", "AddSecurityConfiguration", err);
			throw err;
		}
	}

	/** Implementa los middlewares globales de la aplicación */
	public async AddBusinessMiddlewares(): Promise<void> {
		try {
			this._logger.Activity("AddBusinessMiddlewares");

			/** Middleware para validación del apiKey */
			this._serviceManager.AddMiddleware(ApiValidationMiddleware);

			/** Agregamos los controladores */
			this._serviceManager.AddControllers();

		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessMiddlewares", err);
			throw err;
		}
	}

	/** Agrega los repositorios de la aplicación */
	public async AddBusinessRepositories(): Promise<void> {
		try {
			this._logger.Activity("AddBusinessRepositories");

			this._serviceManager.AddService<IAhorrosSqlRepository, AhorrosSqlRepository>("ahorrosRepository", AhorrosSqlRepository);
			this._serviceManager.AddService<ICategoriasSqlRepository, CategoriasSqlRepository>("categoriasRepository", CategoriasSqlRepository);
			this._serviceManager.AddService<ICuentasSqlRepository, CuentasSqlRepository>("cuentasRepository", CuentasSqlRepository);
			this._serviceManager.AddService<IDeudasSqlRepository, DeudasSqlRepository>("deudasRepository", DeudasSqlRepository);
			this._serviceManager.AddService<IHistorialCambiosHogarSqlRepository, HistorialCambiosHogarSqlRepository>("historialCambiosHogarRepository", HistorialCambiosHogarSqlRepository);
			this._serviceManager.AddService<IHogaresSqlRepository, HogaresSqlRepository>("hogaresRepository", HogaresSqlRepository);
			this._serviceManager.AddService<IMetasSqlRepository, MetasSqlRepository>("metasRepository", MetasSqlRepository);
			this._serviceManager.AddService<INotificacionesSqlRepository, NotificacionesSqlRepository>("notificacionesRepository", NotificacionesSqlRepository);
			this._serviceManager.AddService<IPagosDeudaSqlRepository, PagosDeudaSqlRepository>("pagosDeudaRepository", PagosDeudaSqlRepository);
			this._serviceManager.AddService<IPresupuestoCategoriaSqlRepository, PresupuestoCategoriaSqlRepository>("presupuestoCategoriaRepository", PresupuestoCategoriaSqlRepository);
			this._serviceManager.AddService<IRolesSqlRepository, RolesSqlRepository>("rolesRepository", RolesSqlRepository);
			this._serviceManager.AddService<ISolicitudHogarSqlRepository, SolicitudHogarSqlRepository>("solicitudHogarRepository", SolicitudHogarSqlRepository);
			this._serviceManager.AddService<ITransaccionesSqlRepository, TransaccionesSqlRepository>("transaccionesRepository", TransaccionesSqlRepository);
			this._serviceManager.AddService<IUsuarioHogarSqlRepository, UsuarioHogarSqlRepository>("usuarioHogarRepository", UsuarioHogarSqlRepository);
			this._serviceManager.AddService<IUsuariosSqlRepository, UsuariosSqlRepository>("usuariosRepository", UsuariosSqlRepository);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessRepositories", err);
			throw err;
		}
	}

	/** Agrega los servicios del negocio */
	public async AddBusinessServices(): Promise<void> {
		try {
			this._logger.Activity("AddBusinessServices");

			this._serviceManager.AddService<ITestService, TestService>("testService", TestService);
			this._serviceManager.AddService<IAuthenticationService, AuthenticationService>("authenticationService", AuthenticationService);
 
		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessServices", err);
			throw err;
		}
	}

}