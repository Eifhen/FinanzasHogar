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
import IServiceManager from "../../JFramework/_Internal/types/IServiceManager";
import IStartup from "../../JFramework/_Internal/types/IStartup";
import ServerConfig from "../../JFramework/_Internal/ServerConfig";
import ILoggerManager from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import ApiValidationMiddleware from "../../JFramework/Middlewares/ApiValidationMiddleware";


export default class Startup implements IStartup {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	constructor() {
		/** Instancia logger */
		this._logger = new LoggerManager({
			entityCategory: "CONFIGURATION",
			entityName: "Startup"
		});
	}

	/** Administramos la configuración inicial del servidor */
	public async AddConfiguration(services: IServiceManager, config: ServerConfig): Promise<void> {
		try {
			this._logger.Activity("AddConfiguration");

			/** Agregamos el contexto de aplicación */
			services.AddAplicationContext();

			/** Agregamos el contenedor de dependencias */
			services.AddContainer();

			/** Agregamos la configuración de cors */
			config.AddCors();

			/** Parsea la respuesta a json */
			config.AddJsonResponse();

		}
		catch (err: any) {
			this._logger.Error("FATAL", "AddConfiguration", err);
			throw err;
		}
	}

	/** Implementa los servicios de configuración de seguridad */
	public async AddSecurityConfiguration(services: IServiceManager): Promise<void> {
		try {
			this._logger.Activity("AddSecurityConfiguration");

			services.AddRateLimiters();

		} catch (err: any) {
			this._logger.Error("FATAL", "AddSecurityConfiguration", err);
			throw err;
		}
	}

	/** Implementa los middlewares globales de la aplicación */
	public async AddBusinessMiddlewares(services: IServiceManager): Promise<void> {
		try {
			this._logger.Activity("AddBusinessMiddlewares");

			/** Middleware para validación del apiKey */
			services.AddMiddleware(ApiValidationMiddleware);

			/** Agregamos los controladores */
			services.AddControllers();

		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessMiddlewares", err);
			throw err;
		}
	}

	/** Agrega los repositorios de la aplicación */
	public async AddBusinessRepositories(services: IServiceManager): Promise<void> {
		try {
			this._logger.Activity("AddBusinessRepositories");

			services.AddService<IAhorrosSqlRepository, AhorrosSqlRepository>("ahorrosRepository", AhorrosSqlRepository);
			services.AddService<ICategoriasSqlRepository, CategoriasSqlRepository>("categoriasRepository", CategoriasSqlRepository);
			services.AddService<ICuentasSqlRepository, CuentasSqlRepository>("cuentasRepository", CuentasSqlRepository);
			services.AddService<IDeudasSqlRepository, DeudasSqlRepository>("deudasRepository", DeudasSqlRepository);
			services.AddService<IHistorialCambiosHogarSqlRepository, HistorialCambiosHogarSqlRepository>("historialCambiosHogarRepository", HistorialCambiosHogarSqlRepository);
			services.AddService<IHogaresSqlRepository, HogaresSqlRepository>("hogaresRepository", HogaresSqlRepository);
			services.AddService<IMetasSqlRepository, MetasSqlRepository>("metasRepository", MetasSqlRepository);
			services.AddService<INotificacionesSqlRepository, NotificacionesSqlRepository>("notificacionesRepository", NotificacionesSqlRepository);
			services.AddService<IPagosDeudaSqlRepository, PagosDeudaSqlRepository>("pagosDeudaRepository", PagosDeudaSqlRepository);
			services.AddService<IPresupuestoCategoriaSqlRepository, PresupuestoCategoriaSqlRepository>("presupuestoCategoriaRepository", PresupuestoCategoriaSqlRepository);
			services.AddService<IRolesSqlRepository, RolesSqlRepository>("rolesRepository", RolesSqlRepository);
			services.AddService<ISolicitudHogarSqlRepository, SolicitudHogarSqlRepository>("solicitudHogarRepository", SolicitudHogarSqlRepository);
			services.AddService<ITransaccionesSqlRepository, TransaccionesSqlRepository>("transaccionesRepository", TransaccionesSqlRepository);
			services.AddService<IUsuarioHogarSqlRepository, UsuarioHogarSqlRepository>("usuarioHogarRepository", UsuarioHogarSqlRepository);
			services.AddService<IUsuariosSqlRepository, UsuariosSqlRepository>("usuariosRepository", UsuariosSqlRepository);

		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessRepositories", err);
			throw err;
		}
	}

	/** Agrega los servicios del negocio */
	public async AddBusinessServices(services: IServiceManager): Promise<void> {
		try {
			this._logger.Activity("AddBusinessServices");

			services.AddService<ITestService, TestService>("testService", TestService);
			services.AddService<IAuthenticationService, AuthenticationService>("authenticationService", AuthenticationService);
 
		} catch (err: any) {
			this._logger.Error("FATAL", "AddBusinessServices", err);
			throw err;
		}
	}

}