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
    this._databaseManager = await services.AddDataBaseConnection(new SqlConnectionStrategy());
    
    // services.AddAuthorization();
    
    // services.AddAplicationContext();
    
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
    services.AddService<IUsuariosSqlRepository, UsuariosSqlRepository>("usuariosRepository", UsuariosSqlRepository);
  
    

  }

  // Ejecuta en el momento que se genera un error grave en el sistema
  OnApplicationCriticalException(data:any): void {
    
    // Cierra la conexión a la base de datos si ocurre un error critico
    this._databaseManager?.CloseConnection();
  }

}