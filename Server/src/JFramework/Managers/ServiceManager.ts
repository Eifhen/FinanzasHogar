import { Application, RequestHandler } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { loadControllers, scopePerRequest } from "awilix-express";
import { asClass, asValue, AwilixContainer, createContainer, InjectionMode, Lifetime, LifetimeType } from "awilix";
import { ApplicationMiddleware } from '../Configurations/types/ServerTypes';
import IDBConnectionStrategy from "../Strategies/Database/IDBConnectionStrategy";
import DatabaseStrategyDirector from "../Strategies/Database/DatabaseStrategyDirector";
import { NO_REQUEST_ID } from "../Utils/const";
import { HttpStatusCode, HttpStatusName } from "../Utils/HttpCodes";
import ApplicationException from "../ErrorHandling/ApplicationException";
import { ErrorRequestHandler } from "express-serve-static-core";


export default class ServiceManager {


  /** Instancia de express */
  private _app: Application;

  /** Ruta base de la aplicación */
  private _api_route: string = process.env.API_BASE_ROUTE ?? "";

  /** Ruta de los controladores */
  private _controllers_route: string = process.env.CONTROLLERS ?? "";
  
  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Propiedad que contiene nuestro contenedor de dependencias */
  private _container: AwilixContainer;

  constructor(app:Application){
    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MANAGER,
      entityName: "ServiceManager"
    });

    // Instanciamos la app de express
    this._app = app;

    // Creamos el contenedor de dependencias
    this._container = createContainer({
      injectionMode: InjectionMode.PROXY,
      strict: true,
    });

  }

  /** Agrega los controladores a la aplicación de express */
  public AddControllers =  async () : Promise<void> => {
    try {
      this._logger.Activity("AddControllers");
      this._app.use(scopePerRequest(this._container));
      this._app.use(
        this._api_route, 
        loadControllers(this._controllers_route, { cwd: __dirname})
      );
    }
    catch(err:any){
      this._logger.Error(LoggerTypes.FATAL, "AddControllers", err);
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

  /** Método que permite agregar un servicio al contenedor */
  public AddService = <I = any, T extends I = any>(
    name: string,
    implementation: new (...args: any[]) => T,
    lifetime: LifetimeType = Lifetime.SCOPED
  )=> {
    try {
     // this._logger.Activity(`AddService`);
      
      // Registrar la implementación asociada a la interfaz
      this._container?.register(
        name, 
        asClass<T>(implementation, { lifetime })
      );
  
    } catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "AddService", err);
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

  /** Permite registrar la instancia de una clase como singleton */
  public AddInstance = <K, T extends K>(name:string, implementation:T) => {
    try {
     // this._logger.Activity(`AddInstance`);
      
      // Registrar la implementación asociada a la interfaz
      this._container?.register(
        name, 
        asValue<T>(implementation)
      );
  
    } catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "AddService", err);
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

  /** Método que permite resolver servicios */
  public Resolve<T>(serviceName: string): T {
    try {
      this._logger.Message(LoggerTypes.INFO,`Resolviendo servicio: ${serviceName}`);
      return this._container?.resolve<T>(serviceName) as T;
    } catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, `No se pudo resolver el servicio: ${serviceName}`, err);
      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

  /** Agrega un middleware a la aplicación */
  public AddMiddleware = (middleware:ApplicationMiddleware) => {
    this._logger.Activity(`AddMiddleware`);
    this._app.use(middleware.Init() as RequestHandler | ErrorRequestHandler);
  }

  /** Agrega el middleware de autorización del sistema */
  public AddAuthorization = (middleware: ApplicationMiddleware) => {
    this._logger.Activity(`AddAuthorization`);
    this.AddMiddleware(middleware);
  }

   /** Agrega el middleware de autenticación del sistema */
   public AddAuthentication = (middleware: ApplicationMiddleware) => {
    this._logger.Activity(`AddAuthentication`);
    this.AddMiddleware(middleware);
  }

  /** Permite configurar el contexto de la aplicación */
  public AddAplicationContext = (middleware: ApplicationMiddleware) => {
    this._logger.Activity(`AddAplicationContext`);
    this.AddMiddleware(middleware);
  }

  /** 
   * @param {DatabaseStrategyDirector} dbManager - Manejador de base de datos
   * @param {IDBConnectionStrategy} strategy - Estrategia de connección a base de datos
   * @description - Reliza la connección a la base de datos en base a la estrategia 
   * definida y devuelve la instancia de la conección a la DB.
  */
  public AddDataBaseConnection = async <ConnectionType, InstanceType>(
    dbManager: DatabaseStrategyDirector<any, any>|null = null,
    strategy: IDBConnectionStrategy<ConnectionType, InstanceType>
  ) : Promise<DatabaseStrategyDirector<ConnectionType, InstanceType>> => {
    try {
      this._logger.Activity(`AddDataBaseConnection`);

      // se inserta la estrategia al DatabaseManager
      const databaseManager = new DatabaseStrategyDirector({ strategy });
      
      // Se inicia la conección a la base de datos
      await databaseManager.Connect();
   
      // Agrega la instancia de la base de datos al contenedor de dependencias
      this.AddInstance("database", databaseManager.GetInstance());

      /** Se pasa por referencia el objeto databaseManager */
      dbManager = databaseManager;
      return databaseManager;
    }
    catch(err:any){
      this._logger.Error("FATAL", "AddDataBaseConnection", err);

      throw new ApplicationException(
        err.message,
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError,
        NO_REQUEST_ID,
        __filename,
        err
      );
    }
  }

}