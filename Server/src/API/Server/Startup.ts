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
import ApiValidationMiddleware from "../../JFramework/Middlewares/ApiValidationMiddleware";
import EncrypterManager from "../../JFramework/Managers/EncrypterManager";
import IEncrypterManager from "../../JFramework/Managers/Interfaces/IEncrypterManager";
import ITokenManager from "../../JFramework/Managers/Interfaces/ITokenManager";
import TokenManager from "../../JFramework/Managers/TokenManager";
import IAuthenticationService from "../../Application/Services/Interfaces/IAuthenticationService";
import AuthenticationService from "../../Application/Services/AuthenticationService";
import ImageStrategyDirector from "../../JFramework/Strategies/Image/ImageStrategyDirector";
import { CloudinaryImageStrategy } from "../../JFramework/Strategies/Image/CloudinaryImageStrategy";
import EmailManager from "../../JFramework/Managers/EmailManager";
import IEmailManager from "../../JFramework/Managers/Interfaces/IEmailManager";
import { EmailDataManager } from "../../JFramework/Managers/EmailDataManager";
import { IEmailDataManager } from "../../JFramework/Managers/Interfaces/IEmailDataManager";
import { FileManager } from "../../JFramework/Managers/FileManager";
import IFileManager from "../../JFramework/Managers/Interfaces/IFileManager";
import EmailTemplateManager from "../../JFramework/Managers/EmailTemplateManager";
import { IEmailTemplateManager } from "../../JFramework/Managers/Interfaces/IEmailTemplateManager";
import MssSqlTransactionBuilder from "../../Infraestructure/Repositories/Generic/MssSqlTransactionBuilder";

export default class Startup implements IApplicationStart {
  
  /** Instancia del DatabaseStrategyDirector, el cual nos permite 
   * manipular la conección con la base de datos */
  private _databaseManager: DatabaseStrategyDirector<any, any> | null = null;

  // Permite configurar la configuración del servidor
  Configuration = async (config: ServerConfig) : Promise<void> => {
    config.AddCors();
    config.AddJsonResponse();
  }

  // Configura los servicios de la aplicación
  ConfigurationServices = async (services: ServiceManager) : Promise<void> => {
    
    /** ApplicationContext */
    services.AddAplicationContext();

    /** DatabaseManager | Se establece la conección con la BD */
    services.AddDataBaseConnection(this._databaseManager, SqlConnectionStrategy);
   
    /** API Validation */
    services.AddApiValidation(new ApiValidationMiddleware(services));

    // Instancia los controladores
    services.AddControllers();
 
    // Middlewares
    services.AddMiddleware(new ErrorHandlerMiddleware(services));

    // Strategys
    services.AddStrategy("imageDirector", ImageStrategyDirector, CloudinaryImageStrategy);

    // Builders
    services.AddService<MssSqlTransactionBuilder>("sqlTransaction", MssSqlTransactionBuilder);

    // Managers
    services.AddService<IEncrypterManager, EncrypterManager>("encrypterManager", EncrypterManager);
    services.AddService<ITokenManager, TokenManager>("tokenManager", TokenManager);
    services.AddService<IEmailManager, EmailManager>("emailManager", EmailManager);
    services.AddService<IEmailDataManager, EmailDataManager>("emailDataManager", EmailDataManager);
    services.AddService<IEmailTemplateManager, EmailTemplateManager>("emailTemplateManager", EmailTemplateManager);
    services.AddService<IFileManager, FileManager>("fileManager", FileManager);

    // Servicios
    services.AddService<ITestService, TestService>("testService", TestService);
    services.AddService<IAuthenticationService, AuthenticationService>("authenticationService", AuthenticationService);

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