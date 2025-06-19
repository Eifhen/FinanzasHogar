import { EmailDataManager } from "../../Application/Email/EmailDataManager";
import EmailTemplateManager from "../../Application/Email/EmailTemplateManager";
import { IEmailDataManager } from "../../Application/Email/Interfaces/IEmailDataManager";
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
import AhorrosSqlRepository from "../../Infraestructure/DataBase/Repositories/AhorrosSqlRepository";
import CategoriasSqlRepository from "../../Infraestructure/DataBase/Repositories/CategoriasSqlRepository";
import CuentasSqlRepository from "../../Infraestructure/DataBase/Repositories/CuentasSqlRepository";
import DeudasSqlRepository from "../../Infraestructure/DataBase/Repositories/DeudasSqlRepository";
import HistorialCambiosHogarSqlRepository from "../../Infraestructure/DataBase/Repositories/HistorialCambiosHogarSqlRepository";
import HogaresSqlRepository from "../../Infraestructure/DataBase/Repositories/HogaresSqlRepository";
import MetasSqlRepository from "../../Infraestructure/DataBase/Repositories/MetasSqlRepository";
import NotificacionesSqlRepository from "../../Infraestructure/DataBase/Repositories/NotificacionesSqlRepository";
import PagosDeudaSqlRepository from "../../Infraestructure/DataBase/Repositories/PagosDeudaSqlRepository";
import PresupuestoCategoriaSqlRepository from "../../Infraestructure/DataBase/Repositories/PresupuestoCategoriaSqlRepository";
import RolesSqlRepository from "../../Infraestructure/DataBase/Repositories/RolesSqlRepository";
import SolicitudHogarSqlRepository from "../../Infraestructure/DataBase/Repositories/SolicitudHogarSqlRepository";
import TransaccionesSqlRepository from "../../Infraestructure/DataBase/Repositories/TransaccionesSqlRepository";
import UsuarioHogarSqlRepository from "../../Infraestructure/DataBase/Repositories/UsuarioHogarSqlRepository";
import UsuariosSqlRepository from "../../Infraestructure/DataBase/Repositories/UsuariosSqlRepository";
import BusinessTranslatorProvider from "../../Infraestructure/Translations/BusinessTranslatorProvider";
import ConfigurationSettings from "../../JFramework/Configurations/ConfigurationSettings";
import IServerConfigurationManager from "../../JFramework/Configurations/Interfaces/IServerConfigurationManager";
import IServiceManager from "../../JFramework/Configurations/Interfaces/IServiceManager";
import IStartup, { IStartupDependencies } from "../../JFramework/Configurations/Interfaces/IStartup";
import { IEmailTemplateManager } from "../../JFramework/Managers/Interfaces/IEmailTemplateManager";
import ILoggerManager from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import ApiValidationMiddleware from "../../JFramework/Middlewares/ApiValidationMiddleware";
import TenantResolverMiddleware from "../../JFramework/Middlewares/TenantResolverMiddleware";


export default class Startup implements IStartup {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Manejador de servicios */
	private readonly _serviceManager: IServiceManager;

	/** Configuracion del servidor */
	private readonly _serverConfigurationManager: IServerConfigurationManager;

	/** Configuraciones del sistema */
	private readonly _configurationSettings: ConfigurationSettings;

	constructor(deps: IStartupDependencies) {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "CONFIGURATION",
			entityName: "Startup"
		});

		this._serviceManager = deps.serviceManager;
		this._serverConfigurationManager = deps.serverConfigurationManager;
		this._configurationSettings = deps.configurationSettings;
	}

	/** Administramos la configuración inicial del servidor */
	public async AddConfiguration(): Promise<void> {
		try {
			this._logger.Activity("AddConfiguration");

			/** Agregamos el contexto de aplicación */
			this._serviceManager.AddAplicationContext({
				settings: this._configurationSettings,
				businessTranslatorProvider: BusinessTranslatorProvider
			});

			/** Agregamos el contenedor de dependencias */
			this._serverConfigurationManager.AddContainer();

			/** Agregamos la configuración de cors */
			this._serverConfigurationManager.AddCorsConfiguration();

			/** Parsea la respuesta a json */
			this._serverConfigurationManager.AddJsonResponseConfiguration();

			/** Agrega el cookie-parser como middleware y establece la firma de las cookies */
			await this._serverConfigurationManager.AddCookieConfiguration();
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
			
			/** Middleware para validación del apiKey */
			this._serviceManager.AddMiddleware(ApiValidationMiddleware);

			/** Middleware para resolver el Tenant de la request */
		  //	this._serviceManager.AddMiddleware(TenantResolverMiddleware);

			/** Middleware para validación de token Csrf Este token debe ser aplicado por ruta */
			// this._serviceManager.AddMiddleware(CsrfValidationMiddleware);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddSecurityConfiguration", err);
			throw err;
		}
	}

	/** Implementa los middlewares globales de la aplicación */
	public async AddBusinessMiddlewares(): Promise<void> {
		try {
			this._logger.Activity("AddBusinessMiddlewares");

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
			this._serviceManager.AddService<IEmailDataManager, EmailDataManager>("emailDataManager", EmailDataManager);
			this._serviceManager.AddService<IEmailTemplateManager, EmailTemplateManager>("emailTemplateManager", EmailTemplateManager);

			this._serviceManager.AddService<ITestService, TestService>("testService", TestService);
			this._serviceManager.AddService<IAuthenticationService, AuthenticationService>("authenticationService", AuthenticationService);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessServices", err);
			throw err;
		}
	}

}