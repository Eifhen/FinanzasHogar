import { Server } from "http";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../Managers/LoggerManager";
import express, { Application } from "express";
import ServiceManager from "../Managers/ServiceManager";
import ServerConfig from "../Configurations/ServerConfig";
import IApplicationStart from "./types/IApplicationStart";
import { AutoBind } from "../Decorators/AutoBind";


interface IApplicationServerDependencies {
  startupBuilder: IApplicationStart;
}

export default class ApplicationServer {

  /** Objeto server, este objeto nos sirve para manipular nuestro servidor*/
  private _server?: Server;

  /** Instancia de express */
  private _app: Application;

  /** Puerto de ejecución */
  private _PORT: number = Number(process.env.PORT ?? 0);

  /** Instancia del startup */
  private _startup: IApplicationStart;

  /** Instancia del logger */
  private _logger: ILoggerManager;

  /** Manejador de servicios */
  private _serviceManager: ServiceManager; 

  /**  Manejador de configuración del servidor */
  private _serverConfig: ServerConfig;


  constructor(deps: IApplicationServerDependencies) {

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.CONFIGURATION,
      entityName: "ApplicationServer"
    });

    // Instanciamos la app de express
    this._app = express();

    // Instanciamos el StartupBuilder
    this._startup = deps.startupBuilder;

    // Instanciamos el manejador de servicios
    this._serviceManager = new ServiceManager(this._app);

    // Instanciamos la configuración del server
    this._serverConfig = new ServerConfig(this._app);
  }

  /** Este evento se ejecuta si algún error no fue manejado por la app */
  private OnUncaughtException (){
    process.on("uncaughtException", (err: Error) => {

      this._logger.Error(LoggerTypes.FATAL, "OnUncaughtException", {
        message: err.message,
        stack: err.stack
      });

      /** Se hace un cleanup de cualquier funcionalidad que se esté ejecutando  */
      this._startup.OnApplicationCriticalException(err, this._serviceManager);

      this.CloseServer();
    })
  }

  /** Este evento se ejecuta si alguna promesa es rechazada y no fue manejada con un catch */
  private OnUnhandledRejection (){
    process.on('unhandledRejection', (reason: any, promise: any) => {
      // Obtener más detalles de la razón del rechazo
      let reasonDetails;
      if (reason instanceof Error) {
        reasonDetails = {
          ...reason,
          message: reason.message,
          stack: reason.stack,
        };
      } else {
        reasonDetails = reason;
      }

      // Loggear la razón y la promesa
      const data = {
        reason: reasonDetails,
        promise: promise
      };

      this._logger.Error(LoggerTypes.FATAL, "OnUnhandledRejection", data);
      this._startup.OnApplicationCriticalException(data, this._serviceManager);
      this.CloseServer();
    });
  }


  /** Permite cerrar el servidor */
  private CloseServer (){
    if (this._server) {
      /** Cerrar el servidor de manera controlada  */
      this._logger.Message(LoggerTypes.WARN, `El servidor procederá a cerrarse =>`);
      this._server.close(() => {
        this._logger.Message(LoggerTypes.WARN, `El servidor ha sido cerrado =>`);
        process.exit(1); // Salir del proceso con código de error
      });
    } else {
      /** Si no hay servidor, simplemente terminamos el proceso */
      this._logger.Message(LoggerTypes.WARN, `Cerrando Proceso =>`);
      process.exit(1);
    }
  }

  /** Está función da inicio al servidor */
  @AutoBind
  public async Start (){
    try {
      this._logger.Activity("START");

      // Eliminar listeners existentes para evitar duplicados
      process.removeAllListeners("uncaughtException");
      process.removeAllListeners("unhandledRejection");

      // Registrar eventos nuevamente
      this.OnUncaughtException();
      this.OnUnhandledRejection();

      // Se ejecuta el Startup
      await this._startup.Configuration(this._serverConfig);
      await this._startup.ConfigurationServices(this._serviceManager);

      this._server = this._app.listen(this._PORT, () => {
        this._logger.Message(LoggerTypes.INFO, `El servidor está corriendo en el puerto ${this._PORT}`);
      });
    }
    catch (err: any) {
      this._logger.Error(LoggerTypes.FATAL, "Start", err);
      throw err;
    }
  }
}