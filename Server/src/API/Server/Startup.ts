import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import TestService from "../../Application/Services/TestService";
import ServerConfig from "../../JFramework/Configurations/ServerConfig";
import ServiceManager from "../../JFramework/Managers/ServiceManager";
import SqlConnectionStrategy from "../../JFramework/Strategies/Database/SqlConnectionStrategy";
import DatabaseStrategyDirector from "../../JFramework/Strategies/Database/DatabaseStrategyDirector";
import IApplicationStart from "../../JFramework/Application/types/IApplicationStart";
import ErrorHandlerMiddleware from "../../JFramework/ErrorHandling/ErrorHandlerMiddleware";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import UsuariosSqlRepository from "../../Infraestructure/Repositories/UsuariosSqlRepository";
import IErrorManager from "../../JFramework/ErrorHandling/Interfaces/IErrorManager";
import ErrorManager from "../../JFramework/ErrorHandling/ErrorManager";
import IAhorrosSqlRepository from "../../Dominio/Repositories/IAhorrosSqlRepository";
import ICategoriasSqlRepository from "../../Dominio/Repositories/ICategoriasSqlRepository";
import ICuentasSqlRepository from "../../Dominio/Repositories/ICuentasSqlRepository";
import AhorrosSqlRepository from "../../Infraestructure/Repositories/AhorrosSqlRepository";
import CategoriasSqlRepository from "../../Infraestructure/Repositories/CategoriasSqlRepository";
import CuentasSqlRepository from "../../Infraestructure/Repositories/CuentasSqlRepository";
import IDeudasSqlRepository from "../../Dominio/Repositories/IDeudasSqlRepository";
import DeudasSqlRepository from "../../Infraestructure/Repositories/DeudasSqlRepository";
import IHistorialCambiosHogarSqlRepository from "../../Dominio/Repositories/IHistorialCambiosHogarSqlRepository";
import HistorialCambiosHogarSqlRepository from "../../Infraestructure/Repositories/HistorialCambiosHogarSqlRepository";
import IHogaresSqlRepository from "../../Dominio/Repositories/IHogaresSqlRepository";
import HogaresSqlRepository from "../../Infraestructure/Repositories/HogaresSqlRepository";
import IMetasSqlRepository from "../../Dominio/Repositories/IMetasSqlRepository";
import MetasSqlRepository from "../../Infraestructure/Repositories/MetasSqlRepository";
import INotificacionesSqlRepository from "../../Dominio/Repositories/INotificacionesSqlRepository";
import NotificacionesSqlRepository from "../../Infraestructure/Repositories/NotificacionesSqlRepository";
import IPagosDeudaSqlRepository from "../../Dominio/Repositories/IPagosDeudaSqlRepository";
import PagosDeudaSqlRepository from "../../Infraestructure/Repositories/PagosDeudaSqlRepository";
import IPresupuestoCategoriaSqlRepository from "../../Dominio/Repositories/IPresupuestoCategoriaSqlRepository";
import PresupuestoCategoriaSqlRepository from "../../Infraestructure/Repositories/PresupuestoCategoriaSqlRepository";
import IRolesSqlRepository from "../../Dominio/Repositories/IRolesSqlRepository";
import RolesSqlRepository from "../../Infraestructure/Repositories/RolesSqlRepository";
import SolicitudHogarSqlRepository from "../../Infraestructure/Repositories/SolicitudHogarSqlRepository";
import ISolicitudHogarSqlRepository from "../../Dominio/Repositories/ISolicitudHogarSqlRepository";
import ITransaccionesSqlRepository from "../../Dominio/Repositories/ITransaccionesSqlRepository";
import TransaccionesSqlRepository from "../../Infraestructure/Repositories/TransaccionesSqlRepository";
import IUsuarioHogarSqlRepository from "../../Dominio/Repositories/IUsuarioHogarSqlRepository";
import UsuarioHogarSqlRepository from "../../Infraestructure/Repositories/UsuarioHogarSqlRepository";
import ApplicationContextMiddleware from "../../JFramework/Middlewares/ApplicationContextMiddleware";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";



export default class Startup implements IApplicationStart {
 
  private _databaseManager: DatabaseStrategyDirector<any, any> | null = null;

  // Permite configurar la configuración del servidor
  Configuration = async (config: ServerConfig) : Promise<void> => {
    config.AddCors();
    config.AddJsonResponse();
  }

  // Configura los servicios de la aplicación
  ConfigurationServices = async (services: ServiceManager) : Promise<void> => {
    
    /** Se establece la conección con la BD */
    services.AddDataBaseConnection(this._databaseManager, new SqlConnectionStrategy());
    
    // services.AddAuthorization();

    // services.AddAuthentication();
    
    services.AddAplicationContext(new ApplicationContextMiddleware((context)=> {
      services.AddInstance("applicationContext", context);
    }));
    
    // Instancia los controladores
    services.AddControllers();
 
    // Middlewares
    services.AddMiddleware(new ErrorHandlerMiddleware());

    // Managers
    // services.AddService<ApplicationContext>("applicationContext", ApplicationContext);
    services.AddService<IErrorManager, ErrorManager>("errorManager", ErrorManager);

    // Servicios
    services.AddService<ITestService, TestService>("testService", TestService);

    // Repositorios
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
    
  }

  // Ejecuta en el momento que se genera un error grave en el sistema
  OnApplicationCriticalException(data:any): void {
    
    // Cierra la conexión a la base de datos si ocurre un error critico
    this._databaseManager?.CloseConnection();
  }

}